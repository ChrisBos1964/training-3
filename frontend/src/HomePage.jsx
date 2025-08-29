import './App.css'
import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/list')
  }

  return (
    <div className="App-header">
              <h1>Hello Champions!</h1>
      <p>Welcome to the Playwright Training</p>
      <button 
        className="hello-button"
        onClick={handleClick}
        aria-label="Navigate to training sessions list"
        role="button"
      >
        Click me!
      </button>
    </div>
  )
}

export default HomePage
