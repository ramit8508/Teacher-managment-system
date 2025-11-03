const DashboardContent = ({ onMenuChange }) => {
  const stats = [
    { id: 1, icon: '👥', number: '156', label: 'Total Students', color: 'text-purple-600' },
    { id: 2, icon: '✅', number: '142', label: 'Present Today', color: 'text-green-600' },
    { id: 3, icon: '💰', number: '23', label: 'Pending Fees', color: 'text-orange-600' },
    { id: 4, icon: '📝', number: '5', label: 'Recent Exams', color: 'text-red-600' },
  ];

  const recentActivities = [
    { id: 1, time: '9:15 AM', text: 'Attendance marked for Grade 10-A', color: 'text-blue-600' },
    { id: 2, time: '10:30 AM', text: 'Fee payment received from John Smith', color: 'text-blue-600' },
    { id: 3, time: '11:45 AM', text: 'Exam scores updated for Mathematics', color: 'text-blue-600' },
    { id: 4, time: '2:20 PM', text: 'New student admission processed', color: 'text-blue-600' },
  ];

  const quickActions = [
    { id: 1, icon: '📋', text: "Mark Today's Attendance", action: 'attendance' },
    { id: 2, icon: '💰', text: 'Record Fee Payment', action: 'fees' },
    { id: 3, icon: '📊', text: 'Enter Exam Scores', action: 'examination' },
    { id: 4, icon: '👤', text: 'Add New Student', action: 'students' },
  ];

  const handleQuickAction = (action) => {
    if (onMenuChange) {
      onMenuChange(action);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back to the Teacher Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className={`text-4xl mb-3 ${stat.color}`}>{stat.icon}</div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{stat.number}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activities</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <span className={`text-sm font-semibold ${activity.color} min-w-[70px]`}>
                  {activity.time}
                </span>
                <span className="text-sm text-gray-700">{activity.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.action)}
                className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-md hover:bg-blue-50 hover:border-blue-300 transition-colors text-left group"
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm text-gray-700 group-hover:text-blue-700 font-medium">{action.text}</span>
                <span className="ml-auto text-gray-400 group-hover:text-blue-500">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Last Backup:</p>
            <p className="text-sm text-gray-800 font-mono">Sept 5, 2024 - 6:00 AM</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Database Status:</p>
            <p className="text-sm text-green-600 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Connected
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Version:</p>
            <p className="text-sm text-gray-800 font-mono">v2.1.4</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
