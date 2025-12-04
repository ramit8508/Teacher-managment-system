import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';

const BulkStudentAdd = () => {
  const { user } = useAuth();
  const SUPER_ADMIN_EMAIL = 'admin@school.com';
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'spreadsheet'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Manual entry state
  const [manualStudents, setManualStudents] = useState([
    { fullName: '', email: '', rollNo: '', phone: '', fatherName: '', motherName: '', address: '', className: '' }
  ]);

  // Spreadsheet state
  const [spreadsheetData, setSpreadsheetData] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);

  // Available classes with sections
  const availableClasses = [];
  for (let i = 1; i <= 12; i++) {
    ['A', 'B', 'C', 'D'].forEach(section => {
      availableClasses.push(`${i}${section}`);
    });
  }

  useEffect(() => {
    if (!isSuperAdmin) {
      setMessage({ type: 'error', text: 'Access denied. Only super admin can add students in bulk.' });
    }
  }, [isSuperAdmin]);

  // Manual entry functions
  const addManualRow = () => {
    setManualStudents([
      ...manualStudents,
      { fullName: '', email: '', rollNo: '', phone: '', fatherName: '', motherName: '', address: '', className: '' }
    ]);
  };

  const removeManualRow = (index) => {
    const updated = manualStudents.filter((_, i) => i !== index);
    setManualStudents(updated);
  };

  const updateManualStudent = (index, field, value) => {
    const updated = [...manualStudents];
    updated[index][field] = value;
    setManualStudents(updated);
  };

  const handleManualSubmit = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Validate all required fields
      const invalidRows = manualStudents.filter(
        (student, index) => !student.fullName || !student.email || !student.className
      );

      if (invalidRows.length > 0) {
        setMessage({ type: 'error', text: 'Please fill all required fields (Name, Email, Class)' });
        setLoading(false);
        return;
      }

      // Prepare students data - auto-generate username and password
      const studentsData = manualStudents.map(student => ({
        fullName: student.fullName.trim(),
        email: student.email.trim(),
        username: student.email.split('@')[0].toLowerCase(), // Auto-generate username from email
        password: 'Student@123', // Default password for all students
        rollNo: student.rollNo.trim(),
        phone: student.phone.trim(),
        fatherName: student.fatherName.trim(),
        motherName: student.motherName.trim(),
        address: student.address.trim(),
        className: student.className.trim().toUpperCase(), // Normalize to uppercase (1a -> 1A)
        role: 'student'
      }));

      // Send bulk registration request
      const response = await authAPI.bulkRegister(studentsData);

      setMessage({ 
        type: 'success', 
        text: `Successfully added ${response.data.data.successful} students!${response.data.data.failed > 0 ? ` ${response.data.data.failed} failed.` : ''}` 
      });

      // Reset form
      setManualStudents([
        { fullName: '', email: '', rollNo: '', phone: '', fatherName: '', motherName: '', address: '', className: '' }
      ]);
    } catch (error) {
      console.error('Bulk add error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to add students';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Show first few errors
        const errors = error.response.data.errors.slice(0, 3);
        errorMessage = `Failed to add some students:\n${errors.map(e => `• ${e.email}: ${e.error}`).join('\n')}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Spreadsheet functions
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileInfo({ name: file.name, size: (file.size / 1024).toFixed(2) + ' KB' });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map spreadsheet columns to expected format
        const formattedData = jsonData.map((row, index) => ({
          fullName: row['Name'] || row['name'] || row['Full Name'] || row['fullName'] || '',
          email: row['Email'] || row['email'] || '',
          rollNo: row['Roll No'] || row['rollNo'] || row['RollNo'] || '',
          phone: row['Phone'] || row['phone'] || row['Contact'] || '',
          fatherName: row['Father Name'] || row['fatherName'] || row['FatherName'] || '',
          motherName: row['Mother Name'] || row['motherName'] || row['MotherName'] || '',
          address: row['Address'] || row['address'] || '',
          className: row['Class'] || row['class'] || row['className'] || ''
        }));

        setSpreadsheetData(formattedData);
        setMessage({ type: 'success', text: `Loaded ${formattedData.length} students from spreadsheet` });
      } catch (error) {
        console.error('File parsing error:', error);
        setMessage({ type: 'error', text: 'Failed to parse spreadsheet. Please use Excel or CSV format.' });
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    // Generate sample CSV with predefined classes
    const csvContent = `Name,Email,Roll No,Phone,Father Name,Mother Name,Address,Class\nJohn Doe,john.doe@example.com,101,1234567890,Robert Doe,Mary Doe,123 Main St,10A\nJane Smith,jane.smith@example.com,102,0987654321,James Smith,Linda Smith,456 Oak Ave,11B\nMike Johnson,mike.johnson@example.com,103,9876543210,David Johnson,Sarah Johnson,789 Park Rd,12C`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSpreadsheetSubmit = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      if (spreadsheetData.length === 0) {
        setMessage({ type: 'error', text: 'Please upload a spreadsheet first' });
        setLoading(false);
        return;
      }

      // Validate required fields
      const invalidRows = spreadsheetData.filter(
        (student) => !student.fullName || !student.email || !student.className
      );

      if (invalidRows.length > 0) {
        setMessage({ 
          type: 'error', 
          text: `${invalidRows.length} rows have missing required fields (Name, Email, Class)` 
        });
        setLoading(false);
        return;
      }

      // Prepare students data - auto-generate username and default password
      const studentsData = spreadsheetData.map(student => ({
        fullName: String(student.fullName || '').trim(),
        email: String(student.email || '').trim(),
        username: String(student.email || '').split('@')[0].toLowerCase(), // Auto-generate from email
        password: 'Student@123', // Default password for all students
        rollNo: student.rollNo ? String(student.rollNo).trim() : '',
        phone: student.phone ? String(student.phone).trim() : '',
        fatherName: student.fatherName ? String(student.fatherName).trim() : '',
        motherName: student.motherName ? String(student.motherName).trim() : '',
        address: student.address ? String(student.address).trim() : '',
        className: String(student.className || '').trim().toUpperCase(), // Normalize to uppercase (1a -> 1A)
        role: 'student'
      }));

      // Send bulk registration request
      const response = await authAPI.bulkRegister(studentsData);

      setMessage({ 
        type: 'success', 
        text: `Successfully added ${response.data.data.successful} students!${response.data.data.failed > 0 ? ` ${response.data.data.failed} failed.` : ''}` 
      });

      // Reset
      setSpreadsheetData([]);
      setFileInfo(null);
    } catch (error) {
      console.error('Bulk add error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Failed to add students';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.data?.errors && error.response.data.data.errors.length > 0) {
        // Show detailed errors from backend
        const errors = error.response.data.data.errors.slice(0, 5);
        errorMessage = `Some students failed to add:\n${errors.map(e => `• Row ${e.index}: ${e.email || 'Unknown'} - ${e.error}`).join('\n')}`;
        
        if (error.response.data.data.successful > 0) {
          errorMessage = `✓ ${error.response.data.data.successful} students added successfully\n\n` + errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({ 
        type: error.response?.data?.data?.successful > 0 ? 'success' : 'error', 
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Only super admin can add students in bulk.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bulk Add Students</h2>
        <p className="text-gray-600">Add multiple students at once using manual entry or spreadsheet upload</p>
        <p className="text-sm text-blue-600 mt-1">📌 Default password for all students: <strong>Student@123</strong></p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`mb-4 px-4 py-3 rounded ${
          message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
          'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'manual'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab('spreadsheet')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'spreadsheet'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Spreadsheet Upload
        </button>
      </div>

      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
        <div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name *</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email *</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Father Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mother Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class *</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {manualStudents.map((student, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.fullName}
                          onChange={(e) => updateManualStudent(index, 'fullName', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="John Doe"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          value={student.email}
                          onChange={(e) => updateManualStudent(index, 'email', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="john@example.com"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.rollNo}
                          onChange={(e) => updateManualStudent(index, 'rollNo', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="101"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.phone}
                          onChange={(e) => updateManualStudent(index, 'phone', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="1234567890"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.fatherName}
                          onChange={(e) => updateManualStudent(index, 'fatherName', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Father's Name"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.motherName}
                          onChange={(e) => updateManualStudent(index, 'motherName', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="Mother's Name"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={student.address}
                          onChange={(e) => updateManualStudent(index, 'address', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="123 Main St"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={student.className}
                          onChange={(e) => updateManualStudent(index, 'className', e.target.value)}
                          className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Select</option>
                          {availableClasses.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {manualStudents.length > 1 && (
                          <button
                            onClick={() => removeManualRow(index)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
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
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={addManualRow}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              + Add Row
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Adding Students...' : `Add ${manualStudents.length} Student${manualStudents.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}

      {/* Spreadsheet Upload Tab */}
      {activeTab === 'spreadsheet' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Upload Spreadsheet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload an Excel or CSV file with student information. Required columns: Name, Email, Roll No, Phone, Father Name, Mother Name, Address, Class. (Password will be set to 'Student@123' for all)
              </p>
              
              <button
                onClick={downloadTemplate}
                className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                📥 Download Template
              </button>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-2 text-sm font-medium">Click to upload spreadsheet</p>
                    <p className="mt-1 text-xs text-gray-500">CSV (.csv) or Excel (.xlsx, .xls) files</p>
                  </div>
                </label>
              </div>

              {fileInfo && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">File:</span> {fileInfo.name} ({fileInfo.size})
                  </p>
                </div>
              )}
            </div>

            {spreadsheetData.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Preview ({spreadsheetData.length} students)</h3>
                <div className="max-h-96 overflow-auto border rounded">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {spreadsheetData.map((student, index) => (
                        <tr key={index} className={!student.fullName || !student.email || !student.className ? 'bg-red-50' : ''}>
                          <td className="px-4 py-2 text-sm">{index + 1}</td>
                          <td className="px-4 py-2 text-sm">{student.fullName}</td>
                          <td className="px-4 py-2 text-sm">{student.email}</td>
                          <td className="px-4 py-2 text-sm">{student.className}</td>
                          <td className="px-4 py-2 text-sm">{student.phone}</td>
                          <td className="px-4 py-2 text-sm">{student.address}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">* Rows highlighted in red have missing required fields</p>
              </div>
            )}

            {spreadsheetData.length > 0 && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSpreadsheetSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? 'Adding Students...' : `Add ${spreadsheetData.length} Students`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkStudentAdd;
