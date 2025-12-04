import { useState, useEffect } from 'react';
import { attendanceAPI, classAPI, authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const Attendance = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyClass, setHistoryClass] = useState('');
  const [historyDate, setHistoryDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      let classNames = [];
      
      // If user is a teacher, fetch only their assigned classes
      if (user?.role === 'teacher') {
        try {
          const assignmentsRes = await classAPI.getClassAssignments();
          const allAssignments = assignmentsRes.data.data || [];
          
          // Find classes where this teacher is assigned
          const teacherAssignments = allAssignments.filter(assignment => 
            assignment.assignedTeachers?.some(teacher => teacher._id === user._id)
          );
          
          classNames = teacherAssignments.map(a => a.className.toUpperCase());
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
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadStudents = async () => {
    if (!selectedClass) {
      alert('Please select a class first!');
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch all students
      const studentsResponse = await authAPI.getAllUsers({ role: 'student' });
      const allStudents = studentsResponse.data.data || [];
      
      // Check if selectedClass matches the new format (1A-12Z) or is a database ObjectId
      const isPredefinedClass = /^\d{1,2}[A-Z]$/i.test(selectedClass);
      
      // Filter students based on selected class
      let filteredStudents;
      if (isPredefinedClass) {
        // Filter by className for predefined classes (case-insensitive comparison)
        filteredStudents = allStudents.filter(student => 
          student.className && student.className.toUpperCase() === selectedClass.toUpperCase()
        );
      } else {
        // Filter by classId for database classes
        filteredStudents = allStudents.filter(student => student.classId?._id === selectedClass);
      }
      
      if (filteredStudents.length === 0) {
        alert(`No students enrolled in ${selectedClass}`);
        setStudents([]);
        return;
      }
      
      // Fetch attendance records for today
      try {
        const attendanceResponse = await attendanceAPI.getAttendanceByClass(selectedClass);
        const todayAttendance = attendanceResponse.data.data || [];
        
        // Filter by selected date
        const filteredAttendance = todayAttendance.filter(record => {
          const recordDate = new Date(record.date).toISOString().split('T')[0];
          return recordDate === selectedDate;
        });
        
        // Create a map of student attendance status
        const attendanceMap = {};
        filteredAttendance.forEach(record => {
          attendanceMap[record.student._id || record.student] = record.status === 'present';
        });
        
        setAttendanceRecords(attendanceMap);
      } catch (error) {
        // No attendance marked yet for today
        setAttendanceRecords({});
      }
      
      setStudents(filteredStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceToggle = (studentId) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const markAllPresent = () => {
    const newRecords = {};
    students.forEach(student => {
      newRecords[student._id] = true;
    });
    setAttendanceRecords(newRecords);
  };

  const markAllAbsent = () => {
    const newRecords = {};
    students.forEach(student => {
      newRecords[student._id] = false;
    });
    setAttendanceRecords(newRecords);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || students.length === 0) {
      alert('Please load students first!');
      return;
    }

    try {
      setLoading(true);
      
      // Determine if it's a predefined class (1A-12D format) or database class
      const isPredefinedClass = /^\d{1,2}[A-D]$/i.test(selectedClass);
      
      // Create attendance records for each student
      const attendanceData = students.map(student => {
        const data = {
          student: student._id,
          date: selectedDate,
          status: attendanceRecords[student._id] ? 'present' : 'absent'
        };
        
        // Add classId or className based on type
        if (isPredefinedClass) {
          data.className = selectedClass;
        } else {
          data.classId = selectedClass;
        }
        
        return data;
      });

      // Save each attendance record
      await Promise.all(
        attendanceData.map(record => attendanceAPI.createAttendance(record))
      );

      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance. Some records may already exist for today.');
    } finally {
      setLoading(false);
    }
  };

  const presentCount = students.filter(s => attendanceRecords[s._id]).length;
  const absentCount = students.length - presentCount;

  const handleViewHistory = async () => {
    if (!historyClass) {
      alert('Please select a class to view history!');
      return;
    }

    try {
      setHistoryLoading(true);
      
      // Fetch attendance records for the selected class
      const response = await attendanceAPI.getAttendanceByClass(historyClass);
      const records = response.data.data || [];
      
      // Filter by selected date if provided
      const filteredRecords = historyDate 
        ? records.filter(record => {
            const recordDate = new Date(record.date).toISOString().split('T')[0];
            return recordDate === historyDate;
          })
        : records;
      
      if (filteredRecords.length === 0) {
        alert(`No attendance records found for ${historyClass} on ${historyDate}!`);
        setHistoryData([]);
        setHistoryLoading(false);
        return;
      }
      
      // Group records by date
      const groupedByDate = filteredRecords.reduce((acc, record) => {
        const date = new Date(record.date).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(record);
        return acc;
      }, {});
      
      // Convert to array and sort by date (newest first)
      const historyArray = Object.keys(groupedByDate).map(date => ({
        date,
        records: groupedByDate[date],
        totalStudents: groupedByDate[date].length,
        present: groupedByDate[date].filter(r => r.status === 'present').length,
        absent: groupedByDate[date].filter(r => r.status === 'absent').length
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setHistoryData(historyArray);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      alert('Failed to fetch attendance history. Please try again.');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Attendance Management</h1>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg border border-purple-300 font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
        >
          <span>📜</span>
          <span>{showHistory ? 'Mark Attendance' : 'View History'}</span>
        </button>
      </div>
      
      {/* Attendance History Section */}
      {showHistory ? (
        <div>
          {/* History Filter Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300 p-6 mb-6 shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📜</span>
              <h2 className="text-xl font-bold text-purple-800">Attendance History</h2>
            </div>
            <p className="text-sm text-gray-700 mb-4">View previous attendance records by class and date</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🎓 Select Class <span className="text-red-500">*</span></label>
                <select 
                  value={historyClass} 
                  onChange={(e) => setHistoryClass(e.target.value)} 
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none bg-white"
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                  size="1"
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(className => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Select Date <span className="text-red-500">*</span></label>
                <input 
                  type="date" 
                  value={historyDate} 
                  onChange={(e) => setHistoryDate(e.target.value)} 
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none" 
                />
              </div>
              <div className="flex items-end">
                <button 
                  onClick={handleViewHistory}
                  disabled={!historyClass || !historyDate || historyLoading}
                  className={`w-full px-6 py-2 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                    historyClass && historyDate && !historyLoading
                      ? 'bg-purple-500 text-white hover:bg-purple-600 border-2 border-purple-600 shadow-md hover:shadow-lg' 
                      : 'bg-gray-200 text-gray-500 border-2 border-gray-300 cursor-not-allowed'
                  }`}
                >
                  <span>🔍</span>
                  <span>{historyLoading ? 'Loading...' : 'View Records'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* History Results */}
          {historyLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading attendance history...</p>
              </div>
            </div>
          ) : historyData.length > 0 ? (
            <div className="space-y-4">
              {historyData.map((dayRecord, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 border-b border-gray-300">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-gray-800">📅 {dayRecord.date}</h3>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-700 font-semibold">✅ Present: {dayRecord.present}</span>
                        <span className="text-red-700 font-semibold">❌ Absent: {dayRecord.absent}</span>
                        <span className="text-blue-700 font-semibold">👥 Total: {dayRecord.totalStudents}</span>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Marked At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayRecord.records.map((record) => (
                          <tr key={record._id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-700">{record.student?.fullName || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{record.student?.email || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                record.status === 'present' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {record.status === 'present' ? '✅ Present' : '❌ Absent'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {new Date(record.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No History Found</h3>
              <p className="text-gray-600">Select a class and click "View Records" to see attendance history</p>
            </div>
          )}
        </div>
      ) : (
        <>
      {/* Important: Class Selection Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300 p-6 mb-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🏫</span>
          <h2 className="text-xl font-bold text-blue-800">Select Class for Attendance</h2>
          <span className="ml-2 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-300">REQUIRED</span>
        </div>
        <p className="text-sm text-gray-700 mb-4">⚠️ Please select a class and click "Load Students" to begin marking attendance</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Attendance Date</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🎓 Select Class <span className="text-red-500">*</span></label>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              style={{ maxHeight: '300px', overflowY: 'auto' }}
              size="1"
              disabled={loading}
            >
              <option value="">-- Select Class --</option>
              {classes.map(className => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleLoadStudents}
              disabled={!selectedClass}
              className={`w-full px-6 py-2 rounded-md font-semibold transition-all flex items-center justify-center gap-2 ${
                selectedClass 
                  ? 'bg-blue-500 text-white hover:bg-blue-600 border-2 border-blue-600 shadow-md hover:shadow-lg' 
                  : 'bg-gray-200 text-gray-500 border-2 border-gray-300 cursor-not-allowed'
              }`}
            >
              <span>📋</span>
              <span>Load Students</span>
            </button>
          </div>
        </div>
        
        {selectedClass && students.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-md">
            <p className="text-sm text-green-800 font-medium">
              ✅ Loaded {students.length} students from selected class
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions - only show when students are loaded */}
      {students.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button onClick={markAllPresent} className="px-6 py-2 bg-green-100 text-green-700 rounded-md border border-green-300 font-medium hover:bg-green-200 transition-colors flex items-center gap-2">
              <span>✅</span><span>Mark All Present</span>
            </button>
            <button onClick={markAllAbsent} className="px-6 py-2 bg-red-100 text-red-700 rounded-md border border-red-300 font-medium hover:bg-red-200 transition-colors flex items-center gap-2">
              <span>❌</span><span>Mark All Absent</span>
            </button>
            <button 
              onClick={handleSaveAttendance}
              disabled={loading}
              className="px-6 py-2 bg-blue-100 text-blue-700 rounded-md border border-blue-300 font-medium hover:bg-blue-200 transition-colors flex items-center gap-2 ml-auto disabled:opacity-50"
            >
              <span>💾</span><span>{loading ? 'Saving...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Attendance Summary - only show when students are loaded */}
      {students.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Attendance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{students.length}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{presentCount}</div>
              <div className="text-sm text-gray-600">Present</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{absentCount}</div>
              <div className="text-sm text-gray-600">Absent</div>
            </div>
          </div>
        </div>
      )}

      {/* Student List - only show when students are loaded */}
      {students.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-300 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Student Attendance List</h2>
            <span className="text-sm text-gray-600">Date: {selectedDate}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{student.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={attendanceRecords[student._id] || false} 
                          onChange={() => handleAttendanceToggle(student._id)} 
                          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer" 
                        />
                        <span className={`text-sm font-medium ${attendanceRecords[student._id] ? 'text-green-600' : 'text-red-600'}`}>
                          {attendanceRecords[student._id] ? 'Present' : 'Absent'}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Class Selected</h3>
          <p className="text-gray-600">Please select a class and click "Load Students" to begin marking attendance</p>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default Attendance;
