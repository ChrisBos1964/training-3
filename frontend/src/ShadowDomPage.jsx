import { useEffect } from 'react'

function ShadowHost() {
  useEffect(() => {
    class HelloShadow extends HTMLElement {
      constructor() {
        super()
        const root = this.attachShadow({ mode: 'open' })
        const wrapper = document.createElement('div')
        wrapper.setAttribute('part', 'container')
        wrapper.innerHTML = `
          <style>
            :host { display: block; }
            .box {
              border: 1px solid #ccc;
              border-radius: 8px;
              padding: 16px;
              background: white;
            }
            .title { font-weight: 600; margin: 0 0 8px; }
            .btn {
              background: linear-gradient(45deg, #667eea, #764ba2);
              color: white;
              border: none;
              padding: 12px 24px;
              font-size: 1.1rem;
              border-radius: 25px;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
            }
            .status { margin-top: 10px; color: #444; }
            .input-group { margin: 10px 0; }
            .input-group input { 
              padding: 8px; 
              border: 1px solid #ccc; 
              border-radius: 4px; 
              margin-right: 8px; 
            }
            .api-result { 
              margin-top: 10px; 
              padding: 8px; 
              background: #f0f0f0; 
              border-radius: 4px; 
              font-family: monospace; 
            }
          </style>
          <div class="box" role="group" aria-label="Shadow content">
            <h3 class="title">Inside Shadow DOM</h3>
            <p>This content (including this button) lives in a shadow root.</p>
            
            <!-- Workaround 1: CSS Parts for styling and testing -->
            <button class="btn" part="button" type="button" data-testid="shadow-button">Click me</button>
            <div class="status" role="status" aria-live="polite" part="status" data-testid="shadow-status"></div>
            
            <!-- Workaround 2: Direct shadow root access demonstration -->
            <div class="input-group">
              <input type="text" part="input" placeholder="Enter text" data-testid="shadow-input">
              <button type="button" part="submit-btn" class="submit-btn" data-testid="shadow-submit">Submit</button>
            </div>
            <div class="api-result" part="result" data-testid="shadow-result"></div>
          </div>
        `
        root.appendChild(wrapper)

        // Store references for public API
        this._shadowRoot = root
        this._clickCount = 0
        this._inputValue = ''

        // Add interactive behavior
        const button = root.querySelector('.btn')
        const status = root.querySelector('.status')
        const input = root.querySelector('input')
        const submitBtn = root.querySelector('.submit-btn')
        const result = root.querySelector('.api-result')

        if (button && status) {
          button.addEventListener('click', () => {
            this._clickCount += 1
            status.textContent = `Clicked ${this._clickCount} ${this._clickCount === 1 ? 'time' : 'times'}`
            // Dispatch custom event for external testing
            this.dispatchEvent(new CustomEvent('shadow-click', { 
              detail: { count: this._clickCount },
              bubbles: true 
            }))
          })
        }

        if (input && submitBtn && result) {
          input.addEventListener('input', (e) => {
            this._inputValue = e.target.value
          })

          submitBtn.addEventListener('click', () => {
            result.textContent = `Submitted: "${this._inputValue}"`
            // Dispatch custom event for external testing
            this.dispatchEvent(new CustomEvent('shadow-submit', { 
              detail: { value: this._inputValue },
              bubbles: true 
            }))
          })
        }
      }

      // Workaround 4: Public API methods for testing
      getClickCount() {
        return this._clickCount
      }

      getInputValue() {
        return this._inputValue
      }

      setInputValue(value) {
        this._inputValue = value
        const input = this._shadowRoot.querySelector('input')
        if (input) {
          input.value = value
        }
      }

      getShadowRoot() {
        return this._shadowRoot
      }

      // Method to simulate button click from outside
      simulateButtonClick() {
        const button = this._shadowRoot.querySelector('.btn')
        if (button) {
          button.click()
        }
      }

      // Method to simulate form submission from outside
      simulateFormSubmit() {
        const submitBtn = this._shadowRoot.querySelector('.submit-btn')
        if (submitBtn) {
          submitBtn.click()
        }
      }

      connectedCallback() {}
    }
    if (!customElements.get('hello-shadow')) {
      customElements.define('hello-shadow', HelloShadow)
    }
  }, [])

  return (
    <hello-shadow data-testid="hello-shadow-element"></hello-shadow>
  )
}

export default function ShadowDomPage() {
  return (
    <div className="page-container" data-testid="shadow-page">
      <div className="page-content">
        <h1 className="page-title" data-testid="shadow-title">Shadow DOM</h1>
        <p className="page-description" data-testid="shadow-description">
          This page demonstrates a simple Web Component using Shadow DOM encapsulation.
        </p>
        <main role="main" aria-label="Shadow DOM demo" data-testid="shadow-main">
          <section aria-labelledby="shadow-section-heading">
            <h2 id="shadow-section-heading" className="visually-hidden">Shadow content section</h2>
            <ShadowHost />
          </section>
        </main>
      </div>
    </div>
  )
}


