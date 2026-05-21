import sql from "@/app/api/utils/sql";
import { applyDiffPatch } from "./diffPatcher";
import { trackFileChange } from "./fileTracking";

export async function processCommands(commands, projectId) {
  var validCommands = [];
  for (var vi = 0; vi < commands.length; vi++) {
    var cmd = commands[vi];
    if (!cmd.type || !cmd.path) continue;
    if (
      ["create", "edit", "diff", "delete", "move", "supabase"].indexOf(
        cmd.type,
      ) === -1
    )
      continue;
    if (
      (cmd.type === "create" || cmd.type === "edit" || cmd.type === "diff") &&
      typeof cmd.content !== "string"
    )
      continue;
    if (cmd.type === "move" && typeof cmd.content !== "string") continue;
    if (cmd.type === "supabase" && typeof cmd.content !== "string") continue;
    validCommands.push(cmd);
  }

  var totalLines = 0;
  for (var li = 0; li < validCommands.length; li++) {
    if (
      validCommands[li].type === "create" ||
      validCommands[li].type === "edit"
    ) {
      totalLines += (validCommands[li].content || "").split("\n").length;
    } else if (validCommands[li].type === "diff") {
      totalLines += (validCommands[li].content || "").split("\n").length;
    } else {
      totalLines += 1;
    }
  }

  var results = [];
  var diffResults = [];

  for (var ri = 0; ri < validCommands.length; ri++) {
    var c = validCommands[ri];
    try {
      if (c.type === "create" || c.type === "edit") {
        var r =
          await sql`INSERT INTO files (project_id, path, content) VALUES (${projectId}, ${c.path}, ${c.content}) ON CONFLICT (project_id, path) DO UPDATE SET content = ${c.content}, updated_at = NOW() RETURNING id, path`;
        results.push({
          success: true,
          action: c.type,
          path: c.path,
          summary: c.summary || "",
          file: r[0],
        });
        trackFileChange(projectId, c.path, c.type); // fire-and-forget
      } else if (c.type === "diff") {
        var existingFile =
          await sql`SELECT id, content FROM files WHERE project_id = ${projectId} AND path = ${c.path} LIMIT 1`;
        if (existingFile.length === 0) {
          results.push({
            success: false,
            action: "diff",
            path: c.path,
            error: "File not found for diff: " + c.path,
          });
          continue;
        }
        var patchResult = applyDiffPatch(
          existingFile[0].content || "",
          c.content,
        );
        if (patchResult.appliedCount > 0) {
          await sql`UPDATE files SET content = ${patchResult.content}, updated_at = NOW() WHERE project_id = ${projectId} AND path = ${c.path}`;
          var diffInfo = {
            success: true,
            action: "diff",
            path: c.path,
            summary:
              (c.summary || "") +
              " (" +
              patchResult.appliedCount +
              "/" +
              patchResult.patchCount +
              " patches applied)",
            patchCount: patchResult.patchCount,
            appliedCount: patchResult.appliedCount,
          };
          if (patchResult.errors.length > 0) {
            diffInfo.warnings = patchResult.errors;
          }
          results.push(diffInfo);
          diffResults.push(diffInfo);
          trackFileChange(projectId, c.path, "diff"); // fire-and-forget
        } else {
          results.push({
            success: false,
            action: "diff",
            path: c.path,
            error:
              "All patches failed to match. Errors: " +
              patchResult.errors.join("; "),
          });
        }
      } else if (c.type === "delete") {
        await sql`DELETE FROM files WHERE project_id = ${projectId} AND path = ${c.path}`;
        results.push({
          success: true,
          action: "delete",
          path: c.path,
          summary: c.summary || "",
        });
        trackFileChange(projectId, c.path, "delete"); // fire-and-forget
      } else if (c.type === "move") {
        var newPath = c.content;
        await sql`UPDATE files SET path = ${newPath}, updated_at = NOW() WHERE project_id = ${projectId} AND path = ${c.path}`;
        results.push({
          success: true,
          action: "move",
          path: c.path + " -> " + newPath,
          summary: c.summary || "",
        });
        trackFileChange(projectId, c.path, "move"); // fire-and-forget
        trackFileChange(projectId, newPath, "move_to"); // fire-and-forget
      } else if (c.type === "supabase") {
        var supaResult = await executeSupabaseCommand(projectId, c);
        results.push(supaResult);
      }
    } catch (cmdErr) {
      results.push({
        success: false,
        action: c.type,
        path: c.path,
        error: cmdErr.message,
      });
    }
  }

  return { results, diffResults, totalLines };
}

