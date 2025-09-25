import './App.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import trainingAPI from './api.js'

function EditSessionPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [finalDeleteConfirm, setFinalDeleteConfirm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    status: 'pending'
  })

  useEffect(() => {
    loadSession()
  }, [id])

  const loadSession = async () => {
    try {
      setLoading(true)
      const data = await trainingAPI.getSession(id)
      setSession(data)
      setFormData({
        title: data.title,
        description: data.description,
        duration: data.duration || '',
        status: data.status
      })
      setError(null)
    } catch (err) {
      setError('Failed to load training session')
      console.error('Error loading session:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const updatedSession = {
        ...session,
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null
      }
      
      await trainingAPI.updateSession(id, updatedSession)
      navigate('/list')
    } catch (err) {
      setError('Failed to update training session')
      console.error('Error updating session:', err)
    }
  }

  const handleDeleteClick = () => {
    setDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    setFinalDeleteConfirm(true)
    setDeleteConfirm(false)
  }

  const handleFinalDeleteConfirm = async () => {
    try {
      await trainingAPI.deleteSession(id)
      navigate('/list')
    } catch (err) {
      setError('Failed to delete training session')
      console.error('Error deleting session:', err)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm(false)
  }

  const handleFinalDeleteCancel = () => {
    setFinalDeleteConfirm(false)
  }

  const handleBackClick = () => {
    navigate('/list')
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1 className="page-title">Edit Training Session</h1>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1 className="page-title">Edit Training Session</h1>
          <p role="alert" aria-live="polite" className="error-message">
            {error}
          </p>
          <button 
            className="hello-button"
            onClick={loadSession}
            aria-label="Retry loading training session"
            role="button"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="page-container">
        <div className="page-content">
          <h1 className="page-title">Edit Training Session</h1>
          <p role="alert" aria-live="polite" className="error-message">
            Training session not found
          </p>
          <button 
            className="hello-button"
            onClick={handleBackClick}
            aria-label="Go back to training sessions list (cancel)"
            role="button"
          >
            Back to List (Cancel)
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container" data-testid="edit-page">
      <div className="page-content">
        <h1 className="page-title" data-testid="edit-title">Edit Training Session</h1>
        <p className="page-description">Update your training session details</p>
        
        <nav role="navigation" aria-label="Page navigation" data-testid="edit-page-nav">
          <button 
            className="hello-button secondary"
            onClick={handleBackClick}
            aria-label="Go back to training sessions list (cancel)"
            role="button"
            data-testid="edit-back"
          >
            ← Back to List (Cancel)
          </button>
        </nav>

        <main role="main" aria-label="Edit training session form" data-testid="edit-main">
          <form onSubmit={handleSubmit} className="edit-form" role="form" aria-labelledby="edit-form-heading" data-testid="edit-form">
            <h2 id="edit-form-heading" className="visually-hidden">Edit Training Session Form</h2>
            
            <div className="form-group">
              <label htmlFor="title-input" className="form-label">
                Session Title *
              </label>
              <input
                id="title-input"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="form-input"
                aria-describedby="title-help"
                aria-required="true"
                placeholder="Enter session title"
                data-testid="edit-title-input"
              />
              <span id="title-help" className="form-help">
                Enter a descriptive title for the training session
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="description-input" className="form-label">
                Description *
              </label>
              <textarea
                id="description-input"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="form-textarea"
                aria-describedby="description-help"
                aria-required="true"
                placeholder="Enter session description"
                data-testid="edit-description-input"
              />
              <span id="description-help" className="form-help">
                Provide a detailed description of what will be covered
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="status-input" className="form-label">
                Status *
              </label>
              <select
                id="status-input"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="form-select"
                aria-describedby="status-help"
                aria-required="true"
                data-testid="edit-status-select"
              >
                <option value="">Select a status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <span id="status-help" className="form-help">
                Choose the current status of the training session
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="duration-input" className="form-label">
                Duration (hours)
              </label>
              <input
                id="duration-input"
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="0.5"
                step="0.5"
                className="form-input"
                aria-describedby="duration-help"
                placeholder="2.5"
                data-testid="edit-duration-input"
              />
              <span id="duration-help" className="form-help">
                Estimated duration in hours (optional)
              </span>
            </div>

            <div className="form-actions" role="group" aria-label="Form actions" data-testid="edit-actions">
              <button
                type="submit"
                className="hello-button"
                aria-label="Save changes to training session"
                role="button"
                data-testid="edit-save"
              >
                Save Changes
              </button>
              
              <button
                type="button"
                className="hello-button secondary"
                onClick={handleDeleteClick}
                aria-label="Delete this training session"
                role="button"
                data-testid="edit-delete"
              >
                Delete Session
              </button>
            </div>
          </form>
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
        >
          <div className="modal-content" role="document">
            <h2 id="delete-confirm-title">Confirm Delete</h2>
            <p id="delete-confirm-description">
              Are you sure you want to delete "{session.title}"?
            </p>
            <div className="modal-actions">
              <button
                className="hello-button secondary"
                onClick={handleDeleteCancel}
                aria-label="Cancel deletion"
                role="button"
              >
                No, Cancel
              </button>
              <button
                className="hello-button delete-confirm"
                onClick={handleDeleteConfirm}
                aria-label="Yes, proceed to final confirmation"
                role="button"
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
        >
          <div className="modal-content" role="document">
            <h2 id="final-delete-confirm-title">Final Confirmation</h2>
            <p id="final-delete-confirm-description">
              This action cannot be undone. Are you absolutely sure you want to delete "{session.title}"?
            </p>
            <div className="modal-actions">
              <button
                className="hello-button secondary"
                onClick={handleFinalDeleteCancel}
                aria-label="Cancel final deletion"
                role="button"
              >
                No, Cancel
              </button>
              <button
                className="hello-button delete-confirm"
                onClick={handleFinalDeleteConfirm}
                aria-label="Yes, delete this training session permanently"
                role="button"
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

export default EditSessionPage
