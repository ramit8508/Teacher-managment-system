import { useState, useEffect } from 'react';
import { authAPI } from '../api';

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    subject: '',
    phone: '',
    address: '',
    role: 'teacher',
  });

  // Super Admin email - only this email can promote users to admin
  const SUPER_ADMIN_EMAIL = 'admin@school.com';
  const isSuperAdmin = currentUser?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setCurrentUser(response.data.data);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers({ role: 'teacher' });
      setTeachers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      alert('Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async (teacherId, currentStatus) => {
    const action = currentStatus ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} this teacher?`)) return;

    try {
      await authAPI.updateUser(teacherId, { isBlocked: !currentStatus });
      alert(`Teacher ${action}ed successfully!`);
      fetchTeachers();
    } catch (error) {
      console.error(`Error ${action}ing teacher:`, error);
      console.error('Full error:', error.response?.data);
      alert(error.response?.data?.message || `Failed to ${action} teacher`);
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher({
      id: teacher._id,
      fullName: teacher.fullName,
      email: teacher.email,
      username: teacher.username,
      subject: teacher.subject || '',
      phone: teacher.phone || '',
      address: teacher.address || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await authAPI.updateUser(editingTeacher.id, {
        fullName: editingTeacher.fullName,
        email: editingTeacher.email,
        username: editingTeacher.username,
        subject: editingTeacher.subject,
        phone: editingTeacher.phone,
        address: editingTeacher.address,
      });
      alert('Teacher updated successfully!');
      setShowEditModal(false);
      fetchTeachers();
    } catch (error) {
      console.error('Error updating teacher:', error);
      console.error('Full error:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to update teacher');
    }
  };

  const handleAddTeacher = async () => {
    try {
      if (!newTeacher.fullName || !newTeacher.email || !newTeacher.username || !newTeacher.password || !newTeacher.subject) {
        alert('Please fill all required fields (Name, Email, Username, Password, Subject)');
        return;
      }
      
      await authAPI.register(newTeacher);
      alert('Teacher added successfully!');
      setShowAddModal(false);
      setNewTeacher({
        fullName: '',
        email: '',
        username: '',
        password: '',
        subject: '',
        phone: '',
        address: '',
        role: 'teacher',
      });
      fetchTeachers();
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert(error.response?.data?.message || 'Failed to add teacher');
    }
  };

  const handleDelete = async (teacherId) => {
    if (!confirm('Are you sure you want to delete this teacher? This action cannot be undone!')) return;

    try {
      await authAPI.deleteUser(teacherId);
      alert('Teacher deleted successfully!');
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      console.error('Full error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to delete teacher');
    }
  };

  const handlePromoteToAdmin = async (teacherId, teacherName) => {
    if (!isSuperAdmin) {
      alert('Only Super Admin can promote users to Admin role!');
      return;
    }

    if (!confirm(`Are you sure you want to promote ${teacherName} to Admin?\n\nThey will have full administrative access.`)) return;

    try {
      await authAPI.updateUser(teacherId, { role: 'admin' });
      alert(`${teacherName} has been promoted to Admin successfully!`);
      fetchTeachers();
    } catch (error) {
      console.error('Error promoting to admin:', error);
      console.error('Full error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to promote user to admin');
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Manage Teachers</h1>
            <p className="text-sm sm:text-base text-gray-600">View, edit, block, or remove teachers</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <span>➕</span>
            <span className="hidden sm:inline">Add Teacher</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search teachers by name, email, or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teachers...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <p className="text-sm text-gray-600">Total Teachers</p>
              <p className="text-2xl font-bold text-blue-600">{teachers.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <p className="text-sm text-gray-600">Active Teachers</p>
              <p className="text-2xl font-bold text-green-600">
                {teachers.filter(t => !t.isBlocked).length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg border border-red-200 p-4">
              <p className="text-sm text-gray-600">Blocked Teachers</p>
              <p className="text-2xl font-bold text-red-600">
                {teachers.filter(t => t.isBlocked).length}
              </p>
            </div>
          </div>

          {/* Teachers Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase hidden lg:table-cell">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase hidden md:table-cell">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase hidden sm:table-cell">Username</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                        No teachers found
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher) => (
                      <tr key={teacher._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {teacher.fullName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{teacher.fullName}</p>
                              <p className="text-xs text-gray-500 md:hidden">{teacher.subject || 'No subject'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">{teacher.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                            {teacher.subject || 'Not specified'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{teacher.username}</td>
                        <td className="px-4 py-3">
                          {teacher.isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                              Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(teacher)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            {isSuperAdmin && teacher.role !== 'admin' && (
                              <button
                                onClick={() => handlePromoteToAdmin(teacher._id, teacher.fullName)}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                                title="Promote to Admin"
                              >
                                👑
                              </button>
                            )}
                            <button
                              onClick={() => handleBlockUnblock(teacher._id, teacher.isBlocked)}
                              className={`p-1.5 rounded ${
                                teacher.isBlocked
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-orange-600 hover:bg-orange-50'
                              }`}
                              title={teacher.isBlocked ? 'Unblock' : 'Block'}
                            >
                              {teacher.isBlocked ? '✓' : '🚫'}
                            </button>
                            <button
                              onClick={() => handleDelete(teacher._id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Teacher</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingTeacher.fullName}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingTeacher.email}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editingTeacher.username}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject/Department</label>
                <input
                  type="text"
                  value={editingTeacher.subject}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Mathematics, Science, English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={editingTeacher.phone}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={editingTeacher.address}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="Optional"
                  rows="2"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Teacher</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTeacher.fullName}
                  onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTeacher.username}
                  onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject/Department <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTeacher.subject}
                  onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g., Mathematics, Science, English"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">What subject does this teacher teach?</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={newTeacher.address}
                  onChange={(e) => setNewTeacher({ ...newTeacher, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                  placeholder="Optional"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newTeacher.role}
                  onChange={(e) => setNewTeacher({ ...newTeacher, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddTeacher}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Add Teacher
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
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

export default AdminTeachers;
