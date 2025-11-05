import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';

const ChangePassword = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setMessage({ type: 'error', text: passwordError });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password' });
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.updateUser(user._id, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: '✅ Password changed successfully!' });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password. Please check your current password.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Change Password</h1>
        <p className="text-sm sm:text-base text-gray-600">Update your account password</p>
      </div>

      <div className="max-w-2xl">
        {/* User Info Card */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">
                {user?.role === 'admin' ? '👑' : '👤'}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">{user?.fullName}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
              <p className="text-xs text-blue-700 font-medium">
                {user?.role === 'admin' ? '👑 Administrator' : '👨‍🏫 Teacher'}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Message Display */}
            {message.text && (
              <div className={`p-4 rounded-md border ${
                message.type === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength="6"
                  className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                  placeholder="Re-enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Password Strength:</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={formData.newPassword.length >= 6 ? 'text-green-600' : 'text-gray-400'}>
                      {formData.newPassword.length >= 6 ? '✅' : '⭕'}
                    </span>
                    <span className="text-xs text-gray-600">At least 6 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                      {/[A-Z]/.test(formData.newPassword) ? '✅' : '⭕'}
                    </span>
                    <span className="text-xs text-gray-600">Contains uppercase letter (recommended)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                      {/[0-9]/.test(formData.newPassword) ? '✅' : '⭕'}
                    </span>
                    <span className="text-xs text-gray-600">Contains number (recommended)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={formData.newPassword === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : 'text-gray-400'}>
                      {formData.newPassword === formData.confirmPassword && formData.confirmPassword ? '✅' : '⭕'}
                    </span>
                    <span className="text-xs text-gray-600">Passwords match</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 bg-blue-600 text-white py-3 rounded-md font-medium transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>🔐</span>
                    Change Password
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setMessage({ type: '', text: '' });
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="mt-6 bg-yellow-50 rounded-lg border border-yellow-200 p-4">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">🔒 Security Tips</h3>
          <ul className="text-xs text-yellow-700 space-y-1">
            <li>• Use a strong password with letters, numbers, and special characters</li>
            <li>• Don't share your password with anyone</li>
            <li>• Change your password regularly (every 3-6 months)</li>
            <li>• Don't use the same password for multiple accounts</li>
            <li>• Avoid common words or personal information</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
