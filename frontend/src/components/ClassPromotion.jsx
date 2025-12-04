import { useState, useEffect } from 'react';
import { classAPI, authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const ClassPromotion = () => {
  const { user } = useAuth();
  const [sourceClasses, setSourceClasses] = useState([]); // Classes teacher can promote FROM
  const [allClasses, setAllClasses] = useState([]); // All classes for target selection
  const [selectedSourceClass, setSelectedSourceClass] = useState('');
  const [selectedTargetClass, setSelectedTargetClass] = useState('');
  const [sourceStudents, setSourceStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      let sourceClassNames = [];
      
      // Fetch source classes (teacher's assigned classes for teachers, all for admin)
      if (user?.role === 'teacher') {
        try {
          const assignmentsRes = await classAPI.getClassAssignments();
          const allAssignments = assignmentsRes.data.data || [];
          
          const teacherAssignments = allAssignments.filter(assignment => 
            assignment.assignedTeachers?.some(teacher => teacher._id === user._id)
          );
          
          sourceClassNames = teacherAssignments.map(a => a.className.toUpperCase());
        } catch (error) {
          console.error('Error fetching teacher assignments:', error);
        }
      } else {
        // Admin: Get both database classes AND classes from students
        const response = await classAPI.getAllClassNames();
        const dbClasses = response.data.data || [];
        
        // Also get classes from students
        const studentsRes = await authAPI.getAllUsers({ role: 'student' });
        const students = studentsRes.data.data || [];
        const studentClasses = [...new Set(students.map(s => s.className).filter(Boolean).map(c => c.toUpperCase()))];
        
        // Merge and deduplicate
        sourceClassNames = [...new Set([...dbClasses, ...studentClasses])];
      }
      
      // Fetch ALL classes for target dropdown (both teachers and admins)
      const response = await classAPI.getAllClassNames();
      const dbClasses = response.data.data || [];
      
      const studentsRes = await authAPI.getAllUsers({ role: 'student' });
      const students = studentsRes.data.data || [];
      const studentClasses = [...new Set(students.map(s => s.className).filter(Boolean).map(c => c.toUpperCase()))];
      
      // Generate all possible class combinations (1-12 grades, A-D sections)
      const allPossibleClasses = [];
      for (let grade = 1; grade <= 12; grade++) {
        for (let section of ['A', 'B', 'C', 'D']) {
          allPossibleClasses.push(`${grade}${section}`);
        }
      }
      
      // Merge with existing classes from DB and students
      const allClassNames = [...new Set([...allPossibleClasses, ...dbClasses, ...studentClasses])];
      
      // Sort both lists
      const sortClasses = (classList) => {
        return classList.sort((a, b) => {
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
      };
      
      setSourceClasses(sortClasses(sourceClassNames));
      setAllClasses(sortClasses(allClassNames));
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSourceClassChange = async (className) => {
    setSelectedSourceClass(className);
    
    try {
      // Fetch all students and filter by the selected class
      const response = await authAPI.getAllUsers({ role: 'student' });
      const allStudents = response.data.data || [];
      
      // Normalize the selected class name for comparison
      const normalizeClassName = (name) => {
        if (!name) return '';
        return name.trim().toUpperCase();
      };
      
      const normalizedSelected = normalizeClassName(className);
      
      // Filter students based on className (normalized comparison)
      const filteredStudents = allStudents.filter(student => {
        const studentClassName = normalizeClassName(student.className);
        return studentClassName === normalizedSelected;
      });
      
      setSourceStudents(filteredStudents);
      // Select all students by default
      setSelectedStudents(filteredStudents.map(s => s._id));
    } catch (error) {
      console.error('Error fetching students:', error);
      setSourceStudents([]);
      setSelectedStudents([]);
    }
  };

  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudents.length === sourceStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(sourceStudents.map(s => s._id));
    }
  };

  // Extract grade number from source class for target class filtering
  const sourceClassGrade = selectedSourceClass ? 
    parseInt(selectedSourceClass.match(/^(\d{1,2})/)?.[1] || 0) : 0;

  const handlePromote = async () => {
    if (!selectedTargetClass) {
      alert('Please select a target class');
      return;
    }

    if (selectedStudents.length === 0) {
      alert('Please select at least one student');
      return;
    }

    if (selectedSourceClass === selectedTargetClass) {
      alert('Source and target class cannot be the same');
      return;
    }

    // Check if trying to promote from class 12
    const sourceClassMatch = selectedSourceClass.match(/^(\d{1,2})[A-D]$/);
    if (sourceClassMatch && parseInt(sourceClassMatch[1]) === 12) {
      alert('⚠️ Cannot promote students from Class 12. They have completed their schooling!');
      return;
    }

    // Build list of student names for confirmation
    const selectedStudentNames = sourceStudents
      .filter(s => selectedStudents.includes(s._id))
      .map(s => s.fullName)
      .slice(0, 10); // Show first 10 names
    
    const namesList = selectedStudentNames.join('\n• ');
    const moreStudents = selectedStudents.length > 10 ? `\n• ...and ${selectedStudents.length - 10} more` : '';
    
    if (!confirm(`Are you sure you want to promote ${selectedStudents.length} student(s) from ${selectedSourceClass} to ${selectedTargetClass}?\n\nStudents to be promoted:\n• ${namesList}${moreStudents}`)) {
      return;
    }

    setLoading(true);

    try {
      // Update each selected student with the new className
      const updatePromises = selectedStudents.map(studentId => {
        return authAPI.updateUser(studentId, { 
          className: selectedTargetClass
        });
      });

      await Promise.all(updatePromises);

      // Get promoted student names for success message
      const promotedStudents = sourceStudents
        .filter(s => selectedStudents.includes(s._id))
        .map(s => s.fullName);
      
      const firstFiveNames = promotedStudents.slice(0, 5).join('\n• ');
      const remainingCount = promotedStudents.length > 5 ? `\n• ...and ${promotedStudents.length - 5} more` : '';

      alert(`✅ Successfully promoted ${selectedStudents.length} student(s) from ${selectedSourceClass} to ${selectedTargetClass}!\n\nPromoted students:\n• ${firstFiveNames}${remainingCount}`);
      
      // Reset
      setSelectedSourceClass('');
      setSelectedTargetClass('');
      setSourceStudents([]);
      setSelectedStudents([]);
      fetchClasses();

    } catch (error) {
      console.error('Error promoting students:', error);
      console.error('Full error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to promote students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Class Promotion</h1>
        <p className="text-sm sm:text-base text-gray-600">Promote students from one class to another</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Source Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Class (Current) <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSourceClass}
              onChange={(e) => handleSourceClassChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
              size="1"
            >
              <option value="">-- Select Source Class --</option>
              {sourceClasses.map(className => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          {/* Target Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Class (Target) <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTargetClass}
              onChange={(e) => setSelectedTargetClass(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
              size="1"
            >
              <option value="">-- Select Target Class --</option>
              {allClasses.map(className => {
                const targetGrade = parseInt(className.match(/^(\d{1,2})/)?.[1] || 0);
                const isDisabled = sourceClassGrade && targetGrade < sourceClassGrade;
                return (
                  <option 
                    key={className} 
                    value={className}
                    disabled={isDisabled}
                  >
                    {className}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Student Selection */}
          {sourceStudents.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Select Students to Promote ({selectedStudents.length}/{sourceStudents.length})
                </h3>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {selectedStudents.length === sourceStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <div className="divide-y divide-gray-200">
                    {sourceStudents.map((student) => (
                      <div
                        key={student._id}
                        className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleStudentSelection(student._id)}
                      >
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student._id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{student.fullName}</p>
                          <p className="text-xs text-gray-500">{student.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Promote Button */}
          {sourceStudents.length > 0 && (
            <button
              onClick={handlePromote}
              disabled={loading || selectedStudents.length === 0 || !selectedTargetClass}
              className={`w-full bg-green-600 text-white py-3 rounded-md font-medium transition-colors ${
                loading || selectedStudents.length === 0 || !selectedTargetClass
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-green-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Promoting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🎓</span>
                  Promote {selectedStudents.length} Student(s) to New Class
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassPromotion;
