import { useState } from 'react';

const StudentsClasses = () => {
  const [activeTab, setActiveTab] = useState('Students');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    rollNumber: '',
    class: '',
    section: '',
    dateOfBirth: '',
    parentName: '',
    parentPhone: '',
    admissionDate: '2025-11-03',
    address: ''
  });

  const stats = [
    { id: 1, number: '3', label: 'Total Students', color: 'text-blue-600' },
    { id: 2, number: '4', label: 'Total Classes', color: 'text-green-600' },
    { id: 3, number: '10', label: 'Available Seats', color: 'text-orange-600' },
    { id: 4, number: '120', label: 'Total Capacity', color: 'text-purple-600' },
  ];

  const [students, setStudents] = useState([
    { rollNo: '001', name: 'Alice Johnson', class: '10-A', parent: 'Robert Johnson', phone: '+1-555-0101', admissionDate: '01/04/2023' },
    { rollNo: '002', name: 'Bob Smith', class: '10-A', parent: 'Mary Smith', phone: '+1-555-0102', admissionDate: '01/04/2023' },
    { rollNo: '003', name: 'Charlie Brown', class: '10-A', parent: 'John Brown', phone: '+1-555-0103', admissionDate: '01/04/2023' },
  ]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    const newStudent = {
      rollNo: `00${students.length + 1}`,
      name: formData.studentName,
      class: formData.class,
      parent: formData.parentName,
      phone: formData.parentPhone,
      admissionDate: formData.admissionDate
    };
    setStudents([...students, newStudent]);
    setShowAddModal(false);
    setFormData({
      studentName: '',
      rollNumber: '',
      class: '',
      section: '',
      dateOfBirth: '',
      parentName: '',
      parentPhone: '',
      admissionDate: '2025-11-03',
      address: ''
    });
  };

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

      {/* Summary Section */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
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
          <select className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none">
            <option>All Classes</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              ['A', 'B', 'C', 'D'].map(grade => (
                <option key={`${num}-${grade}`} value={`${num}-${grade}`}>{num}-{grade}</option>
              ))
            ))}
          </select>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg border border-blue-300 font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          <span>Add New Student</span>
        </button>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-blue-300 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-100 px-6 py-4 border-b-2 border-blue-300">
              <h2 className="text-xl font-bold text-blue-800">Add New Student</h2>
            </div>
            <form onSubmit={handleAddStudent} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name</label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Roll Number</label>
                  <input
                    type="text"
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter roll number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="">Select Class</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      ['A', 'B', 'C', 'D'].map(grade => (
                        <option key={`${num}-${grade}`} value={`${num}-${grade}`}>{num}-{grade}</option>
                      ))
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Section</label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  >
                    <option value="">Select Section</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Name</label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter parent/guardian name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Phone</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Admission Date</label>
                  <input
                    type="date"
                    name="admissionDate"
                    value={formData.admissionDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
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
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-800">Students List ({students.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Roll No.</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Parent Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Admission Date</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{student.rollNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.parent}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{student.admissionDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsClasses;
