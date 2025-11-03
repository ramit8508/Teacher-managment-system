import { useState } from 'react';

const Login = ({ setIsLogin, setIsLoggedIn }) => {
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
      console.log('Login data:', formData);
      setIsLoading(false);
      setIsLoggedIn(true);
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

      {/* Demo Credentials */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-300">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Demo Credentials</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600 mb-1">Username:</p>
            <p className="bg-white px-3 py-2 border border-gray-300 rounded text-gray-700">demo</p>
          </div>
          <div>
            <p className="text-gray-600 mb-1">Password:</p>
            <p className="bg-white px-3 py-2 border border-gray-300 rounded text-gray-700">demo</p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">Or try: mrs.johnson / teacher123</p>
      </div>
    </div>
  );
};

export default Login;
