import { useState } from 'react';

const ExaminationScores = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showClassView, setShowClassView] = useState(false);
  const [showAddStudentToClass, setShowAddStudentToClass] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newStudentForm, setNewStudentForm] = useState({
    id: '',
    name: '',
    class: ''
  });
  const [scoreForm, setScoreForm] = useState({
    studentId: '',
    class: '',
    subject: '',
    examType: '',
    maxMarks: '',
    obtainedMarks: '',
    examDate: '2025-11-03'
  });

  // All available subjects by grade level
  const allSubjects = {
    '1-5': ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Environmental Studies', 'Computer Science', 'Physical Education', 'Art & Craft', 'Moral Science'],
    '6-8': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Sanskrit', 'Computer Science', 'Physical Education', 'Art & Craft', 'General Knowledge'],
    '9-10': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Sanskrit', 'Computer Science', 'Physical Education', 'Information Technology', 'Artificial Intelligence']
  };

  const getSubjectsForClass = (className) => {
    const classNum = parseInt(className.split('-')[0]);
    if (classNum >= 1 && classNum <= 5) return allSubjects['1-5'];
    if (classNum >= 6 && classNum <= 8) return allSubjects['6-8'];
    if (classNum >= 9 && classNum <= 10) return allSubjects['9-10'];
    return allSubjects['9-10'];
  };

  // Student data with multiple subjects
  const [students, setStudents] = useState([
    { 
      id: '001', 
      name: 'Alice Johnson', 
      class: '10-A',
      subjects: [
        { name: 'Mathematics', marks: 85, maxMarks: 100, percentage: 85.0 },
        { name: 'Science', marks: 78, maxMarks: 100, percentage: 78.0 },
        { name: 'English', marks: 92, maxMarks: 100, percentage: 92.0 },
        { name: 'Social Science', marks: 88, maxMarks: 100, percentage: 88.0 },
        { name: 'Hindi', marks: 75, maxMarks: 100, percentage: 75.0 }
      ]
    },
    { 
      id: '002', 
      name: 'Bob Smith', 
      class: '10-A',
      subjects: [
        { name: 'Mathematics', marks: 72, maxMarks: 100, percentage: 72.0 },
        { name: 'Science', marks: 65, maxMarks: 100, percentage: 65.0 },
        { name: 'English', marks: 80, maxMarks: 100, percentage: 80.0 },
        { name: 'Computer Science', marks: 70, maxMarks: 100, percentage: 70.0 },
        { name: 'Physical Education', marks: 68, maxMarks: 100, percentage: 68.0 }
      ]
    },
    { 
      id: '003', 
      name: 'Charlie Brown', 
      class: '5-B',
      subjects: [
        { name: 'Mathematics', marks: 68, maxMarks: 100, percentage: 68.0 },
        { name: 'Science', marks: 82, maxMarks: 100, percentage: 82.0 },
        { name: 'English', marks: 75, maxMarks: 100, percentage: 75.0 },
        { name: 'Environmental Studies', marks: 78, maxMarks: 100, percentage: 78.0 },
        { name: 'Hindi', marks: 72, maxMarks: 100, percentage: 72.0 }
      ]
    }
  ]);

  const [examScores, setExamScores] = useState([
    { studentId: '001', name: 'Alice Johnson', class: '10-A', subject: 'Mathematics', examType: 'Unit Test 1', marks: '85/100', percentage: '85.0%', grade: 'A', examDate: '15/08/2024' },
    { studentId: '002', name: 'Bob Smith', class: '10-A', subject: 'Mathematics', examType: 'Unit Test 1', marks: '72/100', percentage: '72.0%', grade: 'B', examDate: '15/08/2024' },
    { studentId: '003', name: 'Charlie Brown', class: '10-A', subject: 'Science', examType: 'Mid-term', marks: '68/100', percentage: '68.0%', grade: 'B', examDate: '20/08/2024' },
    { studentId: '001', name: 'Alice Johnson', class: '10-A', subject: 'English', examType: 'Unit Test 1', marks: '92/100', percentage: '92.0%', grade: 'A+', examDate: '18/08/2024' },
  ]);

  const calculateAverage = (subjects) => {
    if (subjects.length === 0) return 0;
    const total = subjects.reduce((sum, subject) => sum + subject.percentage, 0);
    return (total / subjects.length).toFixed(2);
  };

  const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const handleUpdateMarks = (studentId, subjectIndex, newMarks) => {
    const updatedStudents = students.map(student => {
      if (student.id === studentId) {
        const maxMarks = student.subjects[subjectIndex].maxMarks;
        const percentage = ((parseFloat(newMarks) / maxMarks) * 100).toFixed(1);
        const updatedSubjects = [...student.subjects];
        updatedSubjects[subjectIndex] = {
          ...updatedSubjects[subjectIndex],
          marks: parseFloat(newMarks),
          percentage: parseFloat(percentage)
        };
        const updatedStudent = { ...student, subjects: updatedSubjects };
        setSelectedStudent(updatedStudent);
        return updatedStudent;
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const handleAddSubject = (subjectName, maxMarks) => {
    const updatedStudents = students.map(student => {
      if (student.id === selectedStudent.id) {
        const newSubject = {
          name: subjectName,
          marks: 0,
          maxMarks: parseInt(maxMarks),
          percentage: 0
        };
        const updatedSubjects = [...student.subjects, newSubject];
        const updatedStudent = { ...student, subjects: updatedSubjects };
        setSelectedStudent(updatedStudent);
        return updatedStudent;
      }
      return student;
    });
    setStudents(updatedStudents);
    setShowAddSubjectModal(false);
  };

  const handleRemoveSubject = (subjectIndex) => {
    if (confirm('Are you sure you want to remove this subject?')) {
      const updatedStudents = students.map(student => {
        if (student.id === selectedStudent.id) {
          const updatedSubjects = student.subjects.filter((_, index) => index !== subjectIndex);
          const updatedStudent = { ...student, subjects: updatedSubjects };
          setSelectedStudent(updatedStudent);
          return updatedStudent;
        }
        return student;
      });
      setStudents(updatedStudents);
    }
  };

  const handleViewClassStudents = (className) => {
    setSelectedClass(className);
    setShowClassView(true);
  };

  const getStudentsByClass = (className) => {
    return students.filter(student => student.class === className);
  };

  const handleAddStudentToClass = () => {
    if (newStudentForm.id && newStudentForm.name && selectedClass) {
      const defaultSubjects = getSubjectsForClass(selectedClass).slice(0, 5).map(subName => ({
        name: subName,
        marks: 0,
        maxMarks: 100,
        percentage: 0
      }));

      const newStudent = {
        id: newStudentForm.id,
        name: newStudentForm.name,
        class: selectedClass,
        subjects: defaultSubjects
      };

      setStudents([...students, newStudent]);
      setNewStudentForm({ id: '', name: '', class: '' });
      setShowAddStudentToClass(false);
      alert(`Student ${newStudentForm.name} added to Class ${selectedClass} successfully!`);
    }
  };

  const handleRemoveStudentFromClass = (studentId) => {
    if (confirm('Are you sure you want to remove this student from the class?')) {
      setStudents(students.filter(student => student.id !== studentId));
      alert('Student removed successfully!');
    }
  };

  const handleAddScore = (e) => {
    e.preventDefault();
    const percentage = ((parseFloat(scoreForm.obtainedMarks) / parseFloat(scoreForm.maxMarks)) * 100).toFixed(1);
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    
    alert('Score added successfully!');
    setShowAddModal(false);
    setScoreForm({ studentId: '', subject: '', examType: '', maxMarks: '', obtainedMarks: '', examDate: '2025-11-03' });
  };

  const handleBulkEntry = () => {
    alert('Bulk entry feature: Upload CSV or enter multiple scores at once!');
    setShowBulkModal(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Examination Scores</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowClassView(true)} 
            className="px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-300 font-medium hover:bg-indigo-200 transition-colors flex items-center gap-2"
          >
            <span>🏫</span><span>View by Class</span>
          </button>
          <button onClick={() => setShowBulkModal(true)} className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg border border-purple-300 font-medium hover:bg-purple-200 transition-colors flex items-center gap-2">
            <span>📊</span><span>Bulk Entry</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-300 font-medium hover:bg-blue-200 transition-colors flex items-center gap-2">
            <span>➕</span><span>Add Score</span>
          </button>
        </div>
      </div>

      {/* Class View Modal */}
      {showClassView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-indigo-300 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="bg-indigo-100 px-6 py-4 border-b-2 border-indigo-300">
              <h2 className="text-xl font-bold text-indigo-800">Class-wise Student View</h2>
              <p className="text-sm text-gray-600">Select a class to view and manage students</p>
            </div>
            <div className="p-6">
              {/* Class Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Class</label>
                <select
                  className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="">-- Select Class --</option>
                  {[1,2,3,4,5,6,7,8,9,10].map(num => (
                    ['A','B','C','D'].map(grade => (
                      <option key={`${num}-${grade}`} value={`${num}-${grade}`}>
                        Class {num}-{grade}
                      </option>
                    ))
                  ))}
                </select>
              </div>

              {selectedClass && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">
                      Students in Class {selectedClass} ({getStudentsByClass(selectedClass).length} students)
                    </h3>
                    <button
                      onClick={() => setShowAddStudentToClass(true)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-md border border-green-300 font-medium hover:bg-green-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <span>➕</span>
                      <span>Add Student to Class</span>
                    </button>
                  </div>

                  {getStudentsByClass(selectedClass).length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                      <p className="text-gray-600 text-lg">No students found in Class {selectedClass}</p>
                      <p className="text-sm text-gray-500 mt-2">Click "Add Student to Class" to add students</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Subjects</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Average %</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getStudentsByClass(selectedClass).map((student) => {
                            const avgPercentage = calculateAverage(student.subjects);
                            const grade = getGrade(avgPercentage);
                            return (
                              <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-700">{student.id}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{student.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{student.subjects.length}</td>
                                <td className="px-6 py-4 text-sm font-semibold text-blue-700">{avgPercentage}%</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                    grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                    grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}>
                                    {grade}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => {
                                        handleViewStudent(student);
                                        setShowClassView(false);
                                      }}
                                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded border border-blue-300 text-sm font-medium hover:bg-blue-200 transition-colors"
                                    >
                                      View/Edit
                                    </button>
                                    <button 
                                      onClick={() => handleRemoveStudentFromClass(student.id)}
                                      className="px-3 py-1 bg-red-100 text-red-700 rounded border border-red-300 text-sm font-medium hover:bg-red-200 transition-colors"
                                    >
                                      🗑️ Remove
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowClassView(false);
                    setSelectedClass('');
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student to Class Modal */}
      {showAddStudentToClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-green-300 w-full max-w-md">
            <div className="bg-green-100 px-6 py-4 border-b-2 border-green-300">
              <h2 className="text-xl font-bold text-green-800">Add Student to Class {selectedClass}</h2>
              <p className="text-sm text-gray-600">Enter student details to add to this class</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddStudentToClass();
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 004"
                    value={newStudentForm.id}
                    onChange={(e) => setNewStudentForm({...newStudentForm, id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., John Doe"
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm({...newStudentForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-400 outline-none"
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Class:</strong> {selectedClass}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Default subjects will be automatically assigned based on grade level
                  </p>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-100 text-green-700 rounded-md border border-green-300 font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
                >
                  <span>✅</span>
                  <span>Add Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentToClass(false);
                    setNewStudentForm({ id: '', name: '', class: '' });
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Subject Overview */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden mb-6">
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-800">Students Subject Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total Subjects</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Average %</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const avgPercentage = calculateAverage(student.subjects);
                const grade = getGrade(avgPercentage);
                return (
                  <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{student.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.class}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.subjects.length}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-700">{avgPercentage}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                        grade === 'B' ? 'bg-blue-100 text-blue-700' :
                        grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleViewStudent(student)}
                        className="px-4 py-1 bg-blue-100 text-blue-700 rounded border border-blue-300 text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        View/Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Detail Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-blue-300 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-100 px-6 py-4 border-b-2 border-blue-300 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-blue-800">{selectedStudent.name} - Subject Details</h2>
                <p className="text-sm text-gray-600">Student ID: {selectedStudent.id} | Class: {selectedStudent.class}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Average Percentage</p>
                <p className="text-2xl font-bold text-blue-700">{calculateAverage(selectedStudent.subjects)}%</p>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  getGrade(calculateAverage(selectedStudent.subjects)).startsWith('A') ? 'bg-green-100 text-green-700' :
                  getGrade(calculateAverage(selectedStudent.subjects)) === 'B' ? 'bg-blue-100 text-blue-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  Grade: {getGrade(calculateAverage(selectedStudent.subjects))}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Update Subject Marks</h3>
                <button
                  onClick={() => setShowAddSubjectModal(true)}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md border border-purple-300 font-medium hover:bg-purple-200 transition-colors flex items-center gap-2 text-sm"
                >
                  <span>➕</span>
                  <span>Add Subject</span>
                </button>
              </div>
              <div className="space-y-4">
                {selectedStudent.subjects.map((subject, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{subject.name}</label>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Obtained Marks</label>
                        <input
                          type="number"
                          value={subject.marks}
                          onChange={(e) => handleUpdateMarks(selectedStudent.id, index, e.target.value)}
                          max={subject.maxMarks}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Max Marks</label>
                        <input
                          type="text"
                          value={subject.maxMarks}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Percentage</label>
                        <div className="text-lg font-bold text-blue-700">{subject.percentage}%</div>
                      </div>
                      <div>
                        <button
                          onClick={() => handleRemoveSubject(index)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-md border border-red-300 text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    alert('Marks updated successfully!');
                    setShowStudentModal(false);
                  }}
                  className="px-6 py-2 bg-green-100 text-green-700 rounded-md border border-green-300 font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
                >
                  <span>✅</span>
                  <span>Save Changes</span>
                </button>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 font-medium hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showAddSubjectModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-purple-300 w-full max-w-md">
            <div className="bg-purple-100 px-6 py-4 border-b-2 border-purple-300">
              <h2 className="text-xl font-bold text-purple-800">Add New Subject</h2>
              <p className="text-sm text-gray-600">Add subject for {selectedStudent.name} (Class {selectedStudent.class})</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleAddSubject(formData.get('subject'), formData.get('maxMarks'));
            }} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Subject</label>
                  <select
                    name="subject"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    <option value="">-- Select Subject --</option>
                    {getSubjectsForClass(selectedStudent.class)
                      .filter(sub => !selectedStudent.subjects.some(s => s.name === sub))
                      .map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Available subjects for Class {selectedStudent.class.split('-')[0]}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Maximum Marks</label>
                  <input
                    type="number"
                    name="maxMarks"
                    required
                    min="1"
                    defaultValue="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-100 text-purple-700 rounded-md border border-purple-300 font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
                >
                  <span>➕</span>
                  <span>Add Subject</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-blue-300 w-full max-w-4xl">
            <div className="bg-blue-100 px-6 py-4 border-b-2 border-blue-300">
              <h2 className="text-xl font-bold text-blue-800">Add New Score</h2>
              <p className="text-sm text-gray-600">Select class/grade first to load available subjects</p>
            </div>
            <form onSubmit={handleAddScore} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID</label>
                  <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Enter Student ID" value={scoreForm.studentId} onChange={(e) => setScoreForm({...scoreForm, studentId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class/Grade <span className="text-red-500">*</span></label>
                  <select 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" 
                    value={scoreForm.class} 
                    onChange={(e) => setScoreForm({...scoreForm, class: e.target.value, subject: ''})}
                  >
                    <option value="">-- Select Class --</option>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      ['A','B','C','D'].map(grade => (
                        <option key={`${num}-${grade}`} value={`${num}-${grade}`}>{num}-{grade}</option>
                      ))
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select class to load available subjects</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" 
                    value={scoreForm.subject} 
                    onChange={(e) => setScoreForm({...scoreForm, subject: e.target.value})}
                    disabled={!scoreForm.class}
                  >
                    <option value="">{scoreForm.class ? 'Select Subject' : 'Select Class First'}</option>
                    {scoreForm.class && getSubjectsForClass(scoreForm.class).map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  {scoreForm.class && (
                    <p className="text-xs text-blue-600 mt-1">
                      📚 Subjects for Class {scoreForm.class.split('-')[0]}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Type</label>
                  <select required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" value={scoreForm.examType} onChange={(e) => setScoreForm({...scoreForm, examType: e.target.value})}>
                    <option value="">Select Exam Type</option>
                    <option value="Unit Test 1">Unit Test 1</option>
                    <option value="Unit Test 2">Unit Test 2</option>
                    <option value="Mid-term">Mid-term</option>
                    <option value="Pre-Board">Pre-Board</option>
                    <option value="Final">Final</option>
                    <option value="Terminal Exam">Terminal Exam</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Marks</label>
                  <input type="number" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Max Marks" value={scoreForm.maxMarks} onChange={(e) => setScoreForm({...scoreForm, maxMarks: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Obtained Marks</label>
                  <input type="number" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Obtained Marks" value={scoreForm.obtainedMarks} onChange={(e) => setScoreForm({...scoreForm, obtainedMarks: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Date</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" value={scoreForm.examDate} onChange={(e) => setScoreForm({...scoreForm, examDate: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="px-6 py-2 bg-green-100 text-green-700 rounded-md border border-green-300 font-medium hover:bg-green-200 transition-colors flex items-center gap-2">
                  <span>✅</span><span>Add Score</span>
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 font-medium hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-purple-300 w-full max-w-2xl">
            <div className="bg-purple-100 px-6 py-4 border-b-2 border-purple-300">
              <h2 className="text-xl font-bold text-purple-800">Bulk Entry</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">Upload a CSV file or enter multiple exam scores at once.</p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <span className="text-4xl mb-2 block">📄</span>
                <p className="text-gray-600 mb-2">Drop CSV file here or click to browse</p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200">Choose File</button>
              </div>
              <div className="flex gap-4 mt-6">
                <button onClick={handleBulkEntry} className="px-6 py-2 bg-purple-100 text-purple-700 rounded-md border border-purple-300 font-medium hover:bg-purple-200 transition-colors">Upload</button>
                <button onClick={() => setShowBulkModal(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 font-medium hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Class Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">72.4%</div>
            <div className="text-sm text-gray-600">Class Average</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">4</div>
            <div className="text-sm text-gray-600">Passed</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">1</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">5</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none">
              <option>All Classes</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                ['A', 'B', 'C', 'D'].map(grade => (
                  <option key={`${num}-${grade}`} value={`${num}-${grade}`}>{num}-{grade}</option>
                ))
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none">
              <option>All Subjects</option>
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none">
              <option>All Exam Types</option>
              <option>Unit Test 1</option>
              <option>Mid-term</option>
              <option>Final</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-800">Exam Scores (5)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Exam Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Exam Date</th>
              </tr>
            </thead>
            <tbody>
              {examScores.map((score, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{score.studentId}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{score.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{score.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{score.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{score.examType}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{score.marks}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{score.percentage}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      score.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                      score.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {score.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{score.examDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExaminationScores;
