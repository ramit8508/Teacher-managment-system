import { useState } from 'react'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Auth setIsLoggedIn={setIsLoggedIn} />}
    </>
  )
}

export default App
