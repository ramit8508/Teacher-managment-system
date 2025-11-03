import { useState } from 'react';

const Sidebar = ({ onMenuChange, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  
  // Get current logged-in user
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const teacherName = currentUser.name || 'Demo Teacher';

  const menuItems = [
    { id: 1, name: 'Dashboard', icon: '🏠' },
    { id: 2, name: 'Students & Classes', icon: '👥' },
    { id: 3, name: 'Attendance', icon: '📋' },
    { id: 4, name: 'Fee Details', icon: '💰' },
    { id: 5, name: 'Examination Scores', icon: '📊' },
  ];

  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
    onMenuChange(menuName);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      if (onLogout) {
        onLogout();
      }
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded flex items-center justify-center">
            <span className="text-xl">📚</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-sm">Teacher Management</h2>
            <p className="text-xs text-gray-600">System</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.name)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md mb-1 transition-colors ${
              activeMenu === item.name
                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-600 mb-2">
          <p>Ready</p>
          <p>03/11/2025</p>
          <p className="text-blue-600 font-medium">Teacher: {teacherName}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-md border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
