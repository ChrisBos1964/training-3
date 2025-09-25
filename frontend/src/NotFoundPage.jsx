import './App.css'
import { useNavigate } from 'react-router-dom'

function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="page-container not-found" data-testid="not-found-page">
      <div className="page-content">
        <main role="main" aria-label="Page not found" data-testid="not-found-main">
          <h1 className="page-title" data-testid="not-found-title">Oops… Wrong Turn!</h1>
          <p className="page-description" data-testid="not-found-text">
            Be like water making its way through cracks. Do not be assertive, but adjust to the object, and you shall find a way around or through it. If nothing within you stays rigid, outward things will disclose themselves. Empty your mind, be formless, shapeless, like water. If you put water into a cup, it becomes the cup. You put water into a bottle and it becomes the bottle. You put it in a teapot it becomes the teapot. Now, water can flow or it can crash. Be water, my friend
          </p>
          <button
            className="hello-button"
            role="button"
            aria-label="Go back to home page"
            onClick={() => navigate('/')}
            data-testid="not-found-home"
          >
            ← Take me home
          </button>
        </main>
      </div>
    </div>
  )
}

export default NotFoundPage


