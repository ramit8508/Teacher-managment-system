import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ onMenuChange, onLogout, isOpen, setIsOpen }) => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const { user } = useAuth();
  
  const teacherName = user?.fullName || 'User';

  // Super Admin email - only this email can manage admins
  const SUPER_ADMIN_EMAIL = 'admin@school.com';
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  const menuItems = [
    { id: 1, name: 'Dashboard', icon: '🏠', roles: ['teacher', 'admin'], superAdminOnly: false },
    { id: 2, name: 'Students & Classes', icon: '👥', roles: ['teacher'], superAdminOnly: false },
    { id: 3, name: 'Attendance', icon: '📋', roles: ['teacher'], superAdminOnly: false },
    { id: 4, name: 'Fee Details', icon: '💰', roles: ['teacher'], superAdminOnly: false },
    { id: 5, name: 'Examination Scores', icon: '📊', roles: ['teacher'], superAdminOnly: false },
    { id: 6, name: 'Bulk Fee Management', icon: '💵', roles: ['teacher', 'admin'], superAdminOnly: false },
    { id: 7, name: 'Bulk Exam Editor', icon: '📝', roles: ['teacher', 'admin'], superAdminOnly: false },
    { id: 8, name: 'Class Promotion', icon: '🎓', roles: ['teacher', 'admin'], superAdminOnly: false },
    { id: 9, name: 'Manage Teachers', icon: '👨‍🏫', roles: ['admin'], superAdminOnly: false },
    { id: 10, name: 'Manage Students', icon: '👥', roles: ['admin'], superAdminOnly: false },
    { id: 11, name: 'Change Password', icon: '🔐', roles: ['teacher', 'admin'], superAdminOnly: false },
    { id: 12, name: 'Manage Admins', icon: '👑', roles: ['admin'], superAdminOnly: true },
  ];

  // Filter menu items based on user role and super admin status
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.roles.includes(user?.role)) return false;
    if (item.superAdminOnly && !isSuperAdmin) return false;
    return true;
  });

  const handleMenuClick = (menuName) => {
    setActiveMenu(menuName);
    onMenuChange(menuName);
    // Close sidebar on mobile after selection
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      if (onLogout) {
        onLogout();
      }
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen && setIsOpen(false)}
        ></div>
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close button for mobile */}
        <button
          onClick={() => setIsOpen && setIsOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <span className="text-2xl">✕</span>
        </button>
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
        {filteredMenuItems.map((item) => (
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
          <p className="text-blue-600 font-medium">
            {user?.role === 'admin' 
              ? (isSuperAdmin ? '⭐ Super Admin' : '👑 Administrator')
              : `Teacher: ${teacherName}`}
          </p>
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
    </>
  );
};

export default Sidebar;
