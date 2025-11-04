import { useState, useEffect } from 'react';
import { authAPI, classAPI, attendanceAPI, feeAPI, examinationAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalFees: 0,
    totalExams: 0,
    pendingFees: 0,
    activeTeachers: 0,
    activeStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all users
      const usersRes = await authAPI.getAllUsers({});
      const allUsers = usersRes.data.data || [];
      
      const teachers = allUsers.filter(u => u.role === 'teacher');
      const students = allUsers.filter(u => u.role === 'student');
      const activeTeachers = teachers.filter(u => !u.isBlocked).length;
      const activeStudents = students.filter(u => !u.isBlocked).length;
      
      // Fetch fees
      const feesRes = await feeAPI.getAllFees();
      const fees = feesRes.data.data || [];
      const pendingFees = fees.filter(f => f.status === 'pending' || f.status === 'overdue').length;
      
      // Fetch classes
      const classesRes = await classAPI.getAllClasses();
      const classes = classesRes.data.data || [];
      
      // Fetch examinations
      const examsRes = await examinationAPI.getAllExaminations();
      const exams = examsRes.data.data || [];
      
      setStats({
        totalTeachers: teachers.length,
        totalStudents: students.length,
        totalClasses: classes.length,
        totalFees: fees.length,
        totalExams: exams.length,
        pendingFees: pendingFees,
        activeTeachers: activeTeachers,
        activeStudents: activeStudents,
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsDisplay = [
    { id: 1, icon: '👨‍🏫', number: stats.totalTeachers, label: 'Total Teachers', sublabel: `${stats.activeTeachers} Active`, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 2, icon: '👥', number: stats.totalStudents, label: 'Total Students', sublabel: `${stats.activeStudents} Active`, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 3, icon: '🏫', number: stats.totalClasses, label: 'Total Classes', sublabel: 'All Grades', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 4, icon: '💰', number: stats.totalFees, label: 'Fee Records', sublabel: `${stats.pendingFees} Pending`, color: 'text-orange-600', bg: 'bg-orange-50' },
    { id: 5, icon: '📊', number: stats.totalExams, label: 'Exam Records', sublabel: 'All Subjects', color: 'text-pink-600', bg: 'bg-pink-50' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Complete system overview and management</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {statsDisplay.map((stat) => (
              <div
                key={stat.id}
                className={`${stat.bg} rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow`}
              >
                <div className={`text-3xl sm:text-4xl mb-2 sm:mb-3 ${stat.color}`}>{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
                <div className="text-xs sm:text-sm text-gray-700 font-medium">{stat.label}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.sublabel}</div>
              </div>
            ))}
          </div>

          {/* Admin Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-4 sm:p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">👑</span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Administrator Access</h2>
                <p className="text-xs sm:text-sm text-gray-600">You have full system privileges</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Logged in as:</p>
                <p className="font-medium text-gray-800">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || ''}</p>
              </div>
              <div>
                <p className="text-gray-600">Role:</p>
                <p className="font-medium text-blue-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Administrator
                </p>
              </div>
              <div>
                <p className="text-gray-600">System Status:</p>
                <p className="font-medium text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  All Systems Operational
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
