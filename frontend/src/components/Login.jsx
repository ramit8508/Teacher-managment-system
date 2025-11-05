import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const result = await login(formData);
    
    if (result.success) {
      // Login successful - AuthContext will handle state update
      console.log('Login successful');
    } else {
      setError(result.message || 'Invalid credentials');
      setIsLoading(false);
    }
  };

  const handleAdminQuickLogin = () => {
    // Allowed admin emails - ONLY these 2 emails can use admin login
    const allowedAdminEmails = [
      'admin@school.com',
      'ramitgoyal8508@gmail.com'
    ];
    
    // Prompt for email verification
    const userEmail = prompt('🔒 Admin Access - Step 1/2\n\nEnter your authorized admin email:');
    
    if (!userEmail) {
      return; // User cancelled
    }
    
    // Check if email is authorized
    if (!allowedAdminEmails.includes(userEmail.toLowerCase().trim())) {
      alert('❌ Access Denied!\n\nYour email is not authorized for admin access.\n\nOnly authorized administrators can login.');
      return;
    }
    
    // Prompt for password
    const userPassword = prompt('🔒 Admin Access - Step 2/2\n\nEnter your password:');
    
    if (!userPassword) {
      return; // User cancelled
    }
    
    // Fill the form fields (don't auto-submit)
    setFormData({
      email: userEmail.toLowerCase().trim(),
      password: userPassword
    });
    
    // Show message to user
    alert('✅ Credentials filled!\n\nPlease click the "Sign In" button to login.');
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-200 px-4 sm:px-6 py-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold text-gray-700">Teacher Login</h2>
      </div>

      {/* Form */}
      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email or Username
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Enter your email or username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-100 text-blue-600 py-3 rounded-md font-medium transition duration-200 border border-blue-200 flex items-center justify-center gap-2 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-200'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>🔑</span>
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 px-4 sm:px-6 py-4 border-t border-blue-200">
        <div className="text-center">
          <p className="text-sm text-blue-700 font-medium">
            ℹ️ Use your registered credentials to login
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Contact administrator to create a new account
          </p>
        </div>
      </div>

      {/* Admin Quick Access */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-4 sm:px-6 py-3 border-t border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            <div>
              <p className="text-xs font-semibold text-purple-700">🔒 Authorized Admin Access</p>
              <p className="text-xs text-gray-600">Restricted to 2 authorized emails</p>
            </div>
          </div>
          <button
            onClick={handleAdminQuickLogin}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            title="Requires authorized email"
          >
            � Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
