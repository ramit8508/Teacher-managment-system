import { useState, useEffect } from 'react';
import { authAPI, classAPI, feeAPI, examinationAPI } from '../api';
import ReportCard from './ReportCard';

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);
  const [showReportFilterModal, setShowReportFilterModal] = useState(false);
  const [reportFilters, setReportFilters] = useState({ className: '', academicYear: '' });
  const [showBulkReportModal, setShowBulkReportModal] = useState(false);
  const [selectedClassForReport, setSelectedClassForReport] = useState('');
  const [selectedYearForReport, setSelectedYearForReport] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [filteredExams, setFilteredExams] = useState([]);

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
  )].sort((a, b) => {
    // Custom sort: extract grade number and section letter(s)
    const matchA = a.match(/^(\d+)([A-Z]+)$/);
    const matchB = b.match(/^(\d+)([A-Z]+)$/);
    
    if (matchA && matchB) {
      const gradeA = parseInt(matchA[1], 10);
      const gradeB = parseInt(matchB[1], 10);
      const sectionA = matchA[2];
      const sectionB = matchB[2];
      
      // First sort by grade number (1, 2, 3... 12)
      if (gradeA !== gradeB) return gradeA - gradeB;
      
      // Then sort by section letter alphabetically (A, B, C... Z)
      return sectionA.localeCompare(sectionB);
    }
    
    // Fallback to string comparison for non-standard formats
    return a.localeCompare(b);
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Manage Students</h1>
          <p className="text-sm sm:text-base text-gray-600">View, edit, and manage student records</p>
        </div>
        <button
          onClick={() => setShowBulkReportModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          🖨️ Print Class Reports
        </button>
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
                    <div className="space-y-3">
                      {studentDetails.exams.map((exam) => {
                        // Calculate total marks from subjects
                        const totalObtained = exam.subjects?.reduce((sum, sub) => sum + (sub.obtainedMarks || 0), 0) || 0;
                        const totalMarks = exam.subjects?.reduce((sum, sub) => sum + (sub.totalMarks || 0), 0) || 0;
                        const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(1) : 0;
                        
                        return (
                          <div key={exam._id} className="bg-white rounded-md p-3 border border-purple-200">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-800 text-sm">{exam.examName}</p>
                                <p className="text-xs text-gray-500">{exam.examType} • {new Date(exam.examDate).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-purple-600">{totalObtained}/{totalMarks}</p>
                                <p className="text-xs text-gray-600">{percentage}%</p>
                              </div>
                            </div>
                            
                            {/* Subject-wise breakdown */}
                            {exam.subjects && exam.subjects.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-purple-100 space-y-1">
                                {exam.subjects.map((subject, idx) => (
                                  <div key={idx} className="flex justify-between text-xs">
                                    <span className="text-gray-600">{subject.subjectName}</span>
                                    <span className="font-medium text-gray-700">
                                      {subject.obtainedMarks}/{subject.totalMarks}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Overall grade */}
                            {exam.overallGrade && (
                              <div className="mt-2 pt-2 border-t border-purple-100">
                                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                  exam.resultStatus === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  Grade: {exam.overallGrade} • {exam.resultStatus}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No exam records</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReportFilterModal(true);
                }}
                disabled={!studentDetails?.exams || studentDetails.exams.length === 0}
                className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                👁️ Review Report Card
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
            {!studentDetails?.exams || studentDetails.exams.length === 0 ? (
              <p className="text-sm text-orange-600 mt-2 text-center">⚠️ No exam records available for this student</p>
            ) : null}
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

      {/* Report Filter Modal */}
      {showReportFilterModal && selectedStudent && studentDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Report Card Filters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={reportFilters.className}
                  onChange={(e) => setReportFilters({...reportFilters, className: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Classes</option>
                  {[...new Set(studentDetails.exams.map(e => e.className).filter(Boolean))].sort((a, b) => {
                    const matchA = a.match(/^(\d+)([A-Z]+)$/);
                    const matchB = b.match(/^(\d+)([A-Z]+)$/);
                    if (matchA && matchB) {
                      const gradeA = parseInt(matchA[1], 10);
                      const gradeB = parseInt(matchB[1], 10);
                      if (gradeA !== gradeB) return gradeA - gradeB;
                      return matchA[2].localeCompare(matchB[2]);
                    }
                    return a.localeCompare(b);
                  }).map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <select
                  value={reportFilters.academicYear}
                  onChange={(e) => setReportFilters({...reportFilters, academicYear: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">All Years</option>
                  {[...new Set(studentDetails.exams.map(e => new Date(e.examDate).getFullYear()).filter(Boolean))].sort((a, b) => b - a).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    // Filter exams based on selected class and year
                    let filtered = studentDetails.exams;
                    if (reportFilters.className) {
                      filtered = filtered.filter(e => e.className === reportFilters.className);
                    }
                    if (reportFilters.academicYear) {
                      filtered = filtered.filter(e => new Date(e.examDate).getFullYear() === parseInt(reportFilters.academicYear));
                    }
                    setFilteredExams(filtered);
                    setShowReportFilterModal(false);
                    setShowReportCard(true);
                  }}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                >
                  Generate Report
                </button>
                <button
                  onClick={() => {
                    setShowReportFilterModal(false);
                    setReportFilters({ className: '', academicYear: '' });
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Report Card Modal */}
      {showReportCard && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8 mx-4 max-h-[95vh] overflow-y-auto">
            <ReportCard 
              student={selectedStudent} 
              exams={filteredExams}
              onClose={() => {
                setShowReportCard(false);
                setReportFilters({ className: '', academicYear: '' });
                setFilteredExams([]);
              }}
              classFilter={reportFilters.className}
              yearFilter={reportFilters.academicYear}
            />
          </div>
        </div>
      )}

      {/* Bulk Report Card Modal */}
      {showBulkReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Print Class Report Cards</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
                <select
                  value={selectedClassForReport}
                  onChange={(e) => setSelectedClassForReport(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">-- Select Class --</option>
                  {[...new Set(students.map(s => s.className || s.classId?.name).filter(Boolean))].sort((a, b) => {
                    const matchA = a.match(/^(\d+)([A-Z]+)$/);
                    const matchB = b.match(/^(\d+)([A-Z]+)$/);
                    if (matchA && matchB) {
                      const gradeA = parseInt(matchA[1], 10);
                      const gradeB = parseInt(matchB[1], 10);
                      if (gradeA !== gradeB) return gradeA - gradeB;
                      return matchA[2].localeCompare(matchB[2]);
                    }
                    return a.localeCompare(b);
                  }).map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Academic Year</label>
                <select
                  value={selectedYearForReport}
                  onChange={(e) => setSelectedYearForReport(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">-- Select Year --</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!selectedClassForReport) {
                      alert('Please select a class');
                      return;
                    }
                    if (!selectedYearForReport) {
                      alert('Please select an academic year');
                      return;
                    }
                    
                    // Filter students by class
                    const classStudents = students.filter(s => 
                      (s.className || s.classId?.name) === selectedClassForReport
                    );
                    
                    if (classStudents.length === 0) {
                      alert('No students found in this class');
                      return;
                    }

                    // Create print window
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>Class Report Cards - ${selectedClassForReport}</title>
                          <script src="https://cdn.tailwindcss.com"></script>
                          <style>
                            body {
                              margin: 0;
                              padding: 0;
                            }
                            .print-button-container {
                              position: fixed;
                              top: 20px;
                              right: 20px;
                              z-index: 1000;
                              display: flex;
                              gap: 10px;
                              background: white;
                              padding: 10px;
                              border-radius: 8px;
                              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                            }
                            .print-btn {
                              padding: 12px 24px;
                              font-size: 16px;
                              font-weight: 600;
                              border: none;
                              border-radius: 8px;
                              cursor: pointer;
                              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            }
                            .print-btn-primary {
                              background-color: #2563eb;
                              color: white;
                            }
                            .print-btn-primary:hover {
                              background-color: #1d4ed8;
                            }
                            .report-card-wrapper {
                              page-break-after: auto;
                              page-break-inside: avoid;
                              margin-bottom: 20px;
                            }
                            @media print {
                              .print-button-container {
                                display: none !important;
                              }
                              .report-card-container {
                                position: relative !important;
                                visibility: visible !important;
                              }
                              .page-break {
                                page-break-after: always;
                              }
                              @page {
                                size: A4;
                                margin: 0;
                              }
                              body * {
                                visibility: visible !important;
                              }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="print-button-container">
                            <button class="print-btn print-btn-primary" onclick="window.print()" disabled style="opacity: 0.6;">
                              🖨️ Print / Save as PDF
                            </button>
                            <p style="color: #666; font-size: 14px; margin-top: 8px;">Loading report cards...</p>
                          </div>
                          <div id="print-content"></div>
                        </body>
                      </html>
                    `);

                    // Fetch all student data
                    const studentReports = [];
                    for (const student of classStudents) {
                      const examsRes = await examinationAPI.getAllExaminations();
                      let studentExams = examsRes.data.data?.filter(e => e.student?._id === student._id) || [];
                      
                      // Filter by selected year
                      studentExams = studentExams.filter(e => {
                        const examYear = e.examDate ? new Date(e.examDate).getFullYear().toString() : null;
                        return examYear === selectedYearForReport;
                      });
                      
                      studentReports.push({ student, exams: studentExams });
                    }

                    // Render all report cards in one document
                    printWindow.document.close();
                    
                    import('react-dom/client').then(({ createRoot }) => {
                      const container = printWindow.document.getElementById('print-content');
                      const root = createRoot(container);
                      
                      root.render(
                        <>
                          {studentReports.map((report, index) => (
                            <div key={report.student._id} className="report-card-wrapper">
                              <ReportCard 
                                student={report.student} 
                                exams={report.exams} 
                                onClose={() => {}} 
                                hidePrintButton={true}
                                classFilter={selectedClassForReport}
                                yearFilter={selectedYearForReport}
                              />
                            </div>
                          ))}
                        </>
                      );
                      
                      // Ensure all content is rendered before making print button functional
                      setTimeout(() => {
                        const printBtn = printWindow.document.querySelector('.print-btn-primary');
                        const loadingText = printWindow.document.querySelector('.print-button-container p');
                        if (printBtn) {
                          printBtn.disabled = false;
                          printBtn.style.opacity = '1';
                        }
                        if (loadingText) {
                          loadingText.textContent = 'Ready to print!';
                          loadingText.style.color = '#16a34a';
                        }
                      }, 1500);
                    });
                    
                    setShowBulkReportModal(false);
                    setSelectedClassForReport('');
                    setSelectedYearForReport('');
                  }}
                  disabled={!selectedClassForReport || !selectedYearForReport}
                  className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  🖨️ Print All
                </button>
                <button
                  onClick={() => {
                    setShowBulkReportModal(false);
                    setSelectedClassForReport('');
                    setSelectedYearForReport('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
