import React, { useState, useEffect } from 'react';
import { authAPI, classAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const ClassTeacherAssignment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // State
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]); // { classId, className, assignedTeachers: [] }
  const [availableClasses, setAvailableClasses] = useState([]); // Classes from database

  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  // State for students
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all teachers
      const teachersResponse = await authAPI.getAllUsers({ role: 'teacher' });
      setTeachers(teachersResponse.data.data);

      // Fetch all students to count per class
      const studentsResponse = await authAPI.getAllUsers({ role: 'student' });
      const allStudents = studentsResponse.data.data;
      setStudents(allStudents);

      // Fetch class names from database
      const classesResponse = await classAPI.getAllClassNames();
      const dbClasses = classesResponse.data.data || [];
      
      // Also get classes from students
      const studentClasses = [...new Set(allStudents.map(s => s.className).filter(Boolean).map(c => c.toUpperCase()))];
      
      // Merge database classes and student classes, remove duplicates
      const allClassNames = [...new Set([...dbClasses, ...studentClasses])];
      
      // Sort classes properly (1A, 1B... 12Z)
      const sortedClasses = allClassNames.sort((a, b) => {
        const matchA = a.match(/^(\d+)([A-Z]+)$/);
        const matchB = b.match(/^(\d+)([A-Z]+)$/);
        if (matchA && matchB) {
          const gradeA = parseInt(matchA[1]);
          const gradeB = parseInt(matchB[1]);
          if (gradeA !== gradeB) return gradeA - gradeB;
          return matchA[2].localeCompare(matchB[2]);
        }
        return a.localeCompare(b);
      });
      
      setAvailableClasses(sortedClasses);

      // Fetch class-teacher assignments
      const assignmentsResponse = await classAPI.getClassAssignments();
      setAssignments(assignmentsResponse.data.data);

      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to load data' 
      });
      setLoading(false);
    }
  };

  const handleAssignClick = (className) => {
    setSelectedClass(className);
    
    // Find existing assignment
    const existingAssignment = assignments.find(a => a.className === className);
    setSelectedTeachers(existingAssignment?.assignedTeachers?.map(t => t._id) || []);
    
    setShowAssignModal(true);
  };

  const toggleTeacher = (teacherId) => {
    if (selectedTeachers.includes(teacherId)) {
      setSelectedTeachers(selectedTeachers.filter(id => id !== teacherId));
    } else {
      setSelectedTeachers([...selectedTeachers, teacherId]);
    }
  };

  const handleSaveAssignment = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await classAPI.assignTeachersToClass(selectedClass, selectedTeachers);

      setMessage({ 
        type: 'success', 
        text: `Successfully updated teacher assignments for ${selectedClass}` 
      });

      // Refresh assignments
      await fetchData();
      setShowAssignModal(false);
      setSelectedClass(null);
      setSelectedTeachers([]);
    } catch (error) {
      console.error('Assignment error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update assignments' 
      });
    } finally {
      setLoading(false);
    }
  };

  const getAssignedTeachers = (className) => {
    const assignment = assignments.find(a => a.className === className);
    return assignment?.assignedTeachers || [];
  };

  const getStudentCount = (className) => {
    if (!students || students.length === 0) return 0;
    
    // Normalize class name for comparison (handle case-insensitive, trim whitespace)
    const normalizedClassName = className.toString().trim().toUpperCase();
    
    return students.filter(s => {
      if (!s.className) return false;
      const studentClassName = s.className.toString().trim().toUpperCase();
      return studentClassName === normalizedClassName;
    }).length;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Only admins can manage class-teacher assignments.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Class-Teacher Assignments</h2>
        <p className="text-gray-600">Assign teachers to classes to control which teachers can access which students</p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-4 px-4 py-3 rounded ${
          message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
          'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableClasses.map(className => {
          const assignedTeachers = getAssignedTeachers(className);
          return (
            <div key={className} className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Class {className}</h3>
                  <p className="text-sm text-gray-600">
                    {assignedTeachers.length} teacher{assignedTeachers.length !== 1 ? 's' : ''} • {getStudentCount(className)} student{getStudentCount(className) !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => handleAssignClick(className)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Manage
                </button>
              </div>

              {assignedTeachers.length > 0 ? (
                <div className="space-y-2">
                  {assignedTeachers.map(teacher => (
                    <div key={teacher._id} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-gray-700">{teacher.fullName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No teachers assigned</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                Assign Teachers to Class {selectedClass}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {getStudentCount(selectedClass)} student{getStudentCount(selectedClass) !== 1 ? 's' : ''} in this class. Select which teachers can access them.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {teachers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No teachers available</p>
              ) : (
                <div className="space-y-2">
                  {teachers.map(teacher => (
                    <div
                      key={teacher._id}
                      onClick={() => toggleTeacher(teacher._id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTeachers.includes(teacher._id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{teacher.fullName}</p>
                          <p className="text-sm text-gray-600">{teacher.email}</p>
                          {teacher.subject && (
                            <p className="text-xs text-gray-500 mt-1">Subject: {teacher.subject}</p>
                          )}
                        </div>
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                          selectedTeachers.includes(teacher._id)
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {selectedTeachers.includes(teacher._id) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {selectedTeachers.length} teacher{selectedTeachers.length !== 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedClass(null);
                    setSelectedTeachers([]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAssignment}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && !showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassTeacherAssignment;
