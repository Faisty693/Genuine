'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: userData } = await supabase
        .from('users').select('role').eq('id', user.id).single()
      if (userData?.role !== 'admin') return router.push('/')

      const { data } = await supabase
        .from('orders')
        .select('*, order_items(id, product_name, quantity), payments(status, mpesa_code)')
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <button
          onClick={() => router.push('/admin')}
          style={{ background: 'none', border: '1px solid #333', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
        >← Back</button>
        <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px' }}>ALL ORDERS</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              background: filter === status ? '#fff' : '#111',
              color: filter === status ? '#000' : '#888',
              border: '1px solid #333', padding: '6px 16px', borderRadius: '20px',
              cursor: 'pointer', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
            }}
          >{status}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No orders found</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(order => (
            <div key={order.id} style={{ border: '1px solid #222', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p style={{ color: '#888', fontSize: '13px' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span style={{
                  color: order.status === 'paid' ? '#4ade80' : order.status === 'pending' ? '#facc15' : order.status === 'preparing' ? '#60a5fa' : '#888',
                  fontWeight: '700', fontSize: '12px', textTransform: 'uppercase',
                  border: '1px solid #333', padding: '4px 12px', borderRadius: '20px',
                }}>{order.status}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: '#111', borderRadius: '8px', padding: '16px' }}>
                  <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>CUSTOMER</p>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>{order.customer_name}</p>
                  <p style={{ color: '#555', fontSize: '12px' }}>{order.delivery_address}</p>
                </div>
                <div style={{ background: '#111', borderRadius: '8px', padding: '16px' }}>
                  <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>PAYMENT</p>
                  <p style={{ color: order.payments?.[0]?.status === 'completed' ? '#4ade80' : '#facc15', fontSize: '14px', marginBottom: '4px' }}>
                    {order.payments?.[0]?.status?.toUpperCase() || 'PENDING'}
                  </p>
                  {order.payments?.[0]?.mpesa_code && (
                    <p style={{ color: '#555', fontSize: '12px' }}>Code: {order.payments[0].mpesa_code}</p>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {order.order_items?.map(item => (
                    <span key={item.id} style={{ color: '#888', fontSize: '12px', marginRight: '12px' }}>
                      {item.product_name} x{item.quantity}
                    </span>
                  ))}
                </div>
                <p style={{ fontWeight: '800', fontSize: '18px' }}>KSh {order.total.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}