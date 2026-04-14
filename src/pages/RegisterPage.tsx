import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthShell } from './AuthShell'
import c from './authCard.module.css'

export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Mock: register as a new user with all products
    login('u1')
    navigate('/')
  }

  return (
    <AuthShell>
      <div className={c.inner}>
        <h1 className={c.title}>Welcome</h1>

        <div className={c.tabRow}>
          <div className={c.tabToggle}>
            <Link
              to="/login"
              className={c.tab}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: '#000' }}
            >
              Login
            </Link>
            <button type="button" className={`${c.tab} ${c.tabActive}`}>Register</button>
          </div>
        </div>

        <p className={c.subtitle}>
          Lorem Ipsum is simply dummy text of the printing and typesetting industry.
        </p>

        <form onSubmit={handleSubmit}>
          <div className={c.fields}>
            <div className={c.field}>
              <label className={c.fieldLabel} htmlFor="name">Name</label>
              <input
                id="name"
                className={c.fieldInput}
                type="text"
                placeholder="Enter your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            <div className={c.field}>
              <label className={c.fieldLabel} htmlFor="confirm">Re-enter Password</label>
              <div className={c.passwordRow}>
                <input
                  id="confirm"
                  className={c.fieldInput}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your Password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={c.eyeBtn}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirm((v) => !v)}
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          </div>

          <p className={c.passwordHint}>
            Must be at least 8 characters, and contain letters, numbers, and at least one special character.
          </p>

          <button type="submit" className={c.submitBtn}>Register</button>
        </form>
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
