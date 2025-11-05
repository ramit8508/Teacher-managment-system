import { useState, useEffect } from 'react';
import { authAPI, classAPI, feeAPI, examinationAPI } from '../api';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getAllUsers({ role: 'student' });
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      console.error('Full error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    try {
      // Fetch student's class
      const classesRes = await classAPI.getAllClasses();
      const studentClass = classesRes.data.data?.find(c => c.students?.some(s => s._id === studentId));

      // Fetch student's fees
      const feesRes = await feeAPI.getAllFees();
      const studentFees = feesRes.data.data?.filter(f => f.student?._id === studentId) || [];

      // Fetch student's exam scores
      const examsRes = await examinationAPI.getAllExaminations();
      const studentExams = examsRes.data.data?.filter(e => e.student?._id === studentId) || [];

      setStudentDetails({
        class: studentClass,
        fees: studentFees,
        exams: studentExams,
      });
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const handleViewDetails = async (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
    await fetchStudentDetails(student._id);
  };

  const handleEdit = (student) => {
    setEditingStudent({
      id: student._id,
      fullName: student.fullName,
      email: student.email,
      username: student.username,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await authAPI.updateUser(editingStudent.id, {
        fullName: editingStudent.fullName,
        email: editingStudent.email,
        username: editingStudent.username,
      });
      alert('Student updated successfully!');
      setShowEditModal(false);
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      console.error('Full error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to update student');
    }
  };

  const handleBlockUnblock = async (studentId, currentStatus) => {
    const action = currentStatus ? 'unblock' : 'block';
    if (!confirm(`Are you sure you want to ${action} this student?`)) return;

    try {
      await authAPI.updateUser(studentId, { isBlocked: !currentStatus });
      alert(`Student ${action}ed successfully!`);
      fetchStudents();
    } catch (error) {
      console.error(`Error ${action}ing student:`, error);
      alert(`Failed to ${action} student`);
    }
  };

  const handleDelete = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student? This will also remove all related data!')) return;

    try {
      await authAPI.deleteUser(studentId);
      alert('Student deleted successfully!');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      console.error('Full error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const filteredStudents = students.filter(student => {
    // Search filter
    const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Class filter
    if (classFilter === '') return matchesSearch;
    if (classFilter === 'unassigned') {
      return matchesSearch && !student.className && !student.classId;
    }
    
    const studentClass = student.className || student.classId?.name || '';
    return matchesSearch && studentClass === classFilter;
  });

  // Get unique classes for filter dropdown
  const uniqueClasses = [...new Set(
    students
      .map(s => s.className || s.classId?.name)
      .filter(Boolean)
  )].sort();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Manage Students</h1>
        <p className="text-sm sm:text-base text-gray-600">View, edit, and manage student records</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="🔍 Search students by name, email, or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
        />
        
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
        >
          <option value="">🏫 All Classes</option>
          <option value="unassigned">📋 Unassigned Students</option>
          {uniqueClasses.map(className => (
            <option key={className} value={className}>
              {className}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading students...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-purple-600">{students.length}</p>
            </div>
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <p className="text-sm text-gray-600">{classFilter ? 'Filtered' : 'Showing'}</p>
              <p className="text-2xl font-bold text-blue-600">{filteredStudents.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
              <p className="text-sm text-gray-600">Active Students</p>
              <p className="text-2xl font-bold text-green-600">
                {students.filter(s => !s.isBlocked).length}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg border border-red-200 p-4">
              <p className="text-sm text-gray-600">Blocked Students</p>
              <p className="text-2xl font-bold text-red-600">
                {students.filter(s => s.isBlocked).length}
              </p>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No students found
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div key={student._id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-purple-600">
                          {student.fullName?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{student.fullName}</h3>
                        <p className="text-xs text-gray-500">{student.username}</p>
                      </div>
                    </div>
                    {student.isBlocked ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Blocked
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <div className="mb-3 text-sm text-gray-600">
                    <p>📧 {student.email}</p>
                    <p>🏫 Class: {student.className || student.classId?.name || 'Not assigned'}</p>
                    <p>📅 Joined: {new Date(student.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(student)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-md text-sm font-medium hover:bg-blue-100"
                    >
                      📊 Details
                    </button>
                    <button
                      onClick={() => handleEdit(student)}
                      className="px-3 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleBlockUnblock(student._id, student.isBlocked)}
                      className={`px-3 rounded-md ${
                        student.isBlocked
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      }`}
                      title={student.isBlocked ? 'Unblock' : 'Block'}
                    >
                      {student.isBlocked ? '✓' : '🚫'}
                    </button>
                    <button
                      onClick={() => handleDelete(student._id)}
                      className="px-3 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Student Details Modal */}
      {showDetailsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{selectedStudent.fullName}</h2>
                <p className="text-sm text-gray-600">{selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {!studentDetails ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading details...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Class Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">🏫 Class Information</h3>
                  {selectedStudent.className || selectedStudent.classId || studentDetails.class ? (
                    <div className="text-sm text-gray-700">
                      <p><strong>Class:</strong> {
                        selectedStudent.className || 
                        studentDetails.class?.name || 
                        'Not assigned'
                      }</p>
                      {studentDetails.class?.subject && (
                        <p><strong>Subject:</strong> {studentDetails.class.subject}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not enrolled in any class</p>
                  )}
                </div>

                {/* Fee Records */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">💰 Fee Records ({studentDetails.fees.length})</h3>
                  {studentDetails.fees.length > 0 ? (
                    <div className="space-y-2">
                      {studentDetails.fees.slice(0, 3).map((fee) => (
                        <div key={fee._id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{fee.feeType}</span>
                          <span className={`font-medium ${
                            fee.status === 'paid' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            ₹{fee.totalFee} - {fee.status}
                          </span>
                        </div>
                      ))}
                      {studentDetails.fees.length > 3 && (
                        <p className="text-xs text-gray-500">+ {studentDetails.fees.length - 3} more</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No fee records</p>
                  )}
                </div>

                {/* Exam Scores */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">📊 Exam Scores ({studentDetails.exams.length})</h3>
                  {studentDetails.exams.length > 0 ? (
                    <div className="space-y-2">
                      {studentDetails.exams.slice(0, 3).map((exam) => (
                        <div key={exam._id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{exam.examName}</span>
                          <span className="font-medium text-purple-600">
                            {exam.marksObtained}/{exam.totalMarks}
                          </span>
                        </div>
                      ))}
                      {studentDetails.exams.length > 3 && (
                        <p className="text-xs text-gray-500">+ {studentDetails.exams.length - 3} more</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No exam records</p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Edit Student</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editingStudent.fullName}
                  onChange={(e) => setEditingStudent({ ...editingStudent, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editingStudent.username}
                  onChange={(e) => setEditingStudent({ ...editingStudent, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
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
    </div>
  );
};

export default AdminStudents;
