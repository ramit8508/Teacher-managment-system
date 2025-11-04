import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import { useAuth } from './context/AuthContext'

function App() {
  const { isLoggedIn, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoggedIn ? <Dashboard onLogout={logout} /> : <Auth />}
    </>
  )
}

export default App
