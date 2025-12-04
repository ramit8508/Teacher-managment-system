import { useState, useEffect } from 'react';
import { examinationAPI, classAPI, authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const ExaminationScores = () => {
  const { user } = useAuth();
  const [examinations, setExaminations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState('single'); // 'single' or 'all-four'
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedExamType, setSelectedExamType] = useState('All Types');
  const [selectedYear, setSelectedYear] = useState('All Years');
  
  const [examForm, setExamForm] = useState({
    studentId: '',
    classId: '',
    examType: '',
    examDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [subjects, setSubjects] = useState([
    { subjectName: '', totalMarks: 100, obtainedMarks: '', remarks: '' }
  ]);

  // For all-four mode: store marks for each exam type
  const [allFourMarks, setAllFourMarks] = useState({
    'MST-1': {},
    'MST-2': {},
    'MST-3': {},
    'Final': {}
  });

  // For all-four mode: store total marks for each exam type
  const [examTotalMarks, setExamTotalMarks] = useState({
    'MST-1': {},
    'MST-2': {},
    'MST-3': {},
    'Final': {}
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all examinations
      const examsRes = await examinationAPI.getAllExaminations();
      setExaminations(examsRes.data.data || []);
      
      // Fetch all classes
      let classNames = [];
      
      // If user is a teacher, fetch only their assigned classes
      if (user?.role === 'teacher') {
        try {
          const assignmentsRes = await classAPI.getClassAssignments();
          const allAssignments = assignmentsRes.data.data || [];
          
          const teacherAssignments = allAssignments.filter(assignment => 
            assignment.assignedTeachers?.some(teacher => teacher._id === user._id)
          );
          
          classNames = teacherAssignments.map(a => a.className.toUpperCase());
        } catch (error) {
          console.error('Error fetching teacher assignments:', error);
        }
      } else {
        // Admin: Get both database classes AND classes from students
        const classesRes = await classAPI.getAllClassNames();
        const dbClasses = classesRes.data.data || [];
        
        // Also get classes from students
        const studentClasses = [...new Set(students.map(s => s.className).filter(Boolean).map(c => c.toUpperCase()))];
        
        // Merge and deduplicate
        classNames = [...new Set([...dbClasses, ...studentClasses])];
      }
      
      // Sort classes properly
      const sortedClasses = classNames.sort((a, b) => {
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
      
      setClasses(sortedClasses);
      
      // Fetch all students
      const studentsRes = await authAPI.getAllUsers({ role: 'student' });
      setStudents(studentsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setExamForm({
      ...examForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { subjectName: '', totalMarks: 100, obtainedMarks: '', remarks: '' }]);
  };

  const handleRemoveSubject = (index) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index][field] = value;
    setSubjects(updatedSubjects);
  };

  const handleSubmitExam = async (e) => {
    e.preventDefault();
    try {
      if (addMode === 'single') {
        // Single exam submission
        const validSubjects = subjects.filter(s => s.subjectName && s.totalMarks && s.obtainedMarks !== '');
        if (validSubjects.length === 0) {
          alert('Please add at least one subject with complete information');
          return;
        }

        const examData = {
          student: examForm.studentId,
          classId: examForm.classId,
          examType: examForm.examType,
          subjects: validSubjects.map(s => ({
            subjectName: s.subjectName,
            totalMarks: Number(s.totalMarks),
            obtainedMarks: Number(s.obtainedMarks),
            remarks: s.remarks || ''
          })),
          examDate: examForm.examDate,
          remarks: examForm.remarks
        };

        if (examForm.id) {
          await examinationAPI.updateExamination(examForm.id, examData);
          alert('Examination record updated successfully!');
        } else {
          await examinationAPI.createExamination(examData);
          alert('Examination record added successfully!');
        }
      } else {
        // All-four exams submission
        const examTypes = ['MST-1', 'MST-2', 'MST-3', 'Final'];
        let successCount = 0;
        
        for (const examType of examTypes) {
          const examMarks = allFourMarks[examType];
          const examTotals = examTotalMarks[examType];
          const subjectsList = subjects.map(s => ({
            subjectName: s.subjectName,
            totalMarks: Number(examTotals[s.subjectName] || s.totalMarks),
            obtainedMarks: Number(examMarks[s.subjectName] || 0),
            remarks: ''
          }));

          const examData = {
            student: examForm.studentId,
            classId: examForm.classId,
            examType: examType,
            subjects: subjectsList,
            examDate: examForm.examDate,
            remarks: examForm.remarks
          };

          await examinationAPI.createExamination(examData);
          successCount++;
        }
        
        alert(`✅ Successfully added all ${successCount} exam records!`);
      }
      
      setShowAddModal(false);
      setAddMode('single');
      setExamForm({
        studentId: '',
        classId: '',
        examType: '',
        examDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      setSubjects([{ subjectName: '', totalMarks: 100, obtainedMarks: '', remarks: '' }]);
      setAllFourMarks({
        'MST-1': {},
        'MST-2': {},
        'MST-3': {},
        'Final': {}
      });
      setExamTotalMarks({
        'MST-1': {},
        'MST-2': {},
        'MST-3': {},
        'Final': {}
      });
      fetchData();
    } catch (error) {
      console.error('Error saving examination:', error);
      alert(error.response?.data?.message || 'Failed to save examination record.');
    }
  };

  const handleEdit = (exam) => {
    // Populate the form with existing exam data
    setExamForm({
      id: exam._id,
      studentId: exam.student?._id || '',
      classId: exam.className || exam.class?._id || '',
      examType: exam.examType,
      examDate: new Date(exam.examDate).toISOString().split('T')[0],
      remarks: exam.remarks || ''
    });
    setSubjects(exam.subjects || [{ subjectName: '', totalMarks: 100, obtainedMarks: '', remarks: '' }]);
    setShowAddModal(true);
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this examination record?')) {
      try {
        await examinationAPI.deleteExamination(examId);
        fetchData();
        alert('Examination record deleted successfully!');
      } catch (error) {
        console.error('Error deleting examination:', error);
        alert('Failed to delete examination record.');
      }
    }
  };

  const handleDeleteAll = async () => {
    const totalExams = examinations.length;
    
    if (totalExams === 0) {
      alert('No examination records to delete!');
      return;
    }

    // First confirmation
    const firstConfirm = window.confirm(
      `⚠️ WARNING: You are about to delete ALL ${totalExams} examination records!\n\n` +
      'This action CANNOT be undone.\n\n' +
      'Click OK to continue to final confirmation.'
    );

    if (!firstConfirm) return;

    // Second confirmation with exact count
    const secondConfirm = window.confirm(
      `🚨 FINAL CONFIRMATION 🚨\n\n` +
      `Are you ABSOLUTELY SURE you want to permanently delete all ${totalExams} examination records?\n\n` +
      'This will delete:\n' +
      `• ${totalExams} exam records\n` +
      '• All student scores and grades\n' +
      '• All examination history\n\n' +
      'Type YES mentally and click OK to proceed with deletion.'
    );

    if (!secondConfirm) return;

    try {
      setLoading(true);
      
      // Delete all examinations one by one
      const deletePromises = examinations.map(exam => 
        examinationAPI.deleteExamination(exam._id)
      );
      
      await Promise.all(deletePromises);
      
      alert(`✅ Successfully deleted all ${totalExams} examination records!`);
      fetchData();
    } catch (error) {
      console.error('Error deleting all examinations:', error);
      alert('❌ Failed to delete some examination records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredExams = examinations.filter(exam => {
    // Filter by class
    const classMatch = selectedClass === 'All Classes' ||
                       exam.className === selectedClass || 
                       exam.class?.name === selectedClass || 
                       exam.class?.className === selectedClass;
    
    // Filter by exam type
    const examTypeMatch = selectedExamType === 'All Types' ||
                          exam.examType === selectedExamType;
    
    // Filter by academic year (extracted from examDate)
    const examYear = exam.examDate ? new Date(exam.examDate).getFullYear().toString() : null;
    const yearMatch = selectedYear === 'All Years' || examYear === selectedYear;
    
    return classMatch && examTypeMatch && yearMatch;
  });

  // Get unique academic years from examination dates
  const academicYears = [...new Set(examinations.map(e => 
    e.examDate ? new Date(e.examDate).getFullYear().toString() : null
  ).filter(Boolean))].sort((a, b) => b - a);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Examination Scores</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)} 
            className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-300 font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
          >
            <span>➕</span><span>Add Score</span>
          </button>
          <button 
            onClick={handleDeleteAll}
            disabled={examinations.length === 0 || loading}
            className="px-6 py-2 bg-red-100 text-red-700 rounded-lg border border-red-300 font-medium hover:bg-red-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>🗑️</span><span>Delete All Exams</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
              size="1"
            >
              <option>All Classes</option>
              {classes.map(className => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Exam Type</label>
            <select 
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option>All Types</option>
              <option>MST-1</option>
              <option>MST-2</option>
              <option>MST-3</option>
              <option>Final</option>
              <option>Unit Test</option>
              <option>Mid-term</option>
              <option>Quarterly</option>
              <option>Half-Yearly</option>
              <option>Annual</option>
              <option>Other</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Academic Year</label>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option>All Years</option>
              {academicYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedClass !== 'All Classes' || selectedExamType !== 'All Types' || selectedYear !== 'All Years') && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600">Active Filters:</span>
            {selectedClass !== 'All Classes' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Class: {selectedClass}
                <button 
                  onClick={() => setSelectedClass('All Classes')}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedExamType !== 'All Types' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Type: {selectedExamType}
                <button 
                  onClick={() => setSelectedExamType('All Types')}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedYear !== 'All Years' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Year: {selectedYear}
                <button 
                  onClick={() => setSelectedYear('All Years')}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedClass('All Classes');
                setSelectedExamType('All Types');
                setSelectedYear('All Years');
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading examination records...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
            <h2 className="text-lg font-bold text-gray-800">Examination Records ({filteredExams.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Exam Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subjects</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Overall %</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                      No examination records found. Add a new record to get started.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam) => (
                    <tr key={exam._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{exam.student?.fullName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {exam.className || exam.class?.name || exam.class?.className || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {exam.examDate ? new Date(exam.examDate).getFullYear() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{exam.examType}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {exam.subjects?.length || 0} subjects
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {exam.overallPercentage?.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          exam.overallGrade === 'A+' || exam.overallGrade === 'A' ? 'bg-green-100 text-green-800' :
                          exam.overallGrade === 'B' ? 'bg-blue-100 text-blue-800' :
                          exam.overallGrade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {exam.overallGrade}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          exam.resultStatus === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {exam.resultStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(exam.examDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(exam)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(exam._id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium transition-colors"
                          >
                            🗑️ Delete
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
      )}

      {/* Add Score Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-blue-300 w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="bg-blue-100 px-6 py-4 border-b-2 border-blue-300">
              <h2 className="text-xl font-bold text-blue-800">
                {examForm.id ? 'Edit Examination Score' : 'Add Examination Score'}
              </h2>
            </div>
            <form onSubmit={handleSubmitExam} className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Mode Selection - Only for new entries */}
              {!examForm.id && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Entry Mode</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="addMode"
                        value="single"
                        checked={addMode === 'single'}
                        onChange={(e) => setAddMode(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Single Exam (MST-1 OR MST-2 OR MST-3 OR Final)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="addMode"
                        value="all-four"
                        checked={addMode === 'all-four'}
                        onChange={(e) => setAddMode(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">All Four Exams (MST-1 + MST-2 + MST-3 + Final)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Class *</label>
                  <select
                    name="classId"
                    value={examForm.classId}
                    onChange={(e) => {
                      handleInputChange(e);
                      setExamForm({...examForm, classId: e.target.value, studentId: ''});
                    }}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    style={{ maxHeight: '300px', overflowY: 'auto' }}
                    size="1"
                  >
                    <option value="">-- Select Class First --</option>
                    {classes.map(className => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select class first, then student</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student *</label>
                  <select
                    name="studentId"
                    value={examForm.studentId}
                    onChange={handleInputChange}
                    required
                    disabled={!examForm.classId}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">-- Select Student --</option>
                    {students
                      .filter(student => {
                        // Check if classId matches new format (1A-12D) or is a database ObjectId
                        const isPredefinedClass = /^\d{1,2}[A-D]$/i.test(examForm.classId);
                        if (isPredefinedClass) {
                          return student.className && student.className.toUpperCase() === examForm.classId.toUpperCase();
                        } else {
                          return student.classId?._id === examForm.classId;
                        }
                      })
                      .map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.fullName} ({student.email})
                        </option>
                      ))}
                  </select>
                  {!examForm.classId && (
                    <p className="text-xs text-orange-600 mt-1">Please select a class first</p>
                  )}
                </div>
                {addMode === 'single' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Type *</label>
                    <select
                      name="examType"
                      value={examForm.examType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option value="">-- Select Exam Type --</option>
                      <option>MST-1</option>
                      <option>MST-2</option>
                      <option>MST-3</option>
                      <option>Final</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Date</label>
                  <input
                    type="date"
                    name="examDate"
                    value={examForm.examDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">General Remarks</label>
                  <input
                    type="text"
                    name="remarks"
                    value={examForm.remarks}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Optional remarks"
                  />
                </div>
              </div>

              {/* Subjects Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {addMode === 'single' ? 'Subjects & Marks' : 'Subjects & Marks for All 4 Exams'}
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md border border-blue-300 font-medium hover:bg-blue-200 transition-colors text-sm"
                  >
                    + Add Subject
                  </button>
                </div>

                {addMode === 'single' ? (
                  subjects.map((subject, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700">Subject {index + 1}</h4>
                      {subjects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Subject Name *</label>
                        <input
                          type="text"
                          value={subject.subjectName}
                          onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                          placeholder="e.g., Mathematics"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Total Marks *</label>
                        <input
                          type="number"
                          value={subject.totalMarks}
                          onChange={(e) => handleSubjectChange(index, 'totalMarks', e.target.value)}
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Obtained Marks *</label>
                        <input
                          type="number"
                          value={subject.obtainedMarks}
                          onChange={(e) => handleSubjectChange(index, 'obtainedMarks', e.target.value)}
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Remarks</label>
                        <input
                          type="text"
                          value={subject.remarks}
                          onChange={(e) => handleSubjectChange(index, 'remarks', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  // All-four mode: Show table with MST-1, MST-2, MST-3, Final columns
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead className="bg-gray-100">
                        <tr>
                          <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-sm">Subject</th>
                          <th colSpan="2" className="border border-gray-300 px-3 py-2 text-sm bg-blue-50">MST-1</th>
                          <th colSpan="2" className="border border-gray-300 px-3 py-2 text-sm bg-green-50">MST-2</th>
                          <th colSpan="2" className="border border-gray-300 px-3 py-2 text-sm bg-yellow-50">MST-3</th>
                          <th colSpan="2" className="border border-gray-300 px-3 py-2 text-sm bg-purple-50">Final</th>
                          <th rowSpan="2" className="border border-gray-300 px-3 py-2 text-sm">Action</th>
                        </tr>
                        <tr>
                          <th className="border border-gray-300 px-2 py-1 text-xs bg-blue-50">Total</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs bg-blue-50">Obtained</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs bg-green-50">Total</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs bg-green-50">Obtained</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs bg-yellow-50">Total</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs bg-yellow-50">Obtained</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs bg-purple-50">Total</th>
                          <th className="border border-gray-300 px-2 py-1 text-xs bg-purple-50">Obtained</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.map((subject, index) => (
                          <tr key={index}>
                            <td className="border border-gray-300 px-2 py-2">
                              <input
                                type="text"
                                value={subject.subjectName}
                                onChange={(e) => handleSubjectChange(index, 'subjectName', e.target.value)}
                                required
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="Subject"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-2 bg-blue-50">
                              <input
                                type="number"
                                value={examTotalMarks['MST-1'][subject.subjectName] || ''}
                                onChange={(e) => {
                                  const updated = {...examTotalMarks};
                                  updated['MST-1'][subject.subjectName] = e.target.value;
                                  setExamTotalMarks(updated);
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="100"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-2 bg-blue-50">
                              <input
                                type="number"
                                value={allFourMarks['MST-1'][subject.subjectName] || ''}
                                onChange={(e) => {
                                  const updated = {...allFourMarks};
                                  updated['MST-1'][subject.subjectName] = e.target.value;
                                  setAllFourMarks(updated);
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-2 bg-green-50">
                              <input
                                type="number"
                                value={examTotalMarks['MST-2'][subject.subjectName] || ''}
                                onChange={(e) => {
                                  const updated = {...examTotalMarks};
                                  updated['MST-2'][subject.subjectName] = e.target.value;
                                  setExamTotalMarks(updated);
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="100"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-2 bg-green-50">
                              <input
                                type="number"
                                value={allFourMarks['MST-2'][subject.subjectName] || ''}
                                onChange={(e) => {
                                  const updated = {...allFourMarks};
                                  updated['MST-2'][subject.subjectName] = e.target.value;
                                  setAllFourMarks(updated);
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-2 bg-yellow-50">
                              <input
                                type="number"
                                value={examTotalMarks['MST-3'][subject.subjectName] || ''}
                                onChange={(e) => {
                                  const updated = {...examTotalMarks};
                                  updated['MST-3'][subject.subjectName] = e.target.value;
                                  setExamTotalMarks(updated);
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="100"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-2 bg-yellow-50">
                              <input
                                type="number"
                                value={allFourMarks['MST-3'][subject.subjectName] || ''}
                                onChange={(e) => {
                                  const updated = {...allFourMarks};
                                  updated['MST-3'][subject.subjectName] = e.target.value;
                                  setAllFourMarks(updated);
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-2 bg-purple-50">
                              <input
                                type="number"
                                value={examTotalMarks['Final'][subject.subjectName] || ''}
                                onChange={(e) => {
                                  const updated = {...examTotalMarks};
                                  updated['Final'][subject.subjectName] = e.target.value;
                                  setExamTotalMarks(updated);
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="100"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-2 bg-purple-50">
                              <input
                                type="number"
                                value={allFourMarks['Final'][subject.subjectName] || ''}
                                onChange={(e) => {
                                  const updated = {...allFourMarks};
                                  updated['Final'][subject.subjectName] = e.target.value;
                                  setAllFourMarks(updated);
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-2 py-2 text-center">
                              {subjects.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSubject(index)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Remove
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-6 border-t pt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-100 text-green-700 rounded-md border border-green-300 font-medium hover:bg-green-200 transition-colors"
                >
                  Add Examination
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSubjects([{ subjectName: '', totalMarks: 100, obtainedMarks: '', remarks: '' }]);
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
    </div>
  );
};

export default ExaminationScores;
