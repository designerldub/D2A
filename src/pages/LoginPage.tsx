import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthShell } from './AuthShell'
import c from './authCard.module.css'

// Dev-mode: map email prefix → mock user id
function resolveMockUser(email: string): string {
  const e = email.toLowerCase()
  if (e.startsWith('admin') || e.startsWith('dana')) return 'u4'
  if (e.startsWith('bob')) return 'u2'
  if (e.startsWith('carol')) return 'u3'
  if (e.startsWith('eve')) return 'u5'
  if (e.startsWith('frank')) return 'u6'
  return 'u1'
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    login(resolveMockUser(email))
    navigate('/')
  }

  return (
    <AuthShell>
      <div className={c.inner}>
        <h1 className={c.title}>Welcome</h1>

        <div className={c.tabRow}>
          <div className={c.tabToggle}>
            <button type="button" className={`${c.tab} ${c.tabActive}`}>Login</button>
            <Link to="/register" className={c.tab} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#000' }}>
              Register
            </Link>
          </div>
        </div>

        <p className={c.subtitle}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
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

            <div className={c.field}>
              <label className={c.fieldLabel} htmlFor="password">Password</label>
              <div className={c.passwordRow}>
                <input
                  id="password"
                  className={c.fieldInput}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={c.eyeBtn}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>

          <div className={c.rememberRow}>
            <label className={c.checkboxLabel}>
              <input
                type="checkbox"
                className={c.checkbox}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot-password" className={c.forgotLink}>Forgot Password?</Link>
          </div>

          <button type="submit" className={c.submitBtn}>Login</button>
        </form>

        <div className={c.devNote}>
          <strong>Dev mode — test credentials</strong><br />
          alice@test.com → all products &nbsp;·&nbsp;
          bob@test.com → care-journey &nbsp;·&nbsp;
          carol@test.com → map + user-stories<br />
          dana@test.com → super admin &nbsp;·&nbsp;
          eve@test.com → org admin (Org A) &nbsp;·&nbsp;
          frank@test.com → org admin (Orgs B &amp; E)<br />
          Any password works.
        </div>
      </div>
    </AuthShell>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
