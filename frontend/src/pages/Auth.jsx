import { useState } from 'react';
import Login from '../components/Login';

const Auth = () => {
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
          <p className="text-gray-500 mb-6">Welcome! Please login to continue</p>
        </div>
        
        <Login />

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>School Management System v2.1.4</p>
          <p className="mt-1">© 2024 Educational Software Solutions</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
