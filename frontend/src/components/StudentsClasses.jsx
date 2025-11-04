import { useState, useEffect } from 'react';
import { authAPI, classAPI } from '../api';

const StudentsClasses = () => {
  const [activeTab, setActiveTab] = useState('Students');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    address: ''
  });

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    availableSeats: 0,
    totalCapacity: 0,
  });

  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all students (users with role='student')
      const studentsRes = await authAPI.getAllUsers({ role: 'student' });
      const studentsList = studentsRes.data.data || [];
      setStudents(studentsList);
      
      // Fetch all classes
      const classesRes = await classAPI.getAllClasses();
      const classesList = classesRes.data.data || [];
      setClasses(classesList);
      
      // Calculate stats
      const totalStudents = studentsList.length;
      const totalClasses = classesList.length;
      const totalCapacity = classesList.reduce((sum, cls) => sum + (cls.capacity || 0), 0);
      const totalEnrolled = classesList.reduce((sum, cls) => sum + (cls.students?.length || 0), 0);
      const availableSeats = totalCapacity - totalEnrolled;
      
      setStats({
        totalStudents,
        totalClasses,
        availableSeats: availableSeats > 0 ? availableSeats : 0,
        totalCapacity,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await authAPI.register(formData);
      setShowAddModal(false);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'student',
        phone: '',
        address: ''
      });
      // Refresh data after adding student
      fetchData();
      alert('Student added successfully!');
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Failed to add student. Please try again.');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setUploadFile(file);
      } else {
        alert('Please upload a valid CSV or Excel file (.csv, .xlsx, .xls)');
        e.target.value = '';
      }
    }
  };

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const students = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 3) {
        const student = {
          fullName: values[headers.indexOf('name') !== -1 ? headers.indexOf('name') : 0] || values[0],
          email: values[headers.indexOf('email') !== -1 ? headers.indexOf('email') : 1] || values[1],
          password: values[headers.indexOf('password') !== -1 ? headers.indexOf('password') : 2] || values[2] || 'Student@123',
          role: 'student',
          phone: values[headers.indexOf('phone') !== -1 ? headers.indexOf('phone') : 3] || '',
          address: values[headers.indexOf('address') !== -1 ? headers.indexOf('address') : 4] || ''
        };
        students.push(student);
      }
    }
    return students;
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      alert('Please select a file first!');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          let studentsData = [];
          
          // Parse CSV file
          if (uploadFile.name.endsWith('.csv')) {
            const text = e.target.result;
            studentsData = parseCSV(text);
          } 
          // For Excel files, we'll treat them as CSV for now
          // In production, you'd want to use a library like xlsx
          else {
            alert('For Excel files, please save as CSV first. Excel parsing requires additional setup.');
            setLoading(false);
            return;
          }

          if (studentsData.length === 0) {
            alert('No valid student data found in file!');
            setLoading(false);
            return;
          }

          // Upload students one by one
          let successCount = 0;
          let failCount = 0;

          for (let i = 0; i < studentsData.length; i++) {
            try {
              await authAPI.register(studentsData[i]);
              successCount++;
            } catch (error) {
              console.error(`Failed to add student ${studentsData[i].fullName}:`, error);
              failCount++;
            }
            setUploadProgress(Math.round(((i + 1) / studentsData.length) * 100));
          }

          setShowBulkUploadModal(false);
          setUploadFile(null);
          setUploadProgress(0);
          fetchData();
          
          alert(`Bulk upload complete!\nSuccessfully added: ${successCount}\nFailed: ${failCount}`);
        } catch (error) {
          console.error('Error processing file:', error);
          alert('Failed to process file. Please check the format.');
        } finally {
          setLoading(false);
        }
      };

      reader.readAsText(uploadFile);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      setLoading(false);
    }
  };

  const statsDisplay = [
    { id: 1, number: stats.totalStudents, label: 'Total Students', color: 'text-blue-600' },
    { id: 2, number: stats.totalClasses, label: 'Total Classes', color: 'text-green-600' },
    { id: 3, number: stats.availableSeats, label: 'Available Seats', color: 'text-orange-600' },
    { id: 4, number: stats.totalCapacity, label: 'Total Capacity', color: 'text-purple-600' },
  ];

  const filteredStudents = selectedClass === 'All Classes'
    ? students
    : students.filter(student => {
        // Filter by class if student has classId populated
        return student.classId?.name === selectedClass;
      });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Students & Classes Management</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('Students')}
          className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'Students'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span>👥</span>
          <span>Students</span>
        </button>
        <button
          onClick={() => setActiveTab('Classes')}
          className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
            activeTab === 'Classes'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span>🎓</span>
          <span>Classes</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Section */}
          <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {statsDisplay.map((stat) => (
                <div key={stat.id} className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <div className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter and Add Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Class</label>
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
              >
                <option>All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls.name}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowBulkUploadModal(true)}
                className="px-6 py-2 bg-purple-100 text-purple-700 rounded-lg border border-purple-300 font-medium hover:bg-purple-200 transition-colors flex items-center gap-2"
              >
                <span>📤</span>
                <span>Bulk Upload</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-300 font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                <span>Add New Student</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-purple-300 w-full max-w-2xl">
            <div className="bg-purple-100 px-6 py-4 border-b-2 border-purple-300">
              <h2 className="text-xl font-bold text-purple-800">Bulk Upload Students</h2>
            </div>
            <div className="p-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-800 mb-2">📋 File Format Instructions:</h3>
                <ul className="text-sm text-blue-700 space-y-1 ml-4">
                  <li>• Upload a CSV file (.csv format)</li>
                  <li>• First row should be headers: name, email, password, phone, address</li>
                  <li>• Example: <code className="bg-white px-2 py-1 rounded">John Doe,john@example.com,Pass123,1234567890,123 Street</code></li>
                  <li>• Minimum required: name, email (password defaults to "Student@123")</li>
                </ul>
              </div>

              {/* Download Template */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    const csvContent = "name,email,password,phone,address\nJohn Doe,john@example.com,Student@123,1234567890,123 Main St\nJane Smith,jane@example.com,Student@123,0987654321,456 Oak Ave";
                    const blob = new Blob([csvContent], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'student_template.csv';
                    a.click();
                  }}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md border border-green-300 font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
                >
                  <span>⬇️</span>
                  <span>Download CSV Template</span>
                </button>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select File</label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
                />
                {uploadFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: <span className="font-medium">{uploadFile.name}</span>
                  </p>
                )}
              </div>

              {/* Progress Bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Uploading students...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleBulkUpload}
                  disabled={!uploadFile || loading}
                  className="px-6 py-2 bg-purple-100 text-purple-700 rounded-md border border-purple-300 font-medium hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <span>📤</span>
                  <span>{loading ? 'Uploading...' : 'Upload Students'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkUploadModal(false);
                    setUploadFile(null);
                    setUploadProgress(0);
                  }}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-blue-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-100 px-6 py-4 border-b-2 border-blue-300">
              <h2 className="text-xl font-bold text-blue-800">Add New Student</h2>
            </div>
            <form onSubmit={handleAddStudent} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter complete address"
                  />
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

      {/* Students List */}
      {!loading && (
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
            <h2 className="text-lg font-bold text-gray-800">Students List ({filteredStudents.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Address</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No students found. Add a new student to get started.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{student.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.classId?.name || 'Not Assigned'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.address || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsClasses;
