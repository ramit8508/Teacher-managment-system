import { useState } from 'react';

const FeeDetails = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    amount: '',
    feeType: '',
    paymentDate: '2025-11-03'
  });

  const [feeRecords, setFeeRecords] = useState([
    { studentId: '001', name: 'Alice Johnson', class: '10-A', feeType: 'Tuition Fee', amount: '₹5,000', dueDate: '01/09/2024', paidDate: '28/08/2024', status: 'Paid' },
    { studentId: '002', name: 'Bob Smith', class: '10-A', feeType: 'Tuition Fee', amount: '₹5,000', dueDate: '01/09/2024', paidDate: '-', status: 'Pending' },
    { studentId: '003', name: 'Charlie Brown', class: '10-A', feeType: 'Library Fee', amount: '₹500', dueDate: '15/08/2024', paidDate: '-', status: 'Overdue' },
    { studentId: '004', name: 'Diana Prince', class: '10-A', feeType: 'Lab Fee', amount: '₹1,500', dueDate: '10/09/2024', paidDate: '05/09/2024', status: 'Paid' },
  ]);

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    alert('Payment recorded successfully!');
    setShowPaymentModal(false);
    setPaymentForm({ studentId: '', amount: '', feeType: '', paymentDate: '2025-11-03' });
  };

  const handleMarkPaid = (index) => {
    const updated = [...feeRecords];
    updated[index].status = 'Paid';
    updated[index].paidDate = '03/11/2025';
    setFeeRecords(updated);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Fee Management</h1>
        <button onClick={() => setShowPaymentModal(true)} className="px-6 py-2 bg-orange-100 text-orange-700 rounded-lg border border-orange-300 font-medium hover:bg-orange-200 transition-colors flex items-center gap-2">
          <span>💰</span><span>Record Payment</span>
        </button>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border-2 border-blue-300 w-full max-w-3xl">
            <div className="bg-blue-100 px-6 py-4 border-b-2 border-blue-300">
              <h2 className="text-xl font-bold text-blue-800">Record New Payment</h2>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID</label>
                  <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Enter Student ID" value={paymentForm.studentId} onChange={(e) => setPaymentForm({...paymentForm, studentId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Amount</label>
                  <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Enter Amount" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Fee Type</label>
                  <select required className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" value={paymentForm.feeType} onChange={(e) => setPaymentForm({...paymentForm, feeType: e.target.value})}>
                    <option value="">Select Fee Type</option>
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Library Fee">Library Fee</option>
                    <option value="Lab Fee">Lab Fee</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Date</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 outline-none" value={paymentForm.paymentDate} onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})} />
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

      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Fee Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">₹6,500</div>
            <div className="text-sm text-gray-600">Total Collected</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">₹7,000</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">₹500</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none">
              <option>All Classes</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                ['A', 'B', 'C', 'D'].map(grade => (
                  <option key={`${num}-${grade}`} value={`${num}-${grade}`}>{num}-{grade}</option>
                ))
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fee Type</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none">
              <option>All Fee Types</option>
              <option>Tuition Fee</option>
              <option>Library Fee</option>
              <option>Lab Fee</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <div className="bg-gray-100 px-6 py-3 border-b border-gray-300">
          <h2 className="text-lg font-bold text-gray-800">Fee Records (5)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
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
              {feeRecords.map((record, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{record.studentId}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{record.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{record.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{record.feeType}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{record.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{record.dueDate}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{record.paidDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      record.status === 'Paid' ? 'bg-green-100 text-green-700' :
                      record.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {record.status !== 'Paid' && (
                      <button onClick={() => handleMarkPaid(index)} className="px-4 py-1 bg-green-100 text-green-700 rounded border border-green-300 text-sm font-medium hover:bg-green-200 transition-colors">
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeDetails;
