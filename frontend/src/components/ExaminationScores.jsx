import { useState, useEffect } from 'react';
import { examinationAPI, classAPI, authAPI } from '../api';

const ExaminationScores = () => {
  const [examinations, setExaminations] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  
  const [examForm, setExamForm] = useState({
    studentId: '',
    classId: '',
    examName: '',
    examType: 'Unit Test',
    examDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });

  const [subjects, setSubjects] = useState([
    { subjectName: '', totalMarks: 100, obtainedMarks: '', remarks: '' }
  ]);

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
      const classesRes = await classAPI.getAllClasses();
      setClasses(classesRes.data.data || []);
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
      // Validate subjects
      const validSubjects = subjects.filter(s => s.subjectName && s.totalMarks && s.obtainedMarks !== '');
      if (validSubjects.length === 0) {
        alert('Please add at least one subject with complete information');
        return;
      }

      const examData = {
        student: examForm.studentId,
        classId: examForm.classId,
        examName: examForm.examName,
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

      await examinationAPI.createExamination(examData);
      setShowAddModal(false);
      setExamForm({
        studentId: '',
        classId: '',
        examName: '',
        examType: 'Unit Test',
        examDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      setSubjects([{ subjectName: '', totalMarks: 100, obtainedMarks: '', remarks: '' }]);
      fetchData();
      alert('Examination record added successfully!');
    } catch (error) {
      console.error('Error adding examination:', error);
      alert(error.response?.data?.message || 'Failed to add examination record.');
    }
  };

  const filteredExams = selectedClass === 'All Classes'
    ? examinations
    : examinations.filter(exam => exam.classId?.name === selectedClass);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Examination Scores</h1>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-300 font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
        >
          <span>➕</span><span>Add Score</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
        <select 
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
        >
          <option>All Classes</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls.name}>{cls.name}</option>
          ))}
        </select>
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Exam Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Exam Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subjects</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Overall %</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No examination records found. Add a new record to get started.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam) => (
                    <tr key={exam._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{exam.student?.fullName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{exam.class?.className || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{exam.examName}</td>
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
              <h2 className="text-xl font-bold text-blue-800">Add Examination Score</h2>
            </div>
            <form onSubmit={handleSubmitExam} className="p-6 max-h-[80vh] overflow-y-auto">
              {/* Basic Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID *</label>
                  <input
                    type="text"
                    name="studentId"
                    value={examForm.studentId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter student ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class ID *</label>
                  <input
                    type="text"
                    name="classId"
                    value={examForm.classId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter class ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Name *</label>
                  <input
                    type="text"
                    name="examName"
                    value={examForm.examName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="e.g., Mid-Term 2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exam Type</label>
                  <select
                    name="examType"
                    value={examForm.examType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option>Unit Test</option>
                    <option>Mid-term</option>
                    <option>Final</option>
                    <option>Quarterly</option>
                    <option>Half-Yearly</option>
                    <option>Annual</option>
                  </select>
                </div>
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
                  <h3 className="text-lg font-bold text-gray-800">Subjects & Marks</h3>
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md border border-blue-300 font-medium hover:bg-blue-200 transition-colors text-sm"
                  >
                    + Add Subject
                  </button>
                </div>

                {subjects.map((subject, index) => (
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
                ))}
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
