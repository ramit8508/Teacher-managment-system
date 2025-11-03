import { useState } from 'react';

const Login = ({ setIsLogin, setIsLoggedIn, registeredUsers }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Get registered users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Check if credentials match any registered user
      const user = storedUsers.find(
        (u) => u.username === formData.username && u.password === formData.password
      );

      if (user) {
        // Store current logged-in user
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert(`Welcome back, ${user.name}!`);
        setIsLoading(false);
        setIsLoggedIn(true);
      } else {
        setIsLoading(false);
        alert('Invalid username or password!\n\nPlease check your credentials or register if you don\'t have an account.');
      }
    }, 1500);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-200 px-6 py-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold text-gray-700">Teacher Login</h2>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Enter your username"
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
      <div className="bg-blue-50 px-6 py-4 border-t border-blue-200">
        <div className="text-center">
          <p className="text-sm text-blue-700 font-medium">
            ℹ️ Use your registered credentials to login
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Don't have an account? Click "Signup" tab above
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
