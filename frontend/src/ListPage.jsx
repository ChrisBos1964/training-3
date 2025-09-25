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
  // Filter states
  const [titleFilter, setTitleFilter] = useState('')
  const [durationFilter, setDurationFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
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

  // Filter sessions based on current filter values
  const filteredSessions = sessions.filter(session => {
    const matchesTitle = !titleFilter || 
      session.title.toLowerCase().includes(titleFilter.toLowerCase())
    const matchesDuration = !durationFilter || 
      (session.duration && session.duration.toString().includes(durationFilter))
    const matchesStatus = !statusFilter || 
      session.status.toLowerCase().includes(statusFilter.toLowerCase())
    
    return matchesTitle && matchesDuration && matchesStatus
  })

  // Clear all filters
  const clearFilters = () => {
    setTitleFilter('')
    setDurationFilter('')
    setStatusFilter('')
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
        <h1 className="page-title" data-testid="list-title">Training Sessions</h1>
        <p className="page-description">Your current training progress</p>
        
        <nav role="navigation" aria-label="Page navigation" data-testid="list-page-nav">
          <div className="nav-buttons">
            <button 
              className="hello-button secondary"
              onClick={handleBackClick}
              aria-label="Go back to home page"
              role="button"
              data-testid="back-button"
            >
              ← Back
            </button>
            <button 
              className="hello-button add-button"
              onClick={handleAddClick}
              aria-label="Add new training session"
              role="button"
              data-testid="add-session-button"
            >
              + Add Session
            </button>
          </div>
        </nav>

        <main role="main" aria-label="Training sessions list" data-testid="list-main">
          {/* Filter Section */}
          <section role="search" aria-labelledby="filter-heading" className="filter-section" data-testid="filter-section">
            <h2 id="filter-heading" className="visually-hidden">Filter Training Sessions</h2>
            <div className="filter-controls" role="group" aria-labelledby="filter-heading">
              <div className="filter-group">
                <label htmlFor="title-filter" className="filter-label">
                  Filter by Title
                </label>
                <input
                  id="title-filter"
                  type="text"
                  value={titleFilter}
                  onChange={(e) => setTitleFilter(e.target.value)}
                  placeholder="Enter title to filter..."
                  className="filter-input"
                  aria-describedby="title-filter-help"
                  data-testid="filter-title"
                />
                <span id="title-filter-help" className="visually-hidden">
                  Type to filter sessions by title
                </span>
              </div>

              <div className="filter-group">
                <label htmlFor="duration-filter" className="filter-label">
                  Filter by Duration
                </label>
                <input
                  id="duration-filter"
                  type="text"
                  value={durationFilter}
                  onChange={(e) => setDurationFilter(e.target.value)}
                  placeholder="Enter duration to filter..."
                  className="filter-input"
                  aria-describedby="duration-filter-help"
                  data-testid="filter-duration"
                />
                <span id="duration-filter-help" className="visually-hidden">
                  Type to filter sessions by duration in hours
                </span>
              </div>

              <div className="filter-group">
                <label htmlFor="status-filter" className="filter-label">
                  Filter by Status
                </label>
                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="filter-select"
                  aria-describedby="status-filter-help"
                  data-testid="filter-status"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <span id="status-filter-help" className="visually-hidden">
                  Select a status to filter sessions
                </span>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="hello-button secondary clear-filters-button"
                aria-label="Clear all filters"
                role="button"
                data-testid="clear-filters"
              >
                Clear Filters
              </button>
            </div>

            {titleFilter || durationFilter || statusFilter ? (
              <p className="filter-summary" role="status" aria-live="polite">
                Showing {filteredSessions.length} of {sessions.length} sessions
                {titleFilter && ` matching title "${titleFilter}"`}
                {durationFilter && ` matching duration "${durationFilter}"`}
                {statusFilter && (() => {
                  const statusOption = document.getElementById('status-filter')?.querySelector(`option[value="${statusFilter}"]`);
                  const statusDisplayText = statusOption?.textContent || statusFilter;
                  return ` matching status "${statusDisplayText}"`;
                })()}
              </p>
            ) : null}
          </section>

          <section aria-labelledby="sessions-heading">
            <h2 id="sessions-heading" className="visually-hidden">Training Sessions</h2>
            {filteredSessions.length === 0 ? (
              <p className="no-sessions" role="status" aria-live="polite">
                {sessions.length === 0 
                  ? 'No training sessions found. Click "Add Session" to create your first one.'
                  : 'No sessions match the current filters. Try adjusting your search criteria.'
                }
              </p>
            ) : (
              <ul 
                role="list" 
                aria-label="Training sessions"
                className="sessions-list"
                data-testid="sessions-list"
              >
                {filteredSessions.map((session) => (
                  <li 
                    key={session.id} 
                    role="listitem"
                    className="session-item"
                    data-testid={`session-item-${session.id}`}
                  >
                    <article role="article" aria-labelledby={`session-${session.id}-title`}>
                      <header>
                        <h3 
                          id={`session-${session.id}-title`}
                          className="session-title"
                          data-testid={`session-title-${session.id}`}
                        >
                          <button
                            className="title-edit-button"
                            onClick={() => navigate(`/edit/${session.id}`)}
                            aria-label={`Edit training session: ${session.title}`}
                            role="button"
                            data-testid={`edit-session-${session.id}`}
                          >
                            {session.title}
                          </button>
                        </h3>
                        <div className="session-actions">
                          <span 
                            className={`status-badge status-${session.status.toLowerCase().replace(' ', '-')}`}
                            role="status"
                            aria-label={`Status: ${session.status}`}
                            data-testid={`status-badge-${session.id}`}
                          >
                            {session.status}
                          </span>
                          <button
                            className="delete-button"
                            onClick={() => handleDeleteClick(session)}
                            aria-label={`Delete training session: ${session.title}`}
                            role="button"
                            data-testid={`delete-session-${session.id}`}
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