async function executeSupabaseCommand(projectId, command) {
  try {
    var supaConfig = JSON.parse(command.content);
    var supaAction = command.path;

    var supaProject = await sql(
      "SELECT supabase_url, supabase_anon_key FROM projects WHERE id = $1 LIMIT 1",
      [projectId],
    );

    if (
      !supaProject[0] ||
      !supaProject[0].supabase_url ||
      !supaProject[0].supabase_anon_key
    ) {
      return {
        success: false,
        action: "supabase:" + supaAction,
        path: supaConfig.tableName || supaConfig.table || supaAction,
        error: "Supabase is not connected to this project",
      };
    }

    var sUrl = supaProject[0].supabase_url;
    var sKey = supaProject[0].supabase_anon_key;
    var sHeaders = {
      apikey: sKey,
      Authorization: "Bearer " + sKey,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    };

    if (supaAction === "createTable") {
      return await createSupabaseTable(supaConfig, sUrl, sHeaders);
    } else if (supaAction === "insert") {
      return await insertSupabaseRows(supaConfig, sUrl, sHeaders);
    } else if (supaAction === "addColumn") {
      return await addSupabaseColumn(supaConfig, sUrl, sHeaders);
    } else if (supaAction === "dropTable") {
      return await dropSupabaseTable(supaConfig, sUrl, sHeaders);
    } else {
      return {
        success: false,
        action: "supabase:" + supaAction,
        path: supaAction,
        error: "Unknown Supabase action: " + supaAction,
      };
    }
  } catch (supaParseErr) {
    return {
      success: false,
      action: "supabase",
      path: command.path,
      error: "Invalid Supabase command config: " + supaParseErr.message,
    };
  }
}

