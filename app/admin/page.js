'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ orders: 0, revenue: 0, pending: 0, suppliers: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (userData?.role !== 'admin') return router.push('/')
      const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      const { data: suppliers } = await supabase.from('suppliers').select('*')
      const revenue = orders?.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.total, 0) || 0
      setStats({ orders: orders?.length || 0, revenue, pending: orders?.filter(o => o.status === 'pending').length || 0, suppliers: suppliers?.length || 0 })
      setRecentOrders(orders?.slice(0, 8) || [])
    }
    load()
  }, [])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '2px', marginBottom: '8px' }}>ADMIN DASHBOARD</h1>
      <p style={{ color: '#888', marginBottom: '40px' }}>Welcome back, Admin</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '40px' }}>
        {[
          { label: 'Products', path: '/admin/products', emoji: '📦' },
          { label: 'Orders', path: '/admin/orders', emoji: '🛍️' },
          { label: 'Suppliers', path: '/admin/suppliers', emoji: '🏭' },
          { label: 'Payments', path: '/admin/payments', emoji: '💰' },
        ].map(item => (
          <button key={item.path} onClick={() => router.push(item.path)} style={{ background: '#111', border: '1px solid #222', color: '#fff', padding: '20px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.emoji}</div>
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'Total Orders', value: stats.orders, color: '#fff' },
          { label: 'Total Revenue', value: `KSh ${stats.revenue.toLocaleString()}`, color: '#4ade80' },
          { label: 'Pending Orders', value: stats.pending, color: '#facc15' },
          { label: 'Suppliers', value: stats.suppliers, color: '#60a5fa' },
        ].map(stat => (
          <div key={stat.label} style={{ border: '1px solid #222', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
            <p style={{ color: stat.color, fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{stat.value}</p>
            <p style={{ color: '#888', fontSize: '12px' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#888' }}>RECENT ORDERS</h2>
      <div style={{ border: '1px solid #222', borderRadius: '12px', overflow: 'hidden' }}>
        {recentOrders.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No orders yet</p>
        ) : recentOrders.map((order, index) => (
          <div key={order.id} onClick={() => router.push('/admin/orders')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', borderBottom: index < recentOrders.length - 1 ? '1px solid #222' : 'none' }}>
            <div>
              <p style={{ fontWeight: '600', fontSize: '14px' }}>#{order.id.slice(0, 8).toUpperCase()}</p>
              <p style={{ color: '#888', fontSize: '12px' }}>{order.customer_name}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '700', fontSize: '14px' }}>KSh {order.total.toLocaleString()}</p>
              <span style={{ color: order.status === 'paid' ? '#4ade80' : order.status === 'pending' ? '#facc15' : '#888', fontSize: '11px', textTransform: 'uppercase', fontWeight: '700' }}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}