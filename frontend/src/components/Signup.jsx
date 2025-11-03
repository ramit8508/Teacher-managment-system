import { useState } from 'react';

const Signup = ({ setIsLogin, onSuccessfulSignup }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    // Store user credentials
    const userData = {
      name: formData.name,
      email: formData.email,
      username: formData.username,
      password: formData.password,
    };

    // Save to localStorage for persistence
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if username already exists
    if (existingUsers.some(user => user.username === userData.username)) {
      alert('Username already exists! Please choose a different username.');
      return;
    }

    // Check if email already exists
    if (existingUsers.some(user => user.email === userData.email)) {
      alert('Email already registered! Please use a different email.');
      return;
    }

    existingUsers.push(userData);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

    // Call parent callback
    if (onSuccessfulSignup) {
      onSuccessfulSignup(userData);
    }

    // Show success message
    alert(`Registration successful! Welcome ${formData.name}!\n\nYou can now login with your credentials.`);
    
    // Switch to login page
    setIsLogin(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-200 px-6 py-4 border-b border-gray-300">
        <h2 className="text-lg font-semibold text-gray-700">Teacher Registration</h2>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Enter your email"
            />
          </div>

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
              placeholder="Choose a username"
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
              placeholder="Create a password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-100 text-blue-600 py-3 rounded-md font-medium hover:bg-blue-200 transition duration-200 border border-blue-200 flex items-center justify-center gap-2"
          >
            <span>✏️</span>
            <span>Register</span>
          </button>
        </form>

        {/* Info Footer */}
        <div className="mt-6 text-center bg-green-50 p-4 rounded-md border border-green-200">
          <p className="text-sm text-green-700 font-medium">
            📝 Create your teacher profile to get started
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Already registered? Click "Login" tab above
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
