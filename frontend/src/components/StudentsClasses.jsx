import { useState, useEffect } from 'react';
import { authAPI, classAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const StudentsClasses = () => {
  const { user } = useAuth(); // Get current user
  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin'; // Check if user is teacher or admin
  
  // Debug: Log user role
  useEffect(() => {
    console.log('Current User:', user);
    console.log('User Role:', user?.role);
    console.log('Is Teacher or Admin:', isTeacherOrAdmin);
  }, [user, isTeacherOrAdmin]);
  
  const [activeTab, setActiveTab] = useState('Students');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student',
    phone: '',
    address: '',
    classId: '',
    className: ''
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
    const { name, value } = e.target;
    
    // If changing class, handle both classId and className
    if (name === 'classId') {
      // Check if it's a predefined class (string) or database class (ObjectId)
      const isPredefinedClass = value.startsWith('Class ');
      setFormData({
        ...formData,
        classId: isPredefinedClass ? '' : value, // Set empty if predefined
        className: isPredefinedClass ? value : '' // Set className if predefined
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      // Generate username from email (everything before @)
      const username = formData.email.split('@')[0].toLowerCase();
      
      // Add username and auto-generated password to formData
      const studentData = {
        ...formData,
        username: username,
        password: 'Student@123' // Default password for all students
      };
      
      console.log('Sending student data:', studentData); // Debug log
      
      await authAPI.register(studentData);
      setShowAddModal(false);
      setFormData({
        fullName: '',
        email: '',
        role: 'student',
        phone: '',
        address: '',
        classId: '',
        className: ''
      });
      // Refresh data after adding student
      fetchData();
      alert('Student added successfully!\nDefault Password: Student@123');
    } catch (error) {
      console.error('Error adding student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add student. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${studentName}?\n\nThis action cannot be undone.`);
    
    if (!confirmed) return;

    try {
      await authAPI.deleteUser(studentId);
      alert(`${studentName} has been deleted successfully!`);
      fetchData(); // Refresh the student list
    } catch (error) {
      console.error('Error deleting student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete student. Please try again.';
      alert(errorMessage);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setFormData({
      fullName: student.fullName,
      email: student.email,
      role: 'student',
      phone: student.phone || '',
      address: student.address || '',
      classId: student.classId || '',
      className: student.className || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    
    try {
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        classId: formData.classId || null
      };

      await authAPI.updateUser(editingStudent._id, updateData);
      setShowEditModal(false);
      setEditingStudent(null);
      setFormData({
        fullName: '',
        email: '',
        role: 'student',
        phone: '',
        address: '',
        classId: '',
        className: ''
      });
      fetchData();
      alert('Student updated successfully!');
    } catch (error) {
      console.error('Error updating student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update student. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDeleteAllStudents = async () => {
    const studentCount = students.length;
    
    if (studentCount === 0) {
      alert('No students to delete!');
      return;
    }

    const confirmMessage = `⚠️ WARNING: This will permanently delete ALL ${studentCount} students from the database!\n\nThis action CANNOT be undone.\n\nType "DELETE ALL" to confirm:`;
    const userInput = prompt(confirmMessage);
    
    if (userInput !== 'DELETE ALL') {
      alert('Deletion cancelled. You must type "DELETE ALL" exactly to confirm.');
      return;
    }

    // Double confirmation
    const doubleConfirm = confirm(`Are you ABSOLUTELY SURE you want to delete all ${studentCount} students?\n\nClick OK to proceed with deletion.`);
    
    if (!doubleConfirm) {
      alert('Deletion cancelled.');
      return;
    }

    setLoading(true);

    try {
      let successCount = 0;
      let failCount = 0;

      // Delete all students one by one
      for (const student of students) {
        try {
          await authAPI.deleteUser(student._id);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete ${student.fullName}:`, error);
          failCount++;
        }
      }

      if (failCount === 0) {
        alert(`✅ Successfully deleted all ${successCount} students!`);
      } else {
        alert(`⚠️ Deleted ${successCount} students.\n${failCount} students could not be deleted.`);
      }

      // Refresh the list
      fetchData();

    } catch (error) {
      console.error('Error during bulk deletion:', error);
      alert('❌ An error occurred during deletion. Please check console for details.');
    } finally {
      setLoading(false);
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
      if (values.length >= 2) { // At least name and email
        const email = values[headers.indexOf('email') !== -1 ? headers.indexOf('email') : 1] || values[1];
        const username = email.split('@')[0].toLowerCase(); // Generate username from email
        
        // Get class value from CSV
        const classValue = values[headers.indexOf('class') !== -1 ? headers.indexOf('class') : 5] || values[5] || '';
        
        // Check if it's a predefined class (starts with "Class") or a database class
        let studentClassData = {};
        if (classValue) {
          if (classValue.startsWith('Class ')) {
            // Predefined class like "Class 2 - Section A"
            studentClassData.className = classValue;
          } else {
            // Try to find database class by name
            const classObj = classes.find(cls => cls.name.toLowerCase() === classValue.toLowerCase());
            if (classObj) {
              studentClassData.classId = classObj._id;
            } else {
              // If not found in database, treat as predefined class
              studentClassData.className = classValue;
            }
          }
        }
        
        const student = {
          fullName: values[headers.indexOf('name') !== -1 ? headers.indexOf('name') : 0] || values[0],
          email: email,
          username: username, // Add username
          password: 'Student@123', // Auto-generated password
          role: 'student',
          phone: values[headers.indexOf('phone') !== -1 ? headers.indexOf('phone') : 3] || values[3] || '',
          address: values[headers.indexOf('address') !== -1 ? headers.indexOf('address') : 4] || values[4] || '',
          ...studentClassData // Add classId or className
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
          const failedStudents = [];

          for (let i = 0; i < studentsData.length; i++) {
            try {
              await authAPI.register(studentsData[i]);
              successCount++;
            } catch (error) {
              console.error(`Failed to add student ${studentsData[i].fullName}:`, error);
              const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
              failedStudents.push({
                name: studentsData[i].fullName,
                email: studentsData[i].email,
                reason: errorMsg
              });
              failCount++;
            }
            setUploadProgress(Math.round(((i + 1) / studentsData.length) * 100));
          }

          setShowBulkUploadModal(false);
          setUploadFile(null);
          setUploadProgress(0);
          fetchData();
          
          // Show detailed results
          let message = `✅ Bulk upload complete!\n\n`;
          message += `Successfully added: ${successCount}\n`;
          message += `Failed: ${failCount}`;
          
          if (failedStudents.length > 0) {
            message += `\n\n❌ Failed Students:\n`;
            failedStudents.forEach(student => {
              message += `\n• ${student.name} (${student.email})\n  Reason: ${student.reason}`;
            });
          }
          
          alert(message);
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
        // Filter by class if student has classId populated or className
        return student.classId?.name === selectedClass || student.className === selectedClass;
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
                  <optgroup label="─── Database Classes ───">
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls.name}>{cls.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            {isTeacherOrAdmin && (
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
                {students.length > 0 && (
                  <button 
                    onClick={handleDeleteAllStudents}
                    className="px-6 py-2 bg-red-100 text-red-700 rounded-lg border border-red-300 font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                    title="Delete all students from database"
                  >
                    <span>🗑️</span>
                    <span>Delete All Students</span>
                  </button>
                )}
              </div>
            )}
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
                  <li>• First row should be headers: <code className="bg-white px-1 rounded">name, email, phone, address, class</code></li>
                  <li>• For class field, use predefined classes like: <code className="bg-white px-1 rounded">Class 1 - Section A</code></li>
                  <li>• Example: <code className="bg-white px-2 py-1 rounded">John Doe,john@example.com,1234567890,123 Street,Class 2 - Section A</code></li>
                  <li>• Password will be auto-generated as <code className="bg-white px-1 rounded font-mono">Student@123</code></li>
                  <li>• Leave class empty if not assigning to any class</li>
                </ul>
              </div>

              {/* Download Template */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    // Generate sample CSV with predefined classes
                    const csvContent = `name,email,phone,address,class\nJohn Doe,john@example.com,1234567890,123 Main St,Class 1 - Section A\nJane Smith,jane@example.com,0987654321,456 Oak Ave,Class 2 - Section B\nMike Johnson,mike@example.com,9876543210,789 Park Rd,Class 3 - Section C`;
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

              {/* Available Classes */}
              {classes.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">📚 Available Classes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((cls) => (
                      <span 
                        key={cls._id} 
                        className="px-3 py-1 bg-white border border-gray-300 rounded-full text-sm text-gray-700"
                      >
                        {cls.name}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Use these exact class names in your CSV file
                  </p>
                </div>
              )}

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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to Class</label>
                  <select
                    name="classId"
                    value={formData.classId || formData.className}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="">Select Class (Optional)</option>
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
                      <optgroup label="─────────────────">
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name} - {cls.subject}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
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
              
              {/* Info about auto-generated password */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  <span className="font-semibold">ℹ️ Note:</span> Default password will be set as <code className="bg-blue-100 px-2 py-1 rounded font-mono">Student@123</code>
                </p>
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

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-orange-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-orange-100 px-6 py-4 border-b-2 border-orange-300">
              <h2 className="text-xl font-bold text-orange-800">Edit Student</h2>
            </div>
            <form onSubmit={handleUpdateStudent} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Assign to Class</label>
                  <select
                    name="classId"
                    value={formData.classId || formData.className}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
                  >
                    <option value="">Select Class (Optional)</option>
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
                      <optgroup label="─────────────────">
                        {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>
                            {cls.name} - {cls.subject}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="Enter complete address"
                  />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-100 text-orange-700 rounded-md border border-orange-300 font-medium hover:bg-orange-200 transition-colors flex items-center gap-2"
                >
                  <span>💾</span>
                  <span>Update Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStudent(null);
                    setFormData({
                      fullName: '',
                      email: '',
                      role: 'student',
                      phone: '',
                      address: '',
                      classId: '',
                      className: ''
                    });
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
                  {isTeacherOrAdmin && (
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={isTeacherOrAdmin ? "7" : "6"} className="px-6 py-8 text-center text-gray-500">
                      No students found. Add a new student to get started.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{student.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.classId?.name || student.className || 'Not Assigned'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{student.address || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(student.createdAt).toLocaleDateString()}
                      </td>
                      {isTeacherOrAdmin && (
                        <td className="px-6 py-4 text-center">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEditStudent(student)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md border border-blue-300 font-medium hover:bg-blue-200 transition-colors text-sm flex items-center gap-1"
                              title="Edit Student"
                            >
                              <span>✏️</span>
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student._id, student.fullName)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-md border border-red-300 font-medium hover:bg-red-200 transition-colors text-sm flex items-center gap-1"
                              title="Delete Student"
                            >
                              <span>🗑️</span>
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      )}
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
