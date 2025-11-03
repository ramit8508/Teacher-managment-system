import { useState } from 'react';
import Login from '../components/Login';
import Signup from '../components/Signup';

const Auth = ({ setIsLoggedIn }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState([]);

  const handleSuccessfulSignup = (userData) => {
    // Store the registered user
    setRegisteredUsers([...registeredUsers, userData]);
    // Switch to login page
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-3xl">📚</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-700 mb-2">Teacher Management System</h1>
          <p className="text-gray-500 mb-6">Welcome! Please choose an option to continue</p>
          
          {/* Tab Selector */}
          <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-300 shadow-sm max-w-md mx-auto">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isLogin
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>🔑</span>
              <span>Login</span>
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                !isLogin
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-transparent text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>✏️</span>
              <span>Signup</span>
            </button>
          </div>
        </div>
        
        {isLogin ? (
          <Login setIsLogin={setIsLogin} setIsLoggedIn={setIsLoggedIn} registeredUsers={registeredUsers} />
        ) : (
          <Signup setIsLogin={setIsLogin} onSuccessfulSignup={handleSuccessfulSignup} />
        )}

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>School Management System v2.1.4</p>
          <p className="mt-1">© 2024 Educational Software Solutions</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
