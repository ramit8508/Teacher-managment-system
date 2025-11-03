import { useState } from 'react'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <>
      {isLoggedIn ? <Dashboard /> : <Auth setIsLoggedIn={setIsLoggedIn} />}
    </>
  )
}

export default App
