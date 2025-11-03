import { useState } from 'react';

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState('2025-11-03');
  const [selectedClass, setSelectedClass] = useState('');
  
  // All students database
  const [allStudents] = useState([
    { rollNo: '001', name: 'Alice Johnson', class: '10-A', attendance: true },
    { rollNo: '002', name: 'Bob Smith', class: '10-A', attendance: true },
    { rollNo: '003', name: 'Charlie Brown', class: '10-A', attendance: false },
    { rollNo: '004', name: 'Diana Prince', class: '10-A', attendance: true },
    { rollNo: '005', name: 'Emma Watson', class: '10-A', attendance: true },
    { rollNo: '011', name: 'Frank Miller', class: '9-B', attendance: true },
    { rollNo: '012', name: 'Grace Lee', class: '9-B', attendance: true },
    { rollNo: '013', name: 'Henry Ford', class: '9-B', attendance: false },
    { rollNo: '014', name: 'Isabella Garcia', class: '9-B', attendance: true },
    { rollNo: '021', name: 'Jack Ryan', class: '8-C', attendance: true },
    { rollNo: '022', name: 'Kate Wilson', class: '8-C', attendance: false },
    { rollNo: '023', name: 'Liam Brown', class: '8-C', attendance: true },
    { rollNo: '024', name: 'Mia Davis', class: '8-C', attendance: true },
    { rollNo: '025', name: 'Noah Martinez', class: '8-C', attendance: true },
  ]);
  
  const [displayedStudents, setDisplayedStudents] = useState([]);

  const handleLoadStudents = () => {
    if (!selectedClass) {
      alert('Please select a class first!');
      return;
    }
    const filtered = allStudents.filter(student => student.class === selectedClass);
    if (filtered.length === 0) {
      alert(`No students found in class ${selectedClass}`);
    }
    setDisplayedStudents(filtered);
  };

  const handleAttendanceToggle = (index) => {
    const updatedStudents = [...displayedStudents];
    updatedStudents[index].attendance = !updatedStudents[index].attendance;
    setDisplayedStudents(updatedStudents);
  };

  const markAllPresent = () => {
    setDisplayedStudents(displayedStudents.map(student => ({ ...student, attendance: true })));
  };

  const markAllAbsent = () => {
    setDisplayedStudents(displayedStudents.map(student => ({ ...student, attendance: false })));
  };

  const presentCount = displayedStudents.filter(s => s.attendance).length;
  const absentCount = displayedStudents.length - presentCount;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Attendance Management</h1>
      
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
            >
              <option value="">-- Select Class --</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                ['A', 'B', 'C', 'D'].map(grade => (
                  <option key={`${num}-${grade}`} value={`${num}-${grade}`}>Class {num}-{grade}</option>
                ))
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
        
        {selectedClass && displayedStudents.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-md">
            <p className="text-sm text-green-800 font-medium">
              ✅ Loaded {displayedStudents.length} students from Class {selectedClass}
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions - only show when students are loaded */}
      {displayedStudents.length > 0 && (
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
              onClick={() => alert('Attendance saved successfully!')}
              className="px-6 py-2 bg-blue-100 text-blue-700 rounded-md border border-blue-300 font-medium hover:bg-blue-200 transition-colors flex items-center gap-2 ml-auto"
            >
              <span>💾</span><span>Save Attendance</span>
            </button>
          </div>
        </div>
      )}

      {/* Attendance Summary - only show when students are loaded */}
      {displayedStudents.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Attendance Summary - Class {selectedClass}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{displayedStudents.length}</div>
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
      {displayedStudents.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-300 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Student Attendance List - Class {selectedClass}</h2>
            <span className="text-sm text-gray-600">Date: {selectedDate}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Roll No.</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {displayedStudents.map((student, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{student.rollNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{student.class}</td>
                    <td className="px-6 py-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={student.attendance} onChange={() => handleAttendanceToggle(index)} className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer" />
                        <span className={`text-sm font-medium ${student.attendance ? 'text-green-600' : 'text-red-600'}`}>
                          {student.attendance ? 'Present' : 'Absent'}
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
    </div>
  );
};

export default Attendance;
