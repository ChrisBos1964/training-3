import './App.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import trainingAPI from './api.js'

function AddSessionPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    duration: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleBackClick = () => {
    navigate('/list')
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
    setLoading(true)
    setError(null)

    try {
      const sessionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: formData.status,
        duration: formData.duration ? parseFloat(formData.duration) : null
      }

      await trainingAPI.createSession(sessionData)
      navigate('/list')
    } catch (err) {
      setError(err.message || 'Failed to create training session')
      console.error('Error creating session:', err)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.title.trim() && formData.description.trim() && formData.status

  return (
    <div className="page-container" data-testid="add-page">
      <div className="page-content">
        <h1 className="page-title" data-testid="add-title">Add New Training Session</h1>
        <p className="page-description">Create a new training session</p>
        
        <nav role="navigation" aria-label="Page navigation" data-testid="add-page-nav">
          <button 
            className="hello-button secondary"
            onClick={handleBackClick}
            aria-label="Go back to training sessions list"
            role="button"
            data-testid="add-back"
          >
            ← Back to List
          </button>
        </nav>

        <main role="main" aria-label="Add training session form" data-testid="add-main">
          <section aria-labelledby="form-heading">
            <h2 id="form-heading" className="visually-hidden">Training Session Form</h2>
            
            {error && (
              <div role="alert" aria-live="polite" className="error-message">
                {error}
              </div>
            )}
            
            <form 
              onSubmit={handleSubmit}
              role="form"
              aria-labelledby="form-heading"
              className="session-form"
              data-testid="add-form"
            >
              <div className="form-group">
                <label 
                  htmlFor="session-title"
                  className="form-label"
                >
                  Session Title *
                </label>
                <input
                  type="text"
                  id="session-title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  aria-describedby="title-help"
                  className="form-input"
                  placeholder="Enter session title"
                  disabled={loading}
                  data-testid="add-title-input"
                />
                <div id="title-help" className="form-help">
                  Enter a descriptive title for the training session
                </div>
              </div>

              <div className="form-group">
                <label 
                  htmlFor="session-description"
                  className="form-label"
                >
                  Description *
                </label>
                <textarea
                  id="session-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  aria-describedby="description-help"
                  className="form-textarea"
                  placeholder="Enter session description"
                  rows="4"
                  disabled={loading}
                  data-testid="add-description-input"
                />
                <div id="description-help" className="form-help">
                  Provide a detailed description of what will be covered
                </div>
              </div>

              <div className="form-group">
                <label 
                  htmlFor="session-status"
                  className="form-label"
                >
                  Status *
                </label>
                <select
                  id="session-status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  aria-describedby="status-help"
                  className="form-select"
                  disabled={loading}
                  data-testid="add-status-select"
                >
                  <option value="">Select a status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <div id="status-help" className="form-help">
                  Choose the current status of the training session
                </div>
              </div>

              <div className="form-group">
                <label 
                  htmlFor="session-duration"
                  className="form-label"
                >
                  Duration (hours)
                </label>
                <input
                  type="number"
                  id="session-duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="0.5"
                  step="0.5"
                  aria-describedby="duration-help"
                  className="form-input"
                  placeholder="2.5"
                  disabled={loading}
                  data-testid="add-duration-input"
                />
                <div id="duration-help" className="form-help">
                  Estimated duration in hours (optional)
                </div>
              </div>

              <div className="form-actions" data-testid="add-actions">
                <button
                  type="submit"
                  className="hello-button"
                  aria-label="Create training session"
                  disabled={loading || !isFormValid}
                  role="button"
                  data-testid="add-submit"
                >
                  {loading ? 'Creating...' : 'Create training session'}
                </button>
                <button
                  type="button"
                  className="hello-button secondary"
                  onClick={handleBackClick}
                  aria-label="Cancel and return to list"
                  disabled={loading}
                  role="button"
                  data-testid="add-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  )
}

export default AddSessionPage
