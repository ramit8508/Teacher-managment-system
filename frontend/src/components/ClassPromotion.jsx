import { useState, useEffect } from 'react';
import { classAPI, authAPI } from '../api';

const ClassPromotion = () => {
  const [classes, setClasses] = useState([]);
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
      const response = await classAPI.getAllClasses();
      setClasses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSourceClassChange = async (classId) => {
    setSelectedSourceClass(classId);
    
    try {
      // Fetch all students and filter by the selected class
      const response = await authAPI.getAllUsers({ role: 'student' });
      const allStudents = response.data.data || [];
      
      // Filter students based on classId or className
      const filteredStudents = allStudents.filter(student => {
        if (student.classId?._id === classId || student.classId === classId) {
          return true;
        }
        if (student.className === classId) {
          return true;
        }
        return false;
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

    if (!confirm(`Are you sure you want to promote ${selectedStudents.length} student(s) to the new class?`)) {
      return;
    }

    setLoading(true);

    try {
      // Check if target class is a predefined class or database class
      const isTargetPredefined = selectedTargetClass.startsWith('Class');
      
      // Update each selected student
      const updatePromises = selectedStudents.map(studentId => {
        if (isTargetPredefined) {
          // For predefined classes, update className field and clear classId
          return authAPI.updateUser(studentId, { 
            className: selectedTargetClass,
            classId: null
          });
        } else {
          // For database classes, update classId field and clear className
          return authAPI.updateUser(studentId, { 
            classId: selectedTargetClass,
            className: null
          });
        }
      });

      await Promise.all(updatePromises);

      // If source is a database class, remove students from it
      if (!selectedSourceClass.startsWith('Class')) {
        try {
          await classAPI.updateClass(selectedSourceClass, {
            removeStudents: selectedStudents
          });
        } catch (error) {
          console.log('Could not update source class roster:', error);
        }
      }

      // If target is a database class, add students to it
      if (!isTargetPredefined) {
        try {
          const addPromises = selectedStudents.map(studentId =>
            classAPI.addStudentToClass(selectedTargetClass, studentId)
          );
          await Promise.all(addPromises);
        } catch (error) {
          console.log('Could not update target class roster:', error);
        }
      }

      alert(`Successfully promoted ${selectedStudents.length} student(s)!`);
      
      // Reset
      setSelectedSourceClass('');
      setSelectedTargetClass('');
      setSourceStudents([]);
      setSelectedStudents([]);
      fetchClasses();

    } catch (error) {
      console.error('Error promoting students:', error);
      alert('Failed to promote students. Please try again.');
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
            >
              <option value="">-- Select Source Class --</option>
              {/* Predefined class options: Class 1-10 with sections A-D */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(classNum => 
                ['A', 'B', 'C', 'D'].map(section => (
                  <option key={`${classNum}-${section}`} value={`Class ${classNum} - Section ${section}`}>
                    Class {classNum} - Section {section}
                  </option>
                ))
              )}
              {/* Also show database classes if any */}
              {classes.length > 0 && (
                <optgroup label="── Database Classes ──">
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - {cls.subject} ({cls.students?.length || 0} students)
                    </option>
                  ))}
                </optgroup>
              )}
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
            >
              <option value="">-- Select Target Class --</option>
              {/* Predefined class options: Class 1-10 with sections A-D */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(classNum => 
                ['A', 'B', 'C', 'D'].map(section => {
                  const classValue = `Class ${classNum} - Section ${section}`;
                  return (
                    <option 
                      key={`${classNum}-${section}`} 
                      value={classValue}
                      disabled={selectedSourceClass === classValue}
                    >
                      Class {classNum} - Section {section}
                    </option>
                  );
                })
              )}
              {/* Also show database classes if any */}
              {classes.length > 0 && (
                <optgroup label="── Database Classes ──">
                  {classes
                    .filter(cls => cls._id !== selectedSourceClass)
                    .map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name} - {cls.subject} ({cls.students?.length || 0} students)
                      </option>
                    ))}
                </optgroup>
              )}
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
