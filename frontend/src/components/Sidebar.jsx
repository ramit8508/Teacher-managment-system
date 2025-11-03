import { useState } from 'react';

const Sidebar = ({ onMenuChange }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');

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
          <p className="text-blue-600 font-medium">Teacher: Demo Teacher</p>
        </div>
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
