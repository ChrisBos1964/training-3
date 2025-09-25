import './App.css'
import { useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/list')
  }

  return (
    <div className="App-header" data-testid="home-page">
              <h1 data-testid="home-title">Hello Champions!</h1>
      <p>Welcome to the Playwright Training</p>
      <button 
        className="hello-button"
        onClick={handleClick}
        aria-label="Let's start training sessions"
        role="button"
        data-testid="start-button"
      >
        Let's Start!
      </button>
    </div>
  )
}

export default HomePage
