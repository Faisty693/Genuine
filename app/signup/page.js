'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import Logo from '../components/Logo'
import Link from 'next/link'

export default function SignupPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSignup() {
    if (!form.full_name || !form.email || !form.password) return setError('Please fill in all fields')
    if (form.password.length < 6) return setError('Password must be at least 6 characters')
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          phone: form.phone,
          role: 'customer',
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/'), 2000)
  }

  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #333',
    color: '#fff', padding: '12px 16px', borderRadius: '8px',
    fontSize: '15px', outline: 'none',
  }

  if (success) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '40px', marginBottom: '16px' }}>✅</p>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Account Created!</h2>
        <p style={{ color: '#888' }}>Redirecting you to the shop...</p>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Logo size={60} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '4px' }}>GENUINE</h1>
          <p style={{ color: '#888', marginTop: '8px' }}>Create your account</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {[
            { key: 'full_name', label: 'FULL NAME', placeholder: 'John Doe', type: 'text' },
            { key: 'email', label: 'EMAIL', placeholder: 'you@example.com', type: 'email' },
            { key: 'phone', label: 'PHONE NUMBER', placeholder: '0712345678', type: 'tel' },
            { key: 'password', label: 'PASSWORD', placeholder: '••••••••', type: 'password' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '13px' }}>{field.label}</label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: '#111', border: '1px solid #f87171', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#f87171', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: '100%', background: loading ? '#333' : '#fff', color: loading ? '#888' : '#000',
            border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px',
            fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px',
            marginBottom: '16px',
          }}
        >
          {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
        </button>

        <p style={{ textAlign: 'center', color: '#888', fontSize: '14px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#fff', fontWeight: '700' }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}