import { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const ManageAdmins = () => {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    subject: '',
    phone: '',
    address: '',
    role: 'admin',
  });

  // Super Admin email - only this email can manage admins
  const SUPER_ADMIN_EMAIL = 'admin@school.com';
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (!isSuperAdmin) {
      alert('Access Denied: Only Super Admin can manage admins');
      return;
    }
    fetchAdmins();
  }, [isSuperAdmin]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers({ role: 'admin' });
      setAdmins(response.data.data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      alert('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId, adminName, adminEmail) => {
    if (adminEmail === SUPER_ADMIN_EMAIL) {
      alert('Cannot remove Super Admin!');
      return;
    }

    if (!confirm(`Remove admin privileges from ${adminName}?\n\nThey will be demoted to Teacher role.`)) return;

    try {
      await authAPI.updateUser(adminId, { role: 'teacher' });
      alert(`${adminName} has been demoted to Teacher role`);
      fetchAdmins();
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Failed to remove admin privileges');
    }
  };

  const handleAddAdmin = async () => {
    try {
      if (!newAdmin.fullName || !newAdmin.email || !newAdmin.username || !newAdmin.password || !newAdmin.subject) {
        alert('Please fill all required fields (Name, Email, Username, Password, Subject)');
        return;
      }
      
      await authAPI.register(newAdmin);
      alert('Admin added successfully!');
      setShowAddModal(false);
      setNewAdmin({
        fullName: '',
        email: '',
        username: '',
        password: '',
        subject: '',
        phone: '',
        address: '',
        role: 'admin',
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error adding admin:', error);
      alert(error.response?.data?.message || 'Failed to add admin');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl">🚫</span>
          <h2 className="text-xl font-bold text-red-800 mt-4">Access Denied</h2>
          <p className="text-red-600 mt-2">Only Super Admin can manage administrators</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Manage Administrators</h1>
          <p className="text-sm sm:text-base text-gray-600">
            View and manage admin users. Only Super Admin can access this page.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium text-sm flex items-center gap-2"
        >
          <span>➕</span>
          <span>Add Admin</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading administrators...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
              <p className="text-sm text-gray-600">Total Admins</p>
              <p className="text-2xl font-bold text-purple-600">{admins.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
              <p className="text-sm text-gray-600">Super Admins</p>
              <p className="text-2xl font-bold text-yellow-600">
                {admins.filter(a => a.email === SUPER_ADMIN_EMAIL).length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <p className="text-sm text-gray-600">Regular Admins</p>
              <p className="text-2xl font-bold text-blue-600">
                {admins.filter(a => a.email !== SUPER_ADMIN_EMAIL).length}
              </p>
            </div>
          </div>

          {/* Admins Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase hidden sm:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase hidden md:table-cell">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                        No administrators found
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600">
                                {admin.fullName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{admin.fullName}</p>
                              {admin.email === SUPER_ADMIN_EMAIL && (
                                <span className="text-xs text-yellow-600 font-semibold">⭐ Super Admin</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{admin.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{admin.username}</td>
                        <td className="px-4 py-3">
                          {admin.email === SUPER_ADMIN_EMAIL ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                              👑 Super Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              🛡️ Admin
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {admin.email !== SUPER_ADMIN_EMAIL && (
                              <button
                                onClick={() => handleRemoveAdmin(admin._id, admin.fullName, admin.email)}
                                className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                                title="Demote to Teacher"
                              >
                                ⬇️ Demote
                              </button>
                            )}
                            {admin.email === SUPER_ADMIN_EMAIL && (
                              <span className="px-3 py-1 text-xs bg-gray-100 text-gray-500 rounded font-medium">
                                Protected
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Admin Management Info</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• <strong>Super Admin:</strong> Can add/remove other admins (protected from removal)</li>
              <li>• <strong>Regular Admin:</strong> Can manage teachers and students (can be demoted to teacher)</li>
              <li>• To promote a teacher to admin, go to "Manage Teachers" and click the 👑 icon</li>
              <li>• Super Admin status can only be set in the database</li>
            </ul>
          </div>
        </>
      )}

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Administrator</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAdmin.fullName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject/Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAdmin.subject}
                  onChange={(e) => setNewAdmin({ ...newAdmin, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  placeholder="e.g., Administration, IT, Management"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={newAdmin.phone}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newAdmin.address}
                  onChange={(e) => setNewAdmin({ ...newAdmin, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                  placeholder="Optional"
                  rows="2"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddAdmin}
                className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 font-medium"
              >
                Add Admin
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewAdmin({
                    fullName: '',
                    email: '',
                    username: '',
                    password: '',
                    subject: '',
                    phone: '',
                    address: '',
                    role: 'admin',
                  });
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAdmins;
