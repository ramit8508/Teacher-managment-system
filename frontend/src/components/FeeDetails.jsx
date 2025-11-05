import { useState, useEffect } from 'react';
import { feeAPI, classAPI, authAPI } from '../api';

const FeeDetails = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feeRecords, setFeeRecords] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedFeeType, setSelectedFeeType] = useState('All Fee Types');
  
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    classId: '',
    amount: '',
    feeType: 'Tuition Fee',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    remarks: ''
  });

  const [stats, setStats] = useState({
    totalCollected: 0,
    pending: 0,
    overdue: 0,
    totalRecords: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all fee records
      const feesRes = await feeAPI.getAllFees();
      const fees = feesRes.data.data || [];
      setFeeRecords(fees);
      
      // Fetch classes
      const classesRes = await classAPI.getAllClasses();
      setClasses(classesRes.data.data || []);
      
      // Fetch all students
      const studentsRes = await authAPI.getAllUsers({ role: 'student' });
      setStudents(studentsRes.data.data || []);
      
      // Calculate stats
      const paid = fees.filter(f => f.status === 'paid').reduce((sum, f) => sum + (f.totalFee || f.amount || 0), 0);
      const pending = fees.filter(f => f.status === 'pending').reduce((sum, f) => sum + (f.totalFee || f.amount || 0), 0);
      const overdue = fees.filter(f => f.status === 'overdue').reduce((sum, f) => sum + (f.totalFee || f.amount || 0), 0);
      
      setStats({
        totalCollected: paid,
        pending,
        overdue,
        totalRecords: fees.length
      });
    } catch (error) {
      console.error('Error fetching fee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if it's an edit or create operation
      if (paymentForm.id) {
        await feeAPI.updateFee(paymentForm.id, paymentForm);
        alert('Payment updated successfully!');
      } else {
        await feeAPI.createFee(paymentForm);
        alert('Payment recorded successfully!');
      }
      
      setShowPaymentModal(false);
      setPaymentForm({
        studentId: '',
        classId: '',
        amount: '',
        feeType: 'Tuition Fee',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        remarks: ''
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error saving payment:', error);
      alert('Failed to save payment. Please try again.');
    }
  };

  const handleMarkPaid = async (feeId) => {
    try {
      await feeAPI.updateFee(feeId, {
        status: 'paid',
        paidDate: new Date()
      });
      fetchData(); // Refresh data
      alert('Fee marked as paid!');
    } catch (error) {
      console.error('Error updating fee:', error);
      alert('Failed to update fee status.');
    }
  };

  const handleEdit = (record) => {
    // Populate the form with existing fee data
    setPaymentForm({
      id: record._id,
      studentId: record.studentId?._id || record.student?._id || '',
      classId: record.classId?._id || record.className || '',
      amount: record.amount || record.totalFee || '',
      feeType: record.feeType || 'Tuition Fee',
      dueDate: record.dueDate ? new Date(record.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: record.status || 'pending',
      remarks: record.remarks || ''
    });
    setShowPaymentModal(true);
  };

  const handleDelete = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      try {
        await feeAPI.deleteFee(feeId);
        fetchData();
        alert('Fee record deleted successfully!');
      } catch (error) {
        console.error('Error deleting fee:', error);
        alert('Failed to delete fee record.');
      }
    }
  };

  const filteredRecords = feeRecords.filter(record => {
    const classMatch = selectedClass === 'All Classes' || record.classId?.name === selectedClass;
    const feeTypeMatch = selectedFeeType === 'All Fee Types' || record.feeType === selectedFeeType;
    return classMatch && feeTypeMatch;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Fee Management</h1>
        <button onClick={() => setShowPaymentModal(true)} className="px-6 py-2 bg-orange-100 text-orange-700 rounded-lg border border-orange-300 font-medium hover:bg-orange-200 transition-colors flex items-center gap-2">
          <span>💰</span><span>Record Payment</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading fee records...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Fee Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">₹{stats.totalCollected.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Collected</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">₹{stats.pending.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">₹{stats.overdue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalRecords}</div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
                <select 
                  value={selectedFeeType}
                  onChange={(e) => setSelectedFeeType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                >
                  <option>All Fee Types</option>
                  <option>Monthly Fee</option>
                  <option>Quarterly Fee</option>
                  <option>Yearly Fee</option>
                  <option>Tuition Fee</option>
                  <option>Admission Fee</option>
                  <option>Library Fee</option>
                  <option>Lab Fee</option>
                  <option>Transport Fee</option>
                  <option>Exam Fee</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-blue-300 w-full max-w-3xl">
            <div className="bg-blue-100 px-6 py-4 border-b-2 border-blue-300">
              <h2 className="text-xl font-bold text-blue-800">
                {paymentForm.id ? 'Edit Payment Record' : 'Record New Payment'}
              </h2>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Class *</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" 
                    value={paymentForm.classId} 
                    onChange={(e) => setPaymentForm({...paymentForm, classId: e.target.value, studentId: ''})}
                  >
                    <option value="">-- Select Class First --</option>
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
                          <option key={cls._id} value={cls._id}>
                            {cls.name} - {cls.subject}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Select class first, then student</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Student *</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" 
                    value={paymentForm.studentId} 
                    onChange={(e) => setPaymentForm({...paymentForm, studentId: e.target.value})}
                    disabled={!paymentForm.classId}
                  >
                    <option value="">-- Select Student --</option>
                    {students
                      .filter(student => {
                        // Check if classId is a predefined class or database class
                        const isPredefinedClass = paymentForm.classId.startsWith('Class ');
                        if (isPredefinedClass) {
                          return student.className === paymentForm.classId;
                        } else {
                          return student.classId?._id === paymentForm.classId;
                        }
                      })
                      .map((student) => (
                        <option key={student._id} value={student._id}>
                          {student.fullName} ({student.email})
                        </option>
                      ))}
                  </select>
                  {!paymentForm.classId && (
                    <p className="text-xs text-orange-600 mt-1">Please select a class first</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" 
                    placeholder="Enter Amount" 
                    value={paymentForm.amount} 
                    onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fee Type</label>
                  <select 
                    required 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" 
                    value={paymentForm.feeType} 
                    onChange={(e) => setPaymentForm({...paymentForm, feeType: e.target.value})}
                  >
                    <option value="Monthly Fee">Monthly Fee</option>
                    <option value="Quarterly Fee">Quarterly Fee</option>
                    <option value="Yearly Fee">Yearly Fee</option>
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Admission Fee">Admission Fee</option>
                    <option value="Library Fee">Library Fee</option>
                    <option value="Lab Fee">Lab Fee</option>
                    <option value="Transport Fee">Transport Fee</option>
                    <option value="Exam Fee">Exam Fee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" 
                    value={paymentForm.dueDate} 
                    onChange={(e) => setPaymentForm({...paymentForm, dueDate: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" 
                    value={paymentForm.status} 
                    onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value})}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" 
                    placeholder="Optional remarks" 
                    value={paymentForm.remarks} 
                    onChange={(e) => setPaymentForm({...paymentForm, remarks: e.target.value})} 
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="px-6 py-2 bg-green-100 text-green-700 rounded-md border border-green-300 font-medium hover:bg-green-200 transition-colors flex items-center gap-2">
                  <span>✅</span><span>Record Payment</span>
                </button>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md border border-gray-300 font-medium hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!loading && (
        <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
          <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
            <h2 className="text-lg font-bold text-gray-800">Fee Records ({filteredRecords.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Fee Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Paid Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No fee records found. Add a new record to get started.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr key={record._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">{record.student?.fullName || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{record.className || record.classId?.name || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{record.feeType || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">₹{(record.totalFee || record.amount || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.dueDate ? new Date(record.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {record.paidDate ? new Date(record.paidDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'paid' ? 'bg-green-100 text-green-700' :
                          record.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {record.status !== 'paid' && (
                            <button 
                              onClick={() => handleMarkPaid(record._id)} 
                              className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium hover:bg-green-200 transition-colors"
                            >
                              ✓ Mark Paid
                            </button>
                          )}
                          <button 
                            onClick={() => handleEdit(record)} 
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(record._id)} 
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm font-medium hover:bg-red-200 transition-colors"
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
    </div>
  );
};

export default FeeDetails;
