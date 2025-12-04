import { useState, useEffect } from 'react';
import { authAPI, attendanceAPI, feeAPI, examinationAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const DashboardContent = ({ onMenuChange }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFees: 0,
    totalExams: 0,
    pendingFees: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch students added by this teacher
      const studentsRes = await authAPI.getAllUsers({ role: 'student' });
      const students = studentsRes.data.data || [];
      
      // Fetch fees
      const feesRes = await feeAPI.getAllFees();
      const fees = feesRes.data.data || [];
      const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue').length;
      
      // Fetch examinations
      const examsRes = await examinationAPI.getAllExaminations();
      const exams = examsRes.data.data || [];
      
      setStats({
        totalStudents: students.length,
        totalFees: fees.length,
        totalExams: exams.length,
        pendingFees: pendingFees,
      });

      // Build recent activities from actual data
      const activities = [];
      
      // Add recent students (last 2)
      students.slice(0, 2).forEach(student => {
        activities.push({
          id: `student-${student._id}`,
          time: new Date(student.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          text: `Student added: ${student.fullName}`,
          color: 'text-blue-600'
        });
      });

      // Add recent fees (last 2)
      fees.slice(0, 2).forEach(fee => {
        activities.push({
          id: `fee-${fee._id}`,
          time: new Date(fee.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          text: `Fee ${fee.status === 'paid' ? 'paid' : 'recorded'} for ${fee.student?.fullName || 'student'} - ₹${fee.totalFee}`,
          color: fee.status === 'paid' ? 'text-green-600' : 'text-orange-600'
        });
      });

      // Add recent exams (last 2)
      exams.slice(0, 2).forEach(exam => {
        activities.push({
          id: `exam-${exam._id}`,
          time: new Date(exam.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          text: `Exam recorded: ${exam.examName} for ${exam.student?.fullName || 'student'}`,
          color: 'text-purple-600'
        });
      });

      // Sort by most recent
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      setRecentActivities(activities.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsDisplay = [
    { id: 1, icon: '👥', number: stats.totalStudents, label: 'Students Added', color: 'text-purple-600' },
    { id: 2, icon: '💰', number: stats.totalFees, label: 'Fee Records', color: 'text-green-600' },
    { id: 3, icon: '📝', number: stats.totalExams, label: 'Exam Records', color: 'text-blue-600' },
    { id: 4, icon: '⚠️', number: stats.pendingFees, label: 'Pending Fees', color: 'text-red-600' },
  ];

  // Quick actions based on user role
  const getQuickActions = () => {
    const baseActions = [
      { id: 1, icon: '📋', text: "Mark Today's Attendance", action: 'attendance' },
      { id: 2, icon: '💰', text: 'Record Fee Payment', action: 'fees' },
      { id: 3, icon: '📊', text: 'Enter Exam Scores', action: 'examination' },
      { id: 4, icon: '👤', text: 'Manage Students', action: 'students' },
    ];

    // Admin-specific actions
    if (user?.role === 'admin') {
      return [
        ...baseActions,
        { id: 5, icon: '👥', text: 'Manage Classes', action: 'classes' },
        { id: 6, icon: '📥', text: 'Bulk Add Students', action: 'Bulk Add Students' },
        { id: 7, icon: '🔗', text: 'Class-Teacher Assignment', action: 'Class-Teacher Assignment' },
        { id: 8, icon: '💵', text: 'Bulk Fee Management', action: 'bulkfee' },
      ];
    }

    return baseActions;
  };

  const quickActions = getQuickActions();

  const handleQuickAction = (action) => {
    if (onMenuChange) {
      onMenuChange(action);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Welcome back to the Teacher Management System</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {statsDisplay.map((stat) => (
              <div
                key={stat.id}
                className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className={`text-3xl sm:text-4xl mb-2 sm:mb-3 ${stat.color}`}>{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
                <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Recent Activities and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-3 sm:space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-2 sm:gap-3">
                <span className={`text-xs sm:text-sm font-semibold ${activity.color} min-w-[60px] sm:min-w-[70px]`}>
                  {activity.time}
                </span>
                <span className="text-xs sm:text-sm text-gray-700">{activity.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.action)}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
              >
                <span className="text-lg sm:text-xl">{action.icon}</span>
                <span className="text-xs sm:text-sm text-gray-700 group-hover:text-blue-700 font-medium">{action.text}</span>
                <span className="ml-auto text-gray-400 group-hover:text-blue-500">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-4">System Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Logged in as:</p>
            <p className="text-sm text-gray-800 font-medium">{user?.fullName || 'Teacher'}</p>
            <p className="text-xs text-gray-500">{user?.email || ''}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Role:</p>
            <p className="text-sm text-blue-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || 'Teacher'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Today's Date:</p>
            <p className="text-sm text-gray-800 font-mono">{new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}</p>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default DashboardContent;
