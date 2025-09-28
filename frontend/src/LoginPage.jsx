import './App.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'))
  const [showCreateAccount, setShowCreateAccount] = useState(false)
  const [createAccountData, setCreateAccountData] = useState({
    username: '',
    password: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Store token and user info
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        // Navigate to list page
        navigate('/list')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Keep state in sync if token changes from other tabs/windows
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'token') {
        setIsLoggedIn(!!e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Update isLoggedIn state when component mounts or token changes
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])

  // Force re-check of token state on every render
  useEffect(() => {
    const currentTokenState = !!localStorage.getItem('token')
    if (currentTokenState !== isLoggedIn) {
      setIsLoggedIn(currentTokenState)
    }
  })


  // Handle SSO callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const ssoStatus = urlParams.get('sso')
    const token = urlParams.get('token')
    const userParam = urlParams.get('user')
    const message = urlParams.get('message')
    
    if (ssoStatus === 'success' && token) {
      localStorage.setItem('token', token)
      if (userParam) {
        localStorage.setItem('user', decodeURIComponent(userParam))
      }
      navigate('/list')
    } else if (ssoStatus === 'error') {
      setError(message || 'SSO login failed. Please try again.')
    }
  }, [navigate])

  const handleCancelClick = () => {
    navigate(-1) // Go back to previous page
  }

  const handleLogout = () => {
    // Remove token and user data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Update state
    setIsLoggedIn(false)
    
    // Navigate to home page
    navigate('/')
  }

  const handleForgotPassword = async () => {
    if (!formData.username.trim()) {
      return // Do nothing if username is empty
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: formData.username.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        console.log(`Password reset for user '${formData.username}'. New password: ${data.newPassword}`)
        setError(`Password has been reset for '${formData.username}'. Check console for new password.`)
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Forgot password error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccountClick = () => {
    setShowCreateAccount(true)
    setError('')
  }

  const handleCreateAccountInputChange = (e) => {
    const { name, value } = e.target
    setCreateAccountData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createAccountData),
      })

      const data = await response.json()

      if (data.success) {
        setError(`Account created successfully for '${createAccountData.username}'. You can now log in.`)
        setShowCreateAccount(false)
        setCreateAccountData({ username: '', password: '' })
      } else {
        setError(data.error || 'Failed to create account')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      console.error('Create account error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setShowCreateAccount(false)
    setCreateAccountData({ username: '', password: '' })
    setError('')
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/auth/google'
  }

  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:3001/auth/github'
  }

  const isFormValid = formData.username.trim() && formData.password.trim()

  const loggedIn = isLoggedIn

  return (
    <div className="page-container" data-testid="login-page">
      <div className="page-content">
        <h1 className="page-title" data-testid="login-title">
          {loggedIn ? 'Logout' : showCreateAccount ? 'Create Account' : 'Login'}
        </h1>
        <p className="page-description" data-testid="login-description">
          {loggedIn 
            ? 'You are currently logged in. Sign out to end your session.' 
            : showCreateAccount 
              ? 'Create a new account to access your training sessions'
              : 'Sign in to access your training sessions'
          }
        </p>
        

        <main role="main" aria-label={loggedIn ? "Logout form" : showCreateAccount ? "Create account form" : "Login form"} data-testid="login-main">
          <section aria-labelledby="login-form-heading">
            <h2 id="login-form-heading" className="visually-hidden">
              {isLoggedIn ? 'Logout Form' : showCreateAccount ? 'Create Account Form' : 'Login Form'}
            </h2>
            
            {error && (
              <div role="alert" aria-live="polite" className="error-message" data-testid="login-error">
                {error}
              </div>
            )}
            
            {loggedIn ? (
              // Logout form
              <div 
                role="form"
                aria-labelledby="login-form-heading"
                className="logout-form"
                data-testid="logout-form"
              >
                <div className="form-actions" data-testid="logout-actions">
                  <button
                    type="button"
                    className="hello-button secondary"
                    onClick={handleCancelClick}
                    aria-label="Cancel logout and return to previous page"
                    role="button"
                    data-testid="logout-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="hello-button"
                    onClick={handleLogout}
                    aria-label="Sign out and end your session"
                    role="button"
                    data-testid="logout-submit"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : showCreateAccount ? (
              // Create Account form
              <form 
                onSubmit={handleCreateAccountSubmit}
                role="form"
                aria-labelledby="login-form-heading"
                className="create-account-form"
                data-testid="create-account-form"
              >
                <div className="form-group">
                  <label 
                    htmlFor="create-username"
                    className="form-label"
                  >
                    Username *
                  </label>
                  <input
                    type="text"
                    id="create-username"
                    name="username"
                    value={createAccountData.username}
                    onChange={handleCreateAccountInputChange}
                    required
                    aria-required="true"
                    aria-describedby="create-username-help"
                    className="form-input"
                    placeholder="Enter your username"
                    disabled={loading}
                    data-testid="create-username-input"
                  />
                  <div id="create-username-help" className="form-help">
                    Choose a unique username
                  </div>
                </div>

                <div className="form-group">
                  <label 
                    htmlFor="create-password"
                    className="form-label"
                  >
                    Password *
                  </label>
                  <input
                    type="password"
                    id="create-password"
                    name="password"
                    value={createAccountData.password}
                    onChange={handleCreateAccountInputChange}
                    required
                    aria-required="true"
                    aria-describedby="create-password-help"
                    className="form-input"
                    placeholder="Enter your password"
                    disabled={loading}
                    data-testid="create-password-input"
                  />
                  <div id="create-password-help" className="form-help">
                    Choose a secure password
                  </div>
                </div>

                <div className="form-actions" data-testid="create-account-actions">
                  <button
                    type="submit"
                    className="hello-button"
                    aria-label="Create new account"
                    disabled={loading || !createAccountData.username.trim() || !createAccountData.password.trim()}
                    role="button"
                    data-testid="create-account-submit"
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                  <button
                    type="button"
                    className="hello-button secondary"
                    onClick={handleBackToLogin}
                    aria-label="Back to login form"
                    disabled={loading}
                    role="button"
                    data-testid="create-account-back"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              // Login form with sidebar
              <div className="login-form-container" data-testid="login-form-container">
                <form 
                  onSubmit={handleSubmit}
                  role="form"
                  aria-labelledby="login-form-heading"
                  className="login-form"
                  data-testid="login-form"
                >
                  <div className="form-group">
                    <label 
                      htmlFor="login-username"
                      className="form-label"
                    >
                      Username *
                    </label>
                    <input
                      type="text"
                      id="login-username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      aria-describedby="username-help"
                      className="form-input"
                      placeholder="Enter your username"
                      disabled={loading}
                      autoFocus
                      data-testid="login-username-input"
                    />
                    <div id="username-help" className="form-help">
                      Enter your username
                    </div>
                  </div>

                  <div className="form-group">
                    <label 
                      htmlFor="login-password"
                      className="form-label"
                    >
                      Password *
                    </label>
                    <input
                      type="password"
                      id="login-password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      aria-describedby="password-help"
                      className="form-input"
                      placeholder="Enter your password"
                      disabled={loading}
                      data-testid="login-password-input"
                    />
                    <div id="password-help" className="form-help">
                      Enter your password
                    </div>
                  </div>

                  <div className="form-actions" data-testid="login-actions">
                    <button
                      type="submit"
                      className="hello-button"
                      aria-label="Sign in to your account"
                      disabled={loading || !isFormValid}
                      role="button"
                      data-testid="login-submit"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      className="hello-button secondary"
                      onClick={handleCancelClick}
                      aria-label="Cancel and return to previous page"
                      disabled={loading}
                      role="button"
                      data-testid="login-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                {/* Vertical separator and sidebar */}
                {!showCreateAccount && !isLoggedIn && (
                  <div className="login-sidebar" data-testid="login-sidebar">
                    <div className="vertical-separator" data-testid="vertical-separator"></div>
                    
                    <div className="sidebar-actions" data-testid="sidebar-actions">
                      {/* Forgot Password Link */}
                      <div className="forgot-password-section" data-testid="forgot-password-section">
                        <button
                          type="button"
                          className="forgot-password-link"
                          onClick={handleForgotPassword}
                          aria-label="Reset password for entered username"
                          role="button"
                          disabled={loading || !formData.username.trim()}
                          data-testid="forgot-password-link"
                        >
                          Forgot password?
                        </button>
                      </div>

                      {/* Google SSO Section */}
                      <div className="google-sso-section" data-testid="google-sso-section">
                        <button
                          type="button"
                          className="hello-button google-sso-button"
                          onClick={handleGoogleLogin}
                          aria-label="Sign in with Google"
                          role="button"
                          disabled={loading}
                          data-testid="google-sso-button"
                        >
                          Sign in with Google
                        </button>
                      </div>

                      {/* GitHub SSO Section */}
                      <div className="github-sso-section" data-testid="github-sso-section">
                        <button
                          type="button"
                          className="hello-button github-sso-button"
                          onClick={handleGitHubLogin}
                          aria-label="Sign in with GitHub"
                          role="button"
                          disabled={loading}
                          data-testid="github-sso-button"
                        >
                          Sign in with GitHub
                        </button>
                      </div>

                      {/* Create Account Section */}
                      <div className="create-account-section" data-testid="create-account-section">
                        <button
                          type="button"
                          className="hello-button create-account-button"
                          onClick={handleCreateAccountClick}
                          aria-label="Create new user account"
                          role="button"
                          disabled={loading}
                          data-testid="create-account-button"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default LoginPage
