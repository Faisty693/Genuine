'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import Logo from '../components/Logo'
import Link from 'next/link'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!form.email || !form.password) return setError('Please fill in all fields')
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (userData?.role === 'admin') window.location.href = '/admin'
    else if (userData?.role === 'supplier') window.location.href = '/supplier'
    else window.location.href = '/'
  }

  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #333',
    color: '#fff', padding: '12px 16px', borderRadius: '8px',
    fontSize: '15px', outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Logo size={60} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '4px' }}>GENUINE</h1>
          <p style={{ color: '#888', marginTop: '8px' }}>Sign in to your account</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '13px' }}>EMAIL</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '13px' }}>PASSWORD</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
        </div>

        {error && (
          <div style={{ background: '#111', border: '1px solid #f87171', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#f87171', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: '100%', background: loading ? '#333' : '#fff', color: loading ? '#888' : '#000',
            border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px',
            fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px',
            marginBottom: '16px',
          }}
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: '#fff', fontWeight: '700' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  )
}