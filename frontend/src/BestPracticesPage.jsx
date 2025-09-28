import './App.css'
import { useNavigate } from 'react-router-dom'

function BestPracticesPage() {
  const navigate = useNavigate()

  const handleBackClick = () => {
    navigate('/')
  }

  return (
    <div className="page-container">
      <div className="page-content">
        <h1 className="page-title">Testing Best Practices</h1>
        <p className="page-description">Follow these TestingLibrary patterns for accessible and maintainable tests</p>
        
        <nav role="navigation" aria-label="Page navigation">
          <button 
            className="hello-button secondary"
            onClick={handleBackClick}
            aria-label="Go back to home page"
            role="button"
          >
            ← Back to Home
          </button>
        </nav>

        <main role="main" aria-label="Testing best practices list">
          <section aria-labelledby="practices-heading">
            <h2 id="practices-heading" className="visually-hidden">Best Practices Content</h2>
            
            <div className="best-practices-list">
              <article className="practice-item" data-testid="bp-await-expect">
                <h3 className="practice-title">0. Always await assertions (Playwright auto-waits)</h3>
                <p className="practice-description">
                  In Playwright, expectations return promises and auto-wait. You must <strong>await</strong> them; otherwise the next steps may run too early causing flaky tests.
                </p>
                <div className="code-example">
                  <pre><code>{`// Bad: next line runs immediately; flake/unhandled rejection risk
expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
await page.getByRole('button', { name: 'Save' }).click();

// Good: click happens only after visibility is confirmed
await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
await page.getByRole('button', { name: 'Save' }).click();`}</code></pre>
                </div>
              </article>

              <article className="practice-item">
                <h3 className="practice-title">1. Use TestingLibrary Pattern: Queries Accessible to Everyone</h3>
                <p className="practice-description">
                  Queries that reflect the experience of visual/mouse users as well as those that use assistive technology.
                </p>
                
                <div className="practice-section">
                  <h4>getByRole</h4>
                  <p>This can be used to query every element that is exposed in the accessibility tree. With the name option you can filter the returned elements by their accessible name. This should be your top preference for just about everything.</p>
                  <div className="code-example">
                    <pre><code><span className="comment">// Most often, this will be used with the name option like so:</span>
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByRole</span>(<span className="string">'button'</span>, <span className="punctuation">{'{'}</span> <span className="property">name</span>: <span className="regex">/submit/i</span> <span className="punctuation">{'}'}</span>)).<span className="function">toBeVisible</span>();{'\n\n'}
<span className="comment">// Examples:</span>{'\n'}
<span className="keyword">await</span> page.<span className="function">getByRole</span>(<span className="string">'button'</span>, <span className="punctuation">{'{'}</span> <span className="property">name</span>: <span className="string">'Create training session'</span> <span className="punctuation">{'}'}</span>).<span className="function">click</span>();{'\n'}
<span className="keyword">await</span> page.<span className="function">getByRole</span>(<span className="string">'heading'</span>, <span className="punctuation">{'{'}</span> <span className="property">name</span>: <span className="string">'Training Sessions'</span> <span className="punctuation">{'}'}</span>).<span className="function">toBeVisible</span>();{'\n'}
<span className="keyword">await</span> page.<span className="function">getByRole</span>(<span className="string">'link'</span>, <span className="punctuation">{'{'}</span> <span className="property">name</span>: <span className="string">'Go to Home page'</span> <span className="punctuation">{'}'}</span>).<span className="function">click</span>();</code></pre>
                  </div>
                </div>

                <div className="practice-section">
                  <h4>getByLabelText</h4>
                  <p>This method is really good for form fields. When navigating through a website form, users find elements using label text. This method emulates that behavior, so it should be your top preference.</p>
                  <div className="code-example">
                    <pre><code><span className="comment">// Examples:</span>{'\n'}
<span className="keyword">await</span> page.<span className="function">getByLabel</span>(<span className="string">'Session Title *'</span>).<span className="function">fill</span>(<span className="string">'My Session'</span>);{'\n'}
<span className="keyword">await</span> page.<span className="function">getByLabel</span>(<span className="string">'Description *'</span>).<span className="function">fill</span>(<span className="string">'Session description'</span>);{'\n'}
<span className="keyword">await</span> page.<span className="function">getByLabel</span>(<span className="string">'Status *'</span>).<span className="function">selectOption</span>(<span className="string">'Pending'</span>);{'\n'}
<span className="keyword">await</span> page.<span className="function">getByLabel</span>(<span className="string">'Duration (hours)'</span>).<span className="function">fill</span>(<span className="string">'2.5'</span>);</code></pre>
                  </div>
                </div>

                <div className="practice-section">
                  <h4>getByPlaceholderText</h4>
                  <p>A placeholder is not a substitute for a label. But if that's all you have, then it's better than alternatives.</p>
                  <div className="code-example">
                    <pre><code><span className="comment">// Examples:</span>{'\n'}
<span className="keyword">await</span> page.<span className="function">getByPlaceholder</span>(<span className="string">'Enter session title'</span>).<span className="function">fill</span>(<span className="string">'My Session'</span>);{'\n'}
<span className="keyword">await</span> page.<span className="function">getByPlaceholder</span>(<span className="string">'Enter session description'</span>).<span className="function">fill</span>(<span className="string">'Description'</span>);{'\n'}
<span className="keyword">await</span> page.<span className="function">getByPlaceholder</span>(<span className="string">'2.5'</span>).<span className="function">fill</span>(<span className="string">'3.0'</span>);</code></pre>
                  </div>
                </div>

                <div className="practice-section">
                  <h4>getByText</h4>
                  <p>Outside of forms, text content is the main way users find elements. This method can be used to find non-interactive elements (like divs, spans, and paragraphs).</p>
                  <div className="code-example">
                    <pre><code><span className="comment">// Examples:</span>{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByText</span>(<span className="string">'No training sessions found'</span>)).<span className="function">toBeVisible</span>();{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByText</span>(<span className="string">'Welcome to the Playwright Training'</span>)).<span className="function">toBeVisible</span>();{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByText</span>(<span className="string">'This action cannot be undone'</span>)).<span className="function">toBeVisible</span>();</code></pre>
                  </div>
                </div>

                <div className="practice-section">
                  <h4>getByDisplayValue</h4>
                  <p>The current value of a form element can be useful when navigating a page with filled-in values.</p>
                  <div className="code-example">
                    <pre><code><span className="comment">// Examples:</span>{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByDisplayValue</span>(<span className="string">'My Session'</span>)).<span className="function">toBeVisible</span>();{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByDisplayValue</span>(<span className="string">'Pending'</span>)).<span className="function">toBeVisible</span>();{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByDisplayValue</span>(<span className="string">'2.5'</span>)).<span className="function">toBeVisible</span>();</code></pre>
                  </div>
                </div>
              </article>

              <article className="practice-item">
                <h3 className="practice-title">2. Semantic Queries</h3>
                <p className="practice-description">
                  HTML5 and ARIA compliant selectors. Note that the user experience of interacting with these attributes varies greatly across browsers and assistive technology.
                </p>
                
                <div className="practice-section">
                  <h4>getByAltText</h4>
                  <p>If your element is one which supports alt text (img, area, input, and any custom element), you can use this to find that element.</p>
                  <div className="code-example">
                    <pre><code><span className="comment">// Examples:</span>{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByAltText</span>(<span className="string">'Company logo'</span>)).<span className="function">toBeVisible</span>();{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByAltText</span>(<span className="string">'Training session icon'</span>)).<span className="function">toBeVisible</span>();{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByAltText</span>(<span className="string">'Delete button'</span>)).<span className="function">toBeVisible</span>();</code></pre>
                  </div>
                </div>

                <div className="practice-section">
                  <h4>getByTitle</h4>
                  <p>The title attribute is not consistently read by screenreaders, and is not visible by default for sighted users.</p>
                  <div className="code-example">
                    <pre><code><span className="comment">// Examples (use sparingly):</span>{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByTitle</span>(<span className="string">'Help information'</span>)).<span className="function">toBeVisible</span>();{'\n'}
<span className="keyword">await</span> <span className="function">expect</span>(page.<span className="function">getByTitle</span>(<span className="string">'Tooltip text'</span>)).<span className="function">toBeVisible</span>();</code></pre>
                  </div>
                </div>
              </article>

              <article className="practice-item">
                <h3 className="practice-title">3. Test IDs (Last Resort)</h3>
                <p className="practice-description">
                  The user cannot see (or hear) these, so this is only recommended for cases where you can't match by role or text or it doesn't make sense.
                </p>
                
                <div className="practice-section">
                  <h4>getByTestId</h4>
                  <p>Only use when you can't match by role or text or it doesn't make sense (e.g. the text is dynamic).</p>
                  <div className="code-example">
                    <pre><code><span className="comment">// Examples (use sparingly):</span>{'\n'}
<span className="keyword">await</span> page.<span className="function">getByTestId</span>(<span className="string">'session-item-123'</span>).<span className="function">click</span>();{'\n'}
<span className="keyword">await</span> page.<span className="function">getByTestId</span>(<span className="string">'dynamic-content'</span>).<span className="function">toBeVisible</span>();{'\n'}
<span className="keyword">await</span> page.<span className="function">getByTestId</span>(<span className="string">'chart-container'</span>).<span className="function">toBeVisible</span>();</code></pre>
                  </div>
                </div>
              </article>

              <article className="practice-item">
                <h3 className="practice-title">4. Best Practices Summary</h3>
                <div className="practice-section">
                  <h4>Priority Order</h4>
                  <ol className="priority-list">
                    <li><strong>getByRole</strong> - Best for interactive elements</li>
                    <li><strong>getByLabelText</strong> - Best for form fields</li>
                    <li><strong>getByText</strong> - Good for non-interactive content</li>
                    <li><strong>getByPlaceholderText</strong> - Use when no label available</li>
                    <li><strong>getByDisplayValue</strong> - Good for form validation</li>
                    <li><strong>getByAltText</strong> - Use for images and media</li>
                    <li><strong>getByTitle</strong> - Use sparingly</li>
                    <li><strong>getByTestId</strong> - Last resort only</li>
                  </ol>
                </div>

                <div className="practice-section">
                  <h4>Why This Matters</h4>
                  <ul className="benefits-list">
                    <li>Tests reflect how users actually interact with your app</li>
                    <li>Accessibility issues become test failures</li>
                    <li>Tests are more resilient to UI changes</li>
                    <li>Better user experience for everyone</li>
                    <li>Compliance with accessibility standards</li>
                  </ul>
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default BestPracticesPage
