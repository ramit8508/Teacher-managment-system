import { useState, useEffect } from 'react';
import { classAPI, authAPI, feeAPI } from '../api';

const BulkFeeManagement = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [feeData, setFeeData] = useState({
    feeType: 'Monthly',
    amount: '',
    lastDate: '',
    feePenalty: '',
    penaltyPeriod: '',
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }

    setLoading(true);

    try {
      // Get all students in the selected class
      const classDetails = classes.find(c => c._id === selectedClass);
      const students = classDetails?.students || [];

      if (students.length === 0) {
        alert('No students in this class');
        setLoading(false);
        return;
      }

      // Create fee record for each student
      const feePromises = students.map(student => 
        feeAPI.createFee({
          student: student._id,
          feeType: feeData.feeType,
          totalFee: parseInt(feeData.amount),
          dueDate: feeData.lastDate,
          penalty: parseInt(feeData.feePenalty) || 0,
          penaltyPeriod: parseInt(feeData.penaltyPeriod) || 0,
          status: 'pending',
        })
      );

      await Promise.all(feePromises);

      alert(`Fee request applied to ${students.length} students successfully!`);
      
      // Reset form
      setFeeData({
        feeType: 'Monthly',
        amount: '',
        lastDate: '',
        feePenalty: '',
        penaltyPeriod: '',
      });
      setSelectedClass('');

    } catch (error) {
      console.error('Error creating bulk fees:', error);
      alert('Failed to create fee requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Bulk Fee Management</h1>
        <p className="text-sm sm:text-base text-gray-600">Apply fee request to all students in a class</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
            >
              <option value="">-- Select a Class --</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} - {cls.section} ({cls.subject}) - {cls.students?.length || 0} students
                </option>
              ))}
            </select>
          </div>

          {/* Fee Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Type <span className="text-red-500">*</span>
            </label>
            <select
              value={feeData.feeType}
              onChange={(e) => setFeeData({ ...feeData, feeType: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
            >
              <option value="Monthly">Monthly Fee</option>
              <option value="Quarterly">Quarterly Fee</option>
              <option value="Yearly">Yearly Fee</option>
              <option value="Admission">Admission Fee</option>
              <option value="Exam">Exam Fee</option>
              <option value="Transport">Transport Fee</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={feeData.amount}
              onChange={(e) => setFeeData({ ...feeData, amount: e.target.value })}
              required
              min="0"
              placeholder="e.g., 5000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
            />
          </div>

          {/* Last Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={feeData.lastDate}
              onChange={(e) => setFeeData({ ...feeData, lastDate: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
            />
          </div>

          {/* Penalty Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Late Fee Penalty (₹)
            </label>
            <input
              type="number"
              value={feeData.feePenalty}
              onChange={(e) => setFeeData({ ...feeData, feePenalty: e.target.value })}
              min="0"
              placeholder="e.g., 500"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
            />
          </div>

          {/* Penalty Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penalty Grace Period (days)
            </label>
            <input
              type="number"
              value={feeData.penaltyPeriod}
              onChange={(e) => setFeeData({ ...feeData, penaltyPeriod: e.target.value })}
              min="0"
              placeholder="e.g., 5"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Number of days after due date before penalty is applied
            </p>
          </div>

          {/* Submit Button */}
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
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>💰</span>
                Apply Fee to All Students in Class
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BulkFeeManagement;
