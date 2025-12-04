import { useState, useEffect } from 'react';
import { classAPI, authAPI, feeAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const BulkFeeManagement = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [feeData, setFeeData] = useState({
    feeType: 'Monthly Fee',
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
      let classNames = [];
      
      // If user is a teacher, fetch only their assigned classes
      if (user?.role === 'teacher') {
        try {
          const assignmentsRes = await classAPI.getClassAssignments();
          const allAssignments = assignmentsRes.data.data || [];
          
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
      // Get students based on class type (predefined or database)
      let students = [];
      
      // Check if it's predefined class format (1A-12Z) or database class (ObjectId)
      const isPredefinedClass = /^\d{1,2}[A-Z]$/i.test(selectedClass);
      
      if (isPredefinedClass) {
        // Predefined class - fetch all students with this className
        console.log('Fetching students for predefined class:', selectedClass);
        const response = await authAPI.getAllUsers({ role: 'student' });
        const allStudents = response.data.data || [];
        console.log('All students:', allStudents.length);
        students = allStudents.filter(s => 
          s.className && s.className.toUpperCase() === selectedClass.toUpperCase()
        );
        console.log('Filtered students for', selectedClass, ':', students.length);
      } else {
        // Database class - get students from class roster
        const classDetails = classes.find(c => c._id === selectedClass);
        students = classDetails?.students || [];
        console.log('Students from database class:', students.length);
      }

      if (students.length === 0) {
        alert(`No students found in ${selectedClass}. Please add students to this class first.`);
        setLoading(false);
        return;
      }

      console.log('Creating fees for', students.length, 'students');

      // Get current academic year (e.g., "2024-2025")
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const academicYear = currentMonth >= 3 ? `${currentYear}-${currentYear + 1}` : `${currentYear - 1}-${currentYear}`;

      // Create fee record for each student
      const feePromises = students.map(student => 
        feeAPI.createFee({
          student: student._id,
          feeType: feeData.feeType,
          totalFee: parseInt(feeData.amount),
          dueDate: feeData.lastDate,
          academicYear: academicYear,
          status: 'pending',
          // Add className or classId based on selected class type
          ...(isPredefinedClass 
            ? { className: selectedClass } 
            : { classId: selectedClass }
          )
        })
      );

      await Promise.all(feePromises);

      alert(`✅ Fee request applied to ${students.length} student(s) successfully!`);
      
      // Reset form
      setFeeData({
        feeType: 'Monthly Fee',
        amount: '',
        lastDate: '',
        feePenalty: '',
        penaltyPeriod: '',
      });
      setSelectedClass('');

    } catch (error) {
      console.error('Error creating bulk fees:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create fee requests';
      alert(`❌ Error: ${errorMessage}\n\nPlease check console for details.`);
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
              style={{ maxHeight: '300px', overflowY: 'auto' }}
              size="1"
            >
              <option value="">-- Select a Class --</option>
              {classes.map(className => (
                <option key={className} value={className}>
                  {className}
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
