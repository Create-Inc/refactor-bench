import { useState } from "react";
import { Plus } from "lucide-react";
import { LoadingSpinner } from "./LoadingSpinner";

export function TeamMembersTab({
  users,
  departments,
  accountCodes,
  loading,
  onRefresh,
  setSaveMessage,
  setError,
}) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "viewer",
    department_access: [],
    account_code_access: [],
  });

  const roles = [
    {
      value: "owner",
      label: "Owner",
      description: "Full access to everything",
    },
    {
      value: "admin",
      label: "Admin",
      description: "Full access to everything",
    },
    {
      value: "executive",
      label: "Executive",
      description:
        "See all contracts in assigned departments, including executive-only",
    },
    {
      value: "manager",
      label: "Manager",
      description: "Edit contracts in assigned departments (non-restricted)",
    },
    {
      value: "viewer",
      label: "Viewer",
      description: "View contracts in assigned departments (non-restricted)",
    },
  ];

  const handleInvite = async () => {
    if (!formData.email || !formData.name) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to invite user");
        return;
      }

      setShowInviteModal(false);
      setFormData({
        name: "",
        email: "",
        role: "viewer",
        department_access: [],
        account_code_access: [],
      });
      setSaveMessage("User invited successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
      onRefresh();
    } catch (error) {
      setError("Failed to invite user");
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: formData.role,
          department_access: formData.department_access,
          account_code_access: formData.account_code_access,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update user");
        return;
      }

      setShowEditModal(false);
      setSelectedUser(null);
      setSaveMessage("User updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
      onRefresh();
    } catch (error) {
      setError("Failed to update user");
    }
  };

  const handleRemove = async (userId) => {
    if (!confirm("Are you sure you want to remove this user?")) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        setError("Failed to remove user");
        return;
      }

      setSaveMessage("User removed successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
      onRefresh();
    } catch (error) {
      setError("Failed to remove user");
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department_access: user.department_access || [],
      account_code_access: user.account_code_access || [],
    });
    setShowEditModal(true);
  };

  const removeDepartment = (dept) => {
    setFormData({
      ...formData,
      department_access: formData.department_access.filter((d) => d !== dept),
    });
  };

  const removeAccountCode = (code) => {
    setFormData({
      ...formData,
      account_code_access: formData.account_code_access.filter(
        (c) => c !== code,
      ),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Team Members</h2>
          <p className="text-gray-600 mt-1">
            Manage user access and permissions
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          <Plus size={18} />
          Invite User
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Access Control:</strong> Users can only see contracts in their
          assigned departments and account codes. Executives see all contracts
          (including restricted ones) in their departments.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Role
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Departments
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Account Codes
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.department_access &&
                    user.department_access.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.department_access.map((dept) => (
                          <span
                            key={dept}
                            className="inline-flex px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
                          >
                            {dept}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">All</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.account_code_access &&
                    user.account_code_access.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.account_code_access.slice(0, 3).map((code) => (
                          <span
                            key={code}
                            className="inline-flex px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700"
                          >
                            {code}
                          </span>
                        ))}
                        {user.account_code_access.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{user.account_code_access.length - 3} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">All</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        user.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {user.status || "active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemove(user.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite User Modal */}
      {showInviteModal && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowInviteModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Invite Team Member
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="john@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Departments
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Leave empty for all departments
                </p>
                <select
                  onChange={(e) => {
                    const dept = e.target.value;
                    if (dept && !formData.department_access.includes(dept)) {
                      setFormData({
                        ...formData,
                        department_access: [
                          ...formData.department_access,
                          dept,
                        ],
                      });
                    }
                    e.target.value = "";
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 mb-2"
                >
                  <option value="">Select department...</option>
                  {departments
                    .filter(
                      (d) =>
                        d.is_active &&
                        !formData.department_access.includes(d.code),
                    )
                    .map((dept) => (
                      <option key={dept.id} value={dept.code}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                </select>
                {formData.department_access.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.department_access.map((dept) => (
                      <span
                        key={dept}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {dept}
                        <button
                          onClick={() => removeDepartment(dept)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Account Codes
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Leave empty for all account codes
                </p>
                <select
                  onChange={(e) => {
                    const code = e.target.value;
                    if (code && !formData.account_code_access.includes(code)) {
                      setFormData({
                        ...formData,
                        account_code_access: [
                          ...formData.account_code_access,
                          code,
                        ],
                      });
                    }
                    e.target.value = "";
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 mb-2"
                >
                  <option value="">Select account code...</option>
                  {accountCodes
                    .filter(
                      (ac) =>
                        ac.is_active &&
                        !formData.account_code_access.includes(ac.code),
                    )
                    .map((code) => (
                      <option key={code.id} value={code.code}>
                        {code.code} - {code.name}
                      </option>
                    ))}
                </select>
                {formData.account_code_access.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.account_code_access.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700"
                      >
                        {code}
                        <button
                          onClick={() => removeAccountCode(code)}
                          className="hover:bg-emerald-200 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Invite User
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowEditModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Edit User: {selectedUser.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Departments
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Leave empty for all departments
                </p>
                <select
                  onChange={(e) => {
                    const dept = e.target.value;
                    if (dept && !formData.department_access.includes(dept)) {
                      setFormData({
                        ...formData,
                        department_access: [
                          ...formData.department_access,
                          dept,
                        ],
                      });
                    }
                    e.target.value = "";
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 mb-2"
                >
                  <option value="">Select department...</option>
                  {departments
                    .filter(
                      (d) =>
                        d.is_active &&
                        !formData.department_access.includes(d.code),
                    )
                    .map((dept) => (
                      <option key={dept.id} value={dept.code}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                </select>
                {formData.department_access.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.department_access.map((dept) => (
                      <span
                        key={dept}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700"
                      >
                        {dept}
                        <button
                          onClick={() => removeDepartment(dept)}
                          className="hover:bg-blue-200 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned Account Codes
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Leave empty for all account codes
                </p>
                <select
                  onChange={(e) => {
                    const code = e.target.value;
                    if (code && !formData.account_code_access.includes(code)) {
                      setFormData({
                        ...formData,
                        account_code_access: [
                          ...formData.account_code_access,
                          code,
                        ],
                      });
                    }
                    e.target.value = "";
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 mb-2"
                >
                  <option value="">Select account code...</option>
                  {accountCodes
                    .filter(
                      (ac) =>
                        ac.is_active &&
                        !formData.account_code_access.includes(ac.code),
                    )
                    .map((code) => (
                      <option key={code.id} value={code.code}>
                        {code.code} - {code.name}
                      </option>
                    ))}
                </select>
                {formData.account_code_access.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.account_code_access.map((code) => (
                      <span
                        key={code}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700"
                      >
                        {code}
                        <button
                          onClick={() => removeAccountCode(code)}
                          className="hover:bg-emerald-200 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Update User
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