async function createSupabaseTable(config, sUrl, sHeaders) {
  var tName = (config.tableName || "").replace(/[^a-zA-Z0-9_]/g, "");
  var cols = config.columns || [];
  var colDefs = [];
  for (var ci = 0; ci < cols.length; ci++) {
    var col = cols[ci];
    var cn = (col.name || "").replace(/[^a-zA-Z0-9_]/g, "");
    var ct = col.type || "text";
    var ce = "";
    if (col.primaryKey) ce += " PRIMARY KEY";
    if (col.notNull) ce += " NOT NULL";
    if (col.unique) ce += " UNIQUE";
    if (col.defaultValue !== undefined && col.defaultValue !== null) {
      var dv = col.defaultValue;
      var dvStr = typeof dv === "string" ? dv : String(dv);
      var dvLow = dvStr.toLowerCase().trim();
      if (
        dvLow === "now()" ||
        dvLow === "current_timestamp" ||
        dvLow === "gen_random_uuid()" ||
        dvLow === "true" ||
        dvLow === "false" ||
        dvLow === "null"
      ) {
        ce += " DEFAULT " + dvStr;
      } else if (typeof dv === "number") {
        ce += " DEFAULT " + dv;
      } else {
        ce += " DEFAULT '" + dvStr.replace(/'/g, "''") + "'";
      }
    }
    colDefs.push(cn + " " + ct + ce);
  }
  var createSQL =
    "CREATE TABLE IF NOT EXISTS " +
    tName +
    " (\n  " +
    colDefs.join(",\n  ") +
    "\n)";

  var ctRes = await fetch(sUrl + "/rest/v1/rpc/exec_sql", {
    method: "POST",
    headers: sHeaders,
    body: JSON.stringify({ query: createSQL }),
  });

  if (ctRes.ok) {
    /* Run RLS setup calls in parallel */
    await Promise.all([
      fetch(sUrl + "/rest/v1/rpc/exec_sql", {
        method: "POST",
        headers: sHeaders,
        body: JSON.stringify({
          query: "ALTER TABLE " + tName + " ENABLE ROW LEVEL SECURITY",
        }),
      }),
      fetch(sUrl + "/rest/v1/rpc/exec_sql", {
        method: "POST",
        headers: sHeaders,
        body: JSON.stringify({
          query:
            "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '" +
            tName +
            "' AND policyname = 'Allow all for anon') THEN EXECUTE 'CREATE POLICY \"Allow all for anon\" ON " +
            tName +
            " FOR ALL USING (true) WITH CHECK (true)'; END IF; END $$",
        }),
      }),
    ]);
    return {
      success: true,
      action: "supabase:createTable",
      path: tName,
      summary: "Created table '" + tName + "' with " + cols.length + " columns",
    };
  } else {
    var ctErrText = await ctRes.text();
    return {
      success: false,
      action: "supabase:createTable",
      path: tName,
      error:
        "Failed to create table. You may need to set up the exec_sql function. Error: " +
        ctErrText.substring(0, 200),
      setupSQL:
        "Run the setup SQL in your Supabase SQL Editor (see Supabase panel)",
    };
  }
}

async function insertSupabaseRows(config, sUrl, sHeaders) {
  var insTable = (config.table || "").replace(/[^a-zA-Z0-9_]/g, "");
  var insRows = config.rows || [];
  if (insTable && insRows.length > 0) {
    var insRes = await fetch(sUrl + "/rest/v1/" + insTable, {
      method: "POST",
      headers: sHeaders,
      body: JSON.stringify(insRows),
    });
    if (insRes.ok) {
      return {
        success: true,
        action: "supabase:insert",
        path: insTable,
        summary:
          "Inserted " + insRows.length + " row(s) into '" + insTable + "'",
      };
    } else {
      var insErrText = await insRes.text();
      return {
        success: false,
        action: "supabase:insert",
        path: insTable,
        error: "Insert failed: " + insErrText.substring(0, 200),
      };
    }
  }
  return {
    success: false,
    action: "supabase:insert",
    path: config.table || "unknown",
    error: "No table or rows specified",
  };
}

async function addSupabaseColumn(config, sUrl, sHeaders) {
  var altTable = (config.table || "").replace(/[^a-zA-Z0-9_]/g, "");
  var altCol = config.column || {};
  var altColName = (altCol.name || "").replace(/[^a-zA-Z0-9_]/g, "");
  var altSQL =
    "ALTER TABLE " +
    altTable +
    " ADD COLUMN IF NOT EXISTS " +
    altColName +
    " " +
    (altCol.type || "text");
  if (altCol.defaultValue !== undefined) {
    var adv = altCol.defaultValue;
    var advStr = typeof adv === "string" ? adv : String(adv);
    var advLow = advStr.toLowerCase().trim();
    if (
      advLow === "now()" ||
      advLow === "current_timestamp" ||
      advLow === "gen_random_uuid()" ||
      advLow === "true" ||
      advLow === "false" ||
      advLow === "null"
    ) {
      altSQL += " DEFAULT " + advStr;
    } else if (typeof adv === "number") {
      altSQL += " DEFAULT " + adv;
    } else {
      altSQL += " DEFAULT '" + advStr.replace(/'/g, "''") + "'";
    }
  }
  var altRes = await fetch(sUrl + "/rest/v1/rpc/exec_sql", {
    method: "POST",
    headers: sHeaders,
    body: JSON.stringify({ query: altSQL }),
  });
  if (altRes.ok) {
    return {
      success: true,
      action: "supabase:addColumn",
      path: altTable,
      summary: "Added column '" + altColName + "' to '" + altTable + "'",
    };
  } else {
    return {
      success: false,
      action: "supabase:addColumn",
      path: altTable,
      error: "Failed to add column. Ensure exec_sql function is set up.",
    };
  }
}

async function dropSupabaseTable(config, sUrl, sHeaders) {
  var dropT = (config.table || "").replace(/[^a-zA-Z0-9_]/g, "");
  var dropRes = await fetch(sUrl + "/rest/v1/rpc/exec_sql", {
    method: "POST",
    headers: sHeaders,
    body: JSON.stringify({
      query: "DROP TABLE IF EXISTS " + dropT + " CASCADE",
    }),
  });
  if (dropRes.ok) {
    return {
      success: true,
      action: "supabase:dropTable",
      path: dropT,
      summary: "Dropped table '" + dropT + "'",
    };
  } else {
    return {
      success: false,
      action: "supabase:dropTable",
      path: dropT,
      error: "Failed to drop table",
    };
  }
}
