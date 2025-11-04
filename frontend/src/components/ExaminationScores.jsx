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
    subject: '',
    examType: 'Unit Test',
    maxMarks: 100,
    obtainedMarks: '',
    examDate: new Date().toISOString().split('T')[0],
    remarks: ''
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

  const handleSubmitExam = async (e) => {
    e.preventDefault();
    try {
      await examinationAPI.createExamination(examForm);
      setShowAddModal(false);
      setExamForm({
        studentId: '',
        classId: '',
        subject: '',
        examType: 'Unit Test',
        maxMarks: 100,
        obtainedMarks: '',
        examDate: new Date().toISOString().split('T')[0],
        remarks: ''
      });
      fetchData();
      alert('Examination record added successfully!');
    } catch (error) {
      console.error('Error adding examination:', error);
      alert('Failed to add examination record.');
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Exam Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Marks</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Percentage</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No examination records found. Add a new record to get started.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((exam) => (
                    <tr key={exam._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{exam.studentId?.fullName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{exam.classId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{exam.subject}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{exam.examType}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{exam.obtainedMarks}/{exam.maxMarks}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {((exam.obtainedMarks / exam.maxMarks) * 100).toFixed(2)}%
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
          <div className="bg-white rounded-lg border-2 border-blue-300 w-full max-w-2xl">
            <div className="bg-blue-100 px-6 py-4 border-b-2 border-blue-300">
              <h2 className="text-xl font-bold text-blue-800">Add Examination Score</h2>
            </div>
            <form onSubmit={handleSubmitExam} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class ID</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={examForm.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter subject"
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
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Marks</label>
                  <input
                    type="number"
                    name="maxMarks"
                    value={examForm.maxMarks}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Obtained Marks</label>
                  <input
                    type="number"
                    name="obtainedMarks"
                    value={examForm.obtainedMarks}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  />
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
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
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-100 text-green-700 rounded-md border border-green-300 font-medium hover:bg-green-200 transition-colors"
                >
                  Add Record
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
