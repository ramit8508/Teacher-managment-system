import { useState, useEffect } from 'react';
import { classAPI, examinationAPI, authAPI } from '../api';

const BulkExamEditor = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [examData, setExamData] = useState({
    examName: '',
    examSection: '', // New field for exam section/part
    subject: '',
    totalMarks: '',
    examDate: '',
  });
  const [studentMarks, setStudentMarks] = useState({});
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

  const handleClassChange = async (classId) => {
    setSelectedClass(classId);
    
    try {
      let classStudents = [];
      
      if (classId.startsWith('Class')) {
        // Predefined class - fetch all students with this className
        const response = await authAPI.getAllUsers({ role: 'student' });
        const allStudents = response.data.data || [];
        classStudents = allStudents.filter(s => s.className === classId);
      } else {
        // Database class - get students from class roster
        const selectedClassData = classes.find(c => c._id === classId);
        classStudents = selectedClassData?.students || [];
      }
      
      setStudents(classStudents);
      
      // Initialize marks object
      const marks = {};
      classStudents.forEach(student => {
        marks[student._id] = '';
      });
      setStudentMarks(marks);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setStudentMarks({});
    }
  };

  const handleMarkChange = (studentId, marks) => {
    setStudentMarks({
      ...studentMarks,
      [studentId]: marks
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClass || students.length === 0) {
      alert('Please select a class with students');
      return;
    }

    setLoading(true);

    try {
      let updatedCount = 0;
      let createdCount = 0;

      // Process each student
      for (const student of students) {
        const marksObtained = parseInt(studentMarks[student._id]) || 0;
        
        // Check if exam record already exists for this student + examName + examSection
        const existingExamsResponse = await examinationAPI.getExaminationsByStudent(student._id);
        const existingExams = existingExamsResponse.data.data || [];
        
        // Find exam with same name, section, and class
        const existingExam = existingExams.find(exam => 
          exam.examName === examData.examName && 
          (exam.remarks === examData.examSection || (!exam.remarks && !examData.examSection)) &&
          (exam.className === selectedClass || exam.class?._id === selectedClass)
        );

        if (existingExam) {
          // UPDATE: Add new subject to existing exam
          const updatedSubjects = [...existingExam.subjects];
          
          // Check if this subject already exists
          const subjectIndex = updatedSubjects.findIndex(s => s.subjectName === examData.subject);
          
          if (subjectIndex >= 0) {
            // Update existing subject marks
            updatedSubjects[subjectIndex] = {
              subjectName: examData.subject,
              totalMarks: parseInt(examData.totalMarks),
              obtainedMarks: marksObtained,
            };
          } else {
            // Add new subject
            updatedSubjects.push({
              subjectName: examData.subject,
              totalMarks: parseInt(examData.totalMarks),
              obtainedMarks: marksObtained,
            });
          }

          await examinationAPI.updateExamination(existingExam._id, {
            subjects: updatedSubjects,
          });
          updatedCount++;
        } else {
          // CREATE: New exam record
          await examinationAPI.createExamination({
            student: student._id,
            classId: selectedClass,
            examName: examData.examName,
            examType: 'Unit Test',
            subjects: [{
              subjectName: examData.subject,
              totalMarks: parseInt(examData.totalMarks),
              obtainedMarks: marksObtained,
            }],
            examDate: examData.examDate,
            remarks: examData.examSection, // Store exam section in remarks field
          });
          createdCount++;
        }
      }

      const sectionInfo = examData.examSection ? ` (Section: ${examData.examSection})` : '';
      alert(`✅ Success!${sectionInfo}\nCreated: ${createdCount} new exam records\nUpdated: ${updatedCount} existing exams with new subject`);
      
      // Reset form
      setExamData({
        examName: '',
        examSection: '',
        subject: '',
        totalMarks: '',
        examDate: '',
      });
      setSelectedClass('');
      setStudents([]);
      setStudentMarks({});

    } catch (error) {
      console.error('Error creating bulk exam scores:', error);
      console.error('Full error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to record exam scores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (obtained, total) => {
    const percentage = (obtained / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Bulk Exam Score Editor</h1>
        <p className="text-sm sm:text-base text-gray-600">Enter exam scores for all students in a class</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
            >
              <option value="">-- Select a Class --</option>
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

          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={examData.examName}
                onChange={(e) => setExamData({ ...examData, examName: e.target.value })}
                required
                placeholder="e.g., Mid-Term Exam"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Section/Part
                <span className="text-xs text-gray-500 ml-2">(Optional - leave blank if same exam)</span>
              </label>
              <input
                type="text"
                value={examData.examSection}
                onChange={(e) => setExamData({ ...examData, examSection: e.target.value })}
                placeholder="e.g., Part A, Section 1, Theory"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Different sections = separate exam slots. Same/blank = adds subjects to same slot.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={examData.subject}
                onChange={(e) => setExamData({ ...examData, subject: e.target.value })}
                required
                placeholder="e.g., Mathematics"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={examData.totalMarks}
                onChange={(e) => setExamData({ ...examData, totalMarks: e.target.value })}
                required
                min="1"
                placeholder="e.g., 100"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={examData.examDate}
                onChange={(e) => setExamData({ ...examData, examDate: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Student Marks Input */}
          {students.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Enter Marks for Each Student</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Student Name</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Marks Obtained</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-800">{student.fullName}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              value={studentMarks[student._id] || ''}
                              onChange={(e) => handleMarkChange(student._id, e.target.value)}
                              min="0"
                              max={examData.totalMarks || 100}
                              placeholder="Enter marks"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                            {studentMarks[student._id] && examData.totalMarks ? (
                              <span className={`px-2 py-1 rounded ${
                                calculateGrade(parseInt(studentMarks[student._id]), parseInt(examData.totalMarks)).includes('A') 
                                  ? 'bg-green-100 text-green-700'
                                  : calculateGrade(parseInt(studentMarks[student._id]), parseInt(examData.totalMarks)).includes('B')
                                  ? 'bg-blue-100 text-blue-700'
                                  : calculateGrade(parseInt(studentMarks[student._id]), parseInt(examData.totalMarks)).includes('C')
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {calculateGrade(parseInt(studentMarks[student._id]), parseInt(examData.totalMarks))}
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {students.length > 0 && (
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-3 rounded-md font-medium transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>📊</span>
                  Save Exam Scores for All Students
                </span>
              )}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default BulkExamEditor;
