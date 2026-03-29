'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

export default function AdminPayments() {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [updating, setUpdating] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (userData?.role !== 'admin') return router.push('/')

      const { data } = await supabase
        .from('supplier_payouts')
        .select('*, suppliers(business_name), orders(id, status, total, created_at)')
        .order('created_at', { ascending: false })

      setPayouts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function markPaid(id) {
    setUpdating(id)
    const supabase = createClient()
    await supabase
      .from('supplier_payouts')
      .update({ is_paid: true, paid_at: new Date().toISOString() })
      .eq('id', id)

    setPayouts(prev => prev.map(p => p.id === id ? { ...p, is_paid: true } : p))
    setUpdating(null)
  }

  const filtered = filter === 'all' ? payouts : filter === 'paid' ? payouts.filter(p => p.is_paid) : payouts.filter(p => !p.is_paid)
  const totalOwed = payouts.filter(p => !p.is_paid).reduce((acc, p) => acc + p.amount, 0)
  const totalPaid = payouts.filter(p => p.is_paid).reduce((acc, p) => acc + p.amount, 0)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <button onClick={() => router.push('/admin')} style={{ background: 'none', border: '1px solid #333', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
        <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px' }}>SUPPLIER PAYOUTS</h1>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <div style={{ border: '1px solid #222', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#f87171', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>KSh {totalOwed.toLocaleString()}</p>
          <p style={{ color: '#888', fontSize: '12px' }}>TOTAL OWED TO SUPPLIERS</p>
        </div>
        <div style={{ border: '1px solid #222', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#4ade80', fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>KSh {totalPaid.toLocaleString()}</p>
          <p style={{ color: '#888', fontSize: '12px' }}>TOTAL PAID TO SUPPLIERS</p>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'unpaid', 'paid'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? '#fff' : '#111', color: filter === f ? '#000' : '#888', border: '1px solid #333', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.length === 0 ? (
            <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No payouts found</p>
          ) : filtered.map(payout => (
            <div key={payout.id} style={{ border: '1px solid #222', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{payout.suppliers?.business_name}</p>
                <p style={{ color: '#888', fontSize: '12px' }}>Order #{payout.orders?.id?.slice(0, 8).toUpperCase()}</p>
                <p style={{ color: '#555', fontSize: '12px' }}>{new Date(payout.orders?.created_at).toLocaleDateString()}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '800', fontSize: '18px', marginBottom: '8px' }}>KSh {payout.amount.toLocaleString()}</p>
                {payout.is_paid ? (
                  <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: '700' }}>✓ PAID</span>
                ) : (
                  <button
                    onClick={() => markPaid(payout.id)}
                    disabled={updating === payout.id}
                    style={{ background: '#fff', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
                  >
                    {updating === payout.id ? 'UPDATING...' : 'MARK AS PAID'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}