import './App.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import trainingAPI from './api.js'

function ListPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [finalDeleteConfirm, setFinalDeleteConfirm] = useState(null)
  // Refs for focus management
  const firstModalRef = useRef(null)
  const secondModalRef = useRef(null)
  const firstFocusableElementRef = useRef(null)
  const lastFocusableElementRef = useRef(null)

  useEffect(() => {
    loadSessions()
  }, [])

  // Focus management for modal
  useEffect(() => {
    const currentModal = deleteConfirm ? firstModalRef.current : finalDeleteConfirm ? secondModalRef.current : null
    
    if (currentModal) {
      // Store the element that had focus before modal opened
      const previouslyFocusedElement = document.activeElement
      
      // Focus the first focusable element in the modal
      if (firstFocusableElementRef.current) {
        firstFocusableElementRef.current.focus()
      }
      
      // Handle escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          if (finalDeleteConfirm) {
            handleFinalDeleteCancel()
          } else {
            handleDeleteCancel()
          }
        }
      }
      
      // Handle tab key for focus trapping
      const handleTab = (e) => {
        if (e.key === 'Tab') {
          const focusableElements = currentModal?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
          
          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0]
            const lastElement = focusableElements[focusableElements.length - 1]
            
            if (e.shiftKey) {
              // Shift + Tab: go to previous element
              if (document.activeElement === firstElement) {
                e.preventDefault()
                lastElement.focus()
              }
            } else {
              // Tab: go to next element
              if (document.activeElement === lastElement) {
                e.preventDefault()
                firstElement.focus()
              }
            }
          }
        }
      }
      
      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTab)
      
      // Cleanup function
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleTab)
        
        // Restore focus to previously focused element
        if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
          previouslyFocusedElement.focus()
        }
      }
    }
  }, [deleteConfirm, finalDeleteConfirm])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const data = await trainingAPI.getAllSessions()
      setSessions(data)
      setError(null)
    } catch (err) {
      setError('Failed to load training sessions')
      console.error('Error loading sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackClick = () => {
    navigate('/')
  }

  const handleAddClick = () => {
    navigate('/add')
  }

  const handleDeleteClick = (session) => {
    setDeleteConfirm(session)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    
    // Move to final confirmation step
    setFinalDeleteConfirm(deleteConfirm)
    setDeleteConfirm(null)
  }

  const handleFinalDeleteConfirm = async () => {
    if (!finalDeleteConfirm) return

    try {
      await trainingAPI.deleteSession(finalDeleteConfirm.id)
      setSessions(sessions.filter(s => s.id !== finalDeleteConfirm.id))
      setFinalDeleteConfirm(null)
    } catch (err) {
      setError('Failed to delete training session')
      console.error('Error deleting session:', err)
    }
  }

  const handleFinalDeleteCancel = () => {
    // Go back to first confirmation step
    setDeleteConfirm(finalDeleteConfirm)
    setFinalDeleteConfirm(null)
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm(null)
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1 className="page-title">Training Sessions</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1 className="page-title">Training Sessions</h1>
          <p role="alert" aria-live="polite" className="error-message">
            {error}
          </p>
          <button 
            className="hello-button"
            onClick={loadSessions}
            aria-label="Retry loading training sessions"
            role="button"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Training Sessions</h1>
        <p className="page-description">Your current training progress</p>
        
        <nav role="navigation" aria-label="Page navigation">
          <div className="nav-buttons">
            <button 
              className="hello-button secondary"
              onClick={handleBackClick}
              aria-label="Go back to home page"
              role="button"
            >
              ← Back
            </button>
            <button 
              className="hello-button add-button"
              onClick={handleAddClick}
              aria-label="Add new training session"
              role="button"
            >
              + Add Session
            </button>
          </div>
        </nav>

        <main role="main" aria-label="Training sessions list">
          <section aria-labelledby="sessions-heading">
            <h2 id="sessions-heading" className="visually-hidden">Training Sessions</h2>
            {sessions.length === 0 ? (
              <p className="no-sessions" role="status" aria-live="polite">
                No training sessions found. Click "Add Session" to create your first one.
              </p>
            ) : (
              <ul 
                role="list" 
                aria-label="Training sessions"
                className="sessions-list"
              >
                {sessions.map((session) => (
                  <li 
                    key={session.id} 
                    role="listitem"
                    className="session-item"
                  >
                    <article role="article" aria-labelledby={`session-${session.id}-title`}>
                      <header>
                        <h3 
                          id={`session-${session.id}-title`}
                          className="session-title"
                        >
                          {session.title}
                        </h3>
                        <div className="session-actions">
                          <span 
                            className={`status-badge status-${session.status.toLowerCase().replace(' ', '-')}`}
                            role="status"
                            aria-label={`Status: ${session.status}`}
                          >
                            {session.status}
                          </span>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteClick(session)}
                            aria-label={`Delete training session: ${session.title}`}
                            role="button"
                          >
                            🗑️
                          </button>
                        </div>
                      </header>
                      <p className="session-description">
                        {session.description}
                      </p>
                      {session.duration && (
                        <p className="session-duration" aria-label={`Duration: ${session.duration} hours`}>
                          Duration: {session.duration} hours
                        </p>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="modal-overlay"
          role="dialog"
          aria-labelledby="delete-confirm-title"
          aria-describedby="delete-confirm-description"
          aria-modal="true"
          ref={firstModalRef}
        >
          <div className="modal-content" role="document">
            <h2 id="delete-confirm-title">Confirm Delete</h2>
            <p id="delete-confirm-description">
              Are you sure you want to delete "{deleteConfirm.title}"?
            </p>
            <div className="modal-actions">
              <button
                className="hello-button secondary"
                onClick={handleDeleteCancel}
                aria-label="Cancel deletion"
                role="button"
                ref={firstFocusableElementRef}
              >
                No, Cancel
              </button>
              <button
                className="hello-button delete-confirm"
                onClick={handleDeleteConfirm}
                aria-label="Yes, proceed to final confirmation"
                role="button"
                ref={lastFocusableElementRef}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Delete Confirmation Modal */}
      {finalDeleteConfirm && (
        <div 
          className="modal-overlay"
          role="dialog"
          aria-labelledby="final-delete-confirm-title"
          aria-describedby="final-delete-confirm-description"
          aria-modal="true"
          ref={secondModalRef}
        >
          <div className="modal-content" role="document">
            <h2 id="final-delete-confirm-title">Final Confirmation</h2>
            <p id="final-delete-confirm-description">
              This action cannot be undone. Are you absolutely sure you want to delete "{finalDeleteConfirm.title}"?
            </p>
            <div className="modal-actions">
              <button
                className="hello-button secondary"
                onClick={handleFinalDeleteCancel}
                aria-label="Cancel final deletion"
                role="button"
                ref={firstFocusableElementRef}
              >
                No, Cancel
              </button>
              <button
                className="hello-button delete-confirm"
                onClick={handleFinalDeleteConfirm}
                aria-label="Yes, delete this training session permanently"
                role="button"
                ref={lastFocusableElementRef}
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ListPage
