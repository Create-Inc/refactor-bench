import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

const emptyForm = {
  code: "",
  name: "",
  parent_code: "",
  manager_name: "",
  manager_email: "",
  budget_owner: "",
  description: "",
  permissions: {
    approve_budget: false,
    invite_members: false,
    publish_reports: false,
  },
};

const permissionLabels = {
  approve_budget: "Approve budget",
  invite_members: "Invite members",
  publish_reports: "Publish reports",
};

function buildDepartmentTree(departments) {
  const childrenByParent = new Map();
  const byCode = new Map();

  departments.forEach((department) => {
    byCode.set(department.code, department);
    const parentCode = department.parent_code || "";
    const children = childrenByParent.get(parentCode) || [];
    children.push(department);
    childrenByParent.set(parentCode, children);
  });

  const roots = departments.filter((department) => {
    const parentCode = department.parent_code || "";
    return !parentCode || !byCode.has(parentCode);
  });

  return { roots, childrenByParent };
}

export function DepartmentsTab({ departments, loading, onRefresh, setSaveMessage, setError }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedCodes, setExpandedCodes] = useState(() => new Set());
  const [formData, setFormData] = useState(emptyForm);

  const { roots, childrenByParent } = useMemo(
    () => buildDepartmentTree(departments),
    [departments],
  );

  const totals = useMemo(
    () =>
      departments.reduce(
        (summary, department) => ({
          active: summary.active + (department.is_active ? 1 : 0),
          employees: summary.employees + (department.employee_count || 0),
          managed: summary.managed + (department.manager_name ? 1 : 0),
        }),
        { active: 0, employees: 0, managed: 0 },
      ),
    [departments],
  );

  const resetForm = () => {
    setFormData(emptyForm);
  };

  const updatePermission = (permission, checked) => {
    setFormData((current) => ({
      ...current,
      permissions: {
        ...current.permissions,
        [permission]: checked,
      },
    }));
  };

  const toggleExpanded = (code) => {
    setExpandedCodes((current) => {
      const next = new Set(current);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleAdd = async () => {
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add department");
        return;
      }

      setShowAddModal(false);
      resetForm();
      setSaveMessage("Department added successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
      onRefresh();
    } catch {
      setError("Failed to add department");
    }
  };

  const renderDepartment = (department, depth = 0) => {
    const children = childrenByParent.get(department.code) || [];
    const isExpanded = expandedCodes.has(department.code);
    const enabledPermissions = Object.entries(department.permissions || {})
      .filter(([, enabled]) => enabled)
      .map(([permission]) => permissionLabels[permission] || permission);

    return (
      <div key={department.id}>
        <div
          className="grid grid-cols-[minmax(220px,1.4fr)_1fr_1fr_140px] gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50"
          style={{ paddingLeft: `${20 + depth * 28}px` }}
          data-testid={`department-row-${department.code}`}
        >
          <div className="flex items-start gap-3">
            {children.length > 0 ? (
              <button
                type="button"
                onClick={() => toggleExpanded(department.code)}
                aria-label={`${isExpanded ? "Collapse" : "Expand"} ${department.name}`}
                className="mt-1 text-gray-500 hover:text-gray-900"
              >
                {isExpanded ? "v" : ">"}
              </button>
            ) : (
              <span className="mt-1 w-3 text-gray-300">-</span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold text-gray-900">
                  {department.code}
                </span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    department.is_active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {department.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="font-medium text-gray-900 mt-1">{department.name}</div>
              {department.description && (
                <div className="text-sm text-gray-500 mt-1">{department.description}</div>
              )}
              {children.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {children.length} child department
                  {children.length === 1 ? "" : "s"}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-900">
              {department.manager_name || "No manager assigned"}
            </div>
            {department.manager_email && (
              <div className="text-xs text-gray-500">{department.manager_email}</div>
            )}
          </div>

          <div>
            <div className="text-sm text-gray-900">
              {enabledPermissions.length
                ? enabledPermissions.join(", ")
                : "No elevated permissions"}
            </div>
            {department.budget_owner && (
              <div className="text-xs text-gray-500 mt-1">
                Budget owner: {department.budget_owner}
              </div>
            )}
          </div>

          <div className="text-sm text-gray-700">{department.employee_count || 0} members</div>
        </div>

        {isExpanded && children.map((child) => renderDepartment(child, depth + 1))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Departments</h2>
          <p className="text-gray-600 mt-1">
            Manage reporting hierarchy, owners, and delegated permissions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs uppercase font-semibold text-gray-500">
                Active Departments
              </div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{totals.active}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs uppercase font-semibold text-gray-500">Covered Teams</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{totals.managed}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs uppercase font-semibold text-gray-500">Total Members</div>
              <div className="text-2xl font-semibold text-gray-900 mt-1">{totals.employees}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-[minmax(220px,1.4fr)_1fr_1fr_140px] gap-4 px-5 py-3 border-b border-gray-200 bg-gray-50">
              <div className="text-xs font-semibold text-gray-600 uppercase">Department</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Manager</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Permissions</div>
              <div className="text-xs font-semibold text-gray-600 uppercase">Size</div>
            </div>
            <div>{roots.map((department) => renderDepartment(department))}</div>
          </div>
        </>
      )}

      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Department</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., ENG-PLAT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., Platform Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Department
                </label>
                <select
                  aria-label="Parent Department"
                  value={formData.parent_code}
                  onChange={(e) => setFormData({ ...formData, parent_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value="">Top level</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.code}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Owner</label>
                <input
                  type="text"
                  value={formData.budget_owner}
                  onChange={(e) => setFormData({ ...formData, budget_owner: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., Finance Ops"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                <input
                  type="text"
                  value={formData.manager_name}
                  onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., Jane Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Email
                </label>
                <input
                  type="email"
                  value={formData.manager_email}
                  onChange={(e) => setFormData({ ...formData, manager_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  placeholder="e.g., jane@company.com"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                rows={3}
                placeholder="Responsibilities and reporting notes..."
              />
            </div>

            <fieldset className="mt-4 border border-gray-200 rounded-lg p-3">
              <legend className="px-1 text-sm font-medium text-gray-700">
                Delegated Permissions
              </legend>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(permissionLabels).map(([permission, label]) => (
                  <label key={permission} className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formData.permissions[permission]}
                      onChange={(e) => updatePermission(permission, e.target.checked)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex items-center gap-3 justify-end mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Add Department
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
