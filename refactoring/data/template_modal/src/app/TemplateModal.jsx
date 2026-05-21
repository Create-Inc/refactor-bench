import { useState } from "react";
import { LayoutTemplate } from "lucide-react";
import { ModalLayout } from "./ModalLayout";

export function TemplateModal({
  templates,
  projects,
  phases,
  onClose,
  onSaveTemplate,
  onApplyTemplate,
}) {
  const [view, setView] = useState("list"); // 'list' or 'create' or 'apply'
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#3b82f6");

  // For creating templates from existing projects
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id || "",
  );

  const handleCreateTemplate = (e) => {
    e.preventDefault();
    const selectedProject = projects.find(
      (p) => p.id === parseInt(selectedProjectId),
    );
    const projectPhases = phases.filter(
      (ph) => ph.project_id === parseInt(selectedProjectId),
    );

    const templateData = {
      default_color: selectedProject?.color || "#3b82f6",
      phases: projectPhases.map((ph) => ({
        name: ph.name,
        phase_order: ph.phase_order,
        complexity: ph.complexity,
        phase_type: ph.phase_type,
        effort_category: ph.effort_category,
        notes: ph.notes,
      })),
    };

    onSaveTemplate({
      name: templateName,
      description: templateDescription,
      template_data: templateData,
    });

    setView("list");
    setTemplateName("");
    setTemplateDescription("");
  };

  const handleApplyTemplate = (e) => {
    e.preventDefault();
    onApplyTemplate({
      templateId: selectedTemplateId,
      projectName: newProjectName,
      projectColor: newProjectColor,
    });
    setView("list");
    setNewProjectName("");
  };

  return (
    <ModalLayout title="Project Templates" onClose={onClose}>
      {view === "list" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setView("create")}
              className="flex-1 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <LayoutTemplate
                size={40}
                className="mx-auto mb-3 text-gray-300"
              />
              <p>No templates yet. Create one to standardize your planning!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                      {template.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {template.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {template.template_data?.phases?.length || 0} phases
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTemplateId(template.id);
                        setView("apply");
                      }}
                      className="ml-3 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === "create" && (
        <form onSubmit={handleCreateTemplate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Name
            </label>
            <input
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Standard Web Project"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              rows={2}
              placeholder="Brief description of when to use this template"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base on Existing Project
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md outline-none"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (
                  {phases.filter((ph) => ph.project_id === p.id).length} phases)
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView("list")}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
            >
              Create Template
            </button>
          </div>
        </form>
      )}

      {view === "apply" && (
        <form onSubmit={handleApplyTemplate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Project Name
            </label>
            <input
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#ef4444",
                "#8b5cf6",
                "#ec4899",
                "#64748b",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${newProjectColor === c ? "border-gray-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setNewProjectColor(c)}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView("list")}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
            >
              Apply Template
            </button>
          </div>
        </form>
      )}
    </ModalLayout>
  );
}
