import './App.css'
import Landing from './pages/Landing'
import Register from './pages/Register'

function App() {
  const route = window.location.hash.replace('#', '') || '/'

  let Page = null
  if (route.startsWith('/register')) Page = Register
  else Page = Landing

  return (
    <div className="app-root">
      <Page />
    </div>
  )
}

export default App
