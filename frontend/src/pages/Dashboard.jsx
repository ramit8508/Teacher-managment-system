import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import DashboardContent from '../components/DashboardContent';
import StudentsClasses from '../components/StudentsClasses';
import Attendance from '../components/Attendance';
import FeeDetails from '../components/FeeDetails';
import ExaminationScores from '../components/ExaminationScores';

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const renderContent = () => {
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
      default:
        return <DashboardContent onMenuChange={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar onMenuChange={setCurrentPage} />
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
