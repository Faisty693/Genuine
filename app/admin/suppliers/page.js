'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ business_name: '', email: '', full_name: '' })
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (userData?.role !== 'admin') return router.push('/')

      const { data } = await supabase
        .from('suppliers')
        .select('*, users(email, full_name)')
        .order('created_at', { ascending: false })

      setSuppliers(data || [])
    }
    load()
  }, [])

  async function handleAddSupplier() {
    if (!form.business_name || !form.email) return
    setLoading(true)
    setMessage('')

    const supabase = createClient()

    const { data: authData, error } = await supabase.auth.admin.createUser({
      email: form.email,
      password: 'Genuine@2024',
      email_confirm: true,
      user_metadata: { full_name: form.full_name, role: 'supplier' },
    })

    if (error) {
      setMessage('Error: ' + error.message)
      setLoading(false)
      return
    }

    const { data: supplier } = await supabase
      .from('suppliers')
      .insert({ user_id: authData.user.id, business_name: form.business_name })
      .select()
      .single()

    const { data: s } = await supabase.from('suppliers').select('*, users(email, full_name)').order('created_at', { ascending: false })
    setSuppliers(s || [])
    setForm({ business_name: '', email: '', full_name: '' })
    setShowForm(false)
    setMessage(`✓ Supplier added! Default password: Genuine@2024`)
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #333',
    color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', outline: 'none',
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.push('/admin')} style={{ background: 'none', border: '1px solid #333', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
          <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px' }}>SUPPLIERS</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          {showForm ? 'CANCEL' : '+ ADD SUPPLIER'}
        </button>
      </div>

      {message && (
        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: message.includes('✓') ? '#4ade80' : '#f87171', fontSize: '14px' }}>
          {message}
        </div>
      )}

      {showForm && (
        <div style={{ border: '1px solid #333', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#888' }}>NEW SUPPLIER</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input placeholder="Business Name" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} style={inputStyle} />
            <input placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} style={inputStyle} />
            <input placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
          </div>
          <p style={{ color: '#555', fontSize: '12px', marginTop: '12px' }}>Default password will be: Genuine@2024</p>
          <button onClick={handleAddSupplier} disabled={loading} style={{ marginTop: '16px', background: '#fff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
            {loading ? 'ADDING...' : 'ADD SUPPLIER'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {suppliers.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No suppliers yet</p>
        ) : suppliers.map(supplier => (
          <div key={supplier.id} style={{ border: '1px solid #222', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontWeight: '600', marginBottom: '4px' }}>{supplier.business_name}</p>
              <p style={{ color: '#888', fontSize: '13px' }}>{supplier.users?.full_name}</p>
              <p style={{ color: '#555', fontSize: '12px' }}>{supplier.users?.email}</p>
            </div>
            <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '700' }}>ACTIVE</span>
          </div>
        ))}
      </div>
    </div>
  )
}