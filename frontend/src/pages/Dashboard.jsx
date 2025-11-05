import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';
import AdminDashboard from '../components/AdminDashboard';
import AdminTeachers from '../components/AdminTeachers';
import AdminStudents from '../components/AdminStudents';
import ManageAdmins from '../components/ManageAdmins';
import StudentsClasses from '../components/StudentsClasses';
import Attendance from '../components/Attendance';
import FeeDetails from '../components/FeeDetails';
import ExaminationScores from '../components/ExaminationScores';
import BulkFeeManagement from '../components/BulkFeeManagement';
import BulkExamEditor from '../components/BulkExamEditor';
import ClassPromotion from '../components/ClassPromotion';
import ChangePassword from '../components/ChangePassword';

const Dashboard = ({ onLogout }) => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    // Admin routes
    if (user?.role === 'admin') {
      switch (currentPage) {
        case 'Dashboard':
          return <AdminDashboard />;
        case 'Manage Teachers':
          return <AdminTeachers />;
        case 'Manage Students':
          return <AdminStudents />;
        case 'Manage Admins':
          return <ManageAdmins />;
        case 'Bulk Fee Management':
          return <BulkFeeManagement />;
        case 'Bulk Exam Editor':
          return <BulkExamEditor />;
        case 'Class Promotion':
          return <ClassPromotion />;
        case 'Change Password':
          return <ChangePassword />;
        default:
          return <AdminDashboard />;
      }
    }

    // Teacher routes
    switch (currentPage) {
      case 'Dashboard':
        return <DashboardContent onMenuChange={setCurrentPage} />;
      case 'Students & Classes':
      case 'students':
        return <StudentsClasses />;
      case 'Attendance':
      case 'attendance':
        return <Attendance />;
      case 'Fee Details':
      case 'fees':
        return <FeeDetails />;
      case 'Examination Scores':
      case 'examination':
        return <ExaminationScores />;
      case 'Bulk Fee Management':
        return <BulkFeeManagement />;
      case 'Bulk Exam Editor':
        return <BulkExamEditor />;
      case 'Class Promotion':
        return <ClassPromotion />;
      case 'Change Password':
        return <ChangePassword />;
      default:
        return <DashboardContent onMenuChange={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-30 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md hover:bg-gray-100"
        >
          <span className="text-2xl">☰</span>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">
          {user?.role === 'admin' ? 'Admin Panel' : 'Teacher Management'}
        </h1>
        <div className="w-10"></div> {/* Spacer for centering */}
      </div>

      <Sidebar 
        onMenuChange={setCurrentPage} 
        onLogout={onLogout} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 pt-16 lg:pt-0">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
