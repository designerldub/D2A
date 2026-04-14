import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthShell } from './AuthShell'
import c from './authCard.module.css'

export function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // TODO: wire to real password reset API
    navigate('/login')
  }

  return (
    <AuthShell>
      <div className={c.inner}>
        <h1 className={c.title}>Forgot password?</h1>

        <p className={c.subtitle}>
          Please enter the email address you used to register to request a password reset code.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={c.fields}>
            <div className={c.field}>
              <label className={c.fieldLabel} htmlFor="email">Email Address</label>
              <input
                id="email"
                className={c.fieldInput}
                type="email"
                placeholder="Enter your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={c.btnRow}>
            <button
              type="button"
              className={c.cancelBtn}
              onClick={() => navigate('/login')}
            >
              Cancel
            </button>
            <button type="submit" className={c.submitBtn}>
              Send reset code
            </button>
          </div>
        </form>
      </div>
    </AuthShell>
  )
}
