import React, { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { modifyUser } from "@/api/admin";

export function AdminUsers({
  usersList = [],
  usersLoading = false,
  onUserMutated,
}) {
  const [searchUserQuery, setSearchUserQuery] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [inspectingUser, setInspectingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formValues, setFormValues] = useState({ username: "", email: "", role: "CUSTOMER" });

  const filteredUsers = useMemo(() => {
    if (!searchUserQuery.trim()) return usersList;
    const q = searchUserQuery.toLowerCase().trim();
    return usersList.filter(
      (u) =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.userId && u.userId.toString().includes(q))
    );
  }, [usersList, searchUserQuery]);

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormValues({
      username: u.username || "",
      email: u.email || "",
      role: u.role || "CUSTOMER",
    });
  };

  const handleModifySubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await modifyUser(editingUser.userId, formValues);
      alert("User updated successfully!");
      setEditingUser(null);
      if (onUserMutated) onUserMutated();
    } catch (err) {
      alert(err.message || "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-up">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Accounts Directory</h2>
        <p className="text-xs text-slate-400">View user directories and manage staff roles.</p>
      </div>

      {/* Filtering Toolbar */}
      <div className="flex bg-white border border-slate-205 p-4 rounded-2xl shadow-xs">
        <div className="flex-grow relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search accounts directory by Username, Email or ID..."
            value={searchUserQuery}
            onChange={(e) => setSearchUserQuery(e.target.value)}
            className="text-xs h-10 pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      {usersLoading ? (
        <div className="text-center py-12 text-slate-500 italic">User index compiling...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-slate-205 rounded-2xl p-10 text-center text-slate-400 italic">
          No accounts found matching search string.
        </div>
      ) : (
        <div className="bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">User ID</th>
                  <th className="p-4">Username</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Security Role</th>
                  <th className="p-4">Creation Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.userId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs text-slate-500">#{u.userId}</td>
                    <td className="p-4 font-bold text-slate-800">{u.username}</td>
                    <td className="p-4 text-xs font-semibold text-slate-600">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === "ADMIN"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400 font-semibold">
                      {new Date(u.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <Button
                        onClick={() => setInspectingUser(u)}
                        size="sm"
                        variant="outline"
                        className="text-[10px] font-bold h-8 cursor-pointer"
                      >
                        Details
                      </Button>
                      <Button
                        onClick={() => openEditModal(u)}
                        variant="secondary"
                        size="sm"
                        className="text-[10px] font-bold h-8 cursor-pointer bg-slate-850 text-white hover:bg-slate-700"
                      >
                        Edit Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect User Details Modal */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h3 className="text-base font-bold text-slate-900">User Account Details</h3>
              <button
                onClick={() => setInspectingUser(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2.5 text-xs">
              <p><span className="font-semibold text-slate-400">User ID:</span> #{inspectingUser.userId}</p>
              <p><span className="font-semibold text-slate-400">Username:</span> <strong className="text-slate-800">{inspectingUser.username}</strong></p>
              <p><span className="font-semibold text-slate-400">Email:</span> {inspectingUser.email}</p>
              <p><span className="font-semibold text-slate-400">Role:</span> <span className="font-bold text-[#00ABE4]">{inspectingUser.role}</span></p>
              <p><span className="font-semibold text-slate-400">Registered:</span> {new Date(inspectingUser.createdAt).toLocaleString()}</p>
            </div>
            <Button
              onClick={() => {
                const u = inspectingUser;
                setInspectingUser(null);
                openEditModal(u);
              }}
              className="w-full text-xs font-bold h-9"
            >
              Modify Role / Account
            </Button>
          </div>
        </div>
      )}

      {/* Edit Role / Account Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-3">
              <h3 className="text-base font-bold text-slate-900">Modify User #{editingUser.userId}</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                <Input
                  type="text"
                  required
                  value={formValues.username}
                  onChange={(e) => setFormValues({ ...formValues, username: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <Input
                  type="email"
                  required
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                  className="text-xs h-9"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Security Role</label>
                <select
                  value={formValues.role}
                  onChange={(e) => setFormValues({ ...formValues, role: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-350 bg-white px-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00ABE4]"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 text-xs font-bold h-10 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 text-xs font-bold h-10 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Role"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
