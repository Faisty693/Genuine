'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

export default function SupplierDashboard() {
  const [stats, setStats] = useState({ pending: 0, preparing: 0, shipped: 0, totalEarnings: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [supplier, setSupplier] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: supplierData } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!supplierData) return router.push('/')
      setSupplier(supplierData)

      const { data: payouts } = await supabase
        .from('supplier_payouts')
        .select('*, orders(status)')
        .eq('supplier_id', supplierData.id)

      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, orders(id, status, customer_name, delivery_address, created_at)')
        .eq('supplier_id', supplierData.id)
        .order('created_at', { ascending: false })

      const orders = orderItems?.reduce((acc, item) => {
        const orderId = item.orders.id
        if (!acc[orderId]) acc[orderId] = { ...item.orders, items: [] }
        acc[orderId].items.push(item)
        return acc
      }, {})

      setRecentOrders(Object.values(orders || {}).slice(0, 5))
      setStats({
        pending: Object.values(orders || {}).filter(o => o.status === 'paid').length,
        preparing: Object.values(orders || {}).filter(o => o.status === 'preparing').length,
        shipped: Object.values(orders || {}).filter(o => o.status === 'shipped').length,
        totalEarnings: payouts?.filter(p => p.is_paid).reduce((acc, p) => acc + p.amount, 0) || 0,
      })
    }
    load()
  }, [])

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '2px' }}>SUPPLIER DASHBOARD</h1>
          <p style={{ color: '#888', marginTop: '4px' }}>{supplier?.business_name}</p>
        </div>
        <button
          onClick={() => router.push('/supplier/orders')}
          style={{
            background: '#fff',
            color: '#000',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          VIEW ALL ORDERS
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '40px' }}>
        {[
          { label: 'New Orders', value: stats.pending, color: '#facc15' },
          { label: 'Preparing', value: stats.preparing, color: '#60a5fa' },
          { label: 'Shipped', value: stats.shipped, color: '#a78bfa' },
          { label: 'Earnings Paid', value: `KSh ${stats.totalEarnings.toLocaleString()}`, color: '#4ade80' },
        ].map(stat => (
          <div key={stat.label} style={{
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '20px',
            textAlign: 'center',
          }}>
            <p style={{ color: stat.color, fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
              {stat.value}
            </p>
            <p style={{ color: '#888', fontSize: '12px' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#888' }}>
        RECENT ORDERS
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {recentOrders.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No orders yet</p>
        ) : recentOrders.map(order => (
          <div key={order.id} style={{
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <p style={{ fontWeight: '600', marginBottom: '4px' }}>
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p style={{ color: '#888', fontSize: '13px' }}>
                {order.items.map(i => `${i.product_name} x${i.quantity}`).join(', ')}
              </p>
              <p style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>
                {order.delivery_address}
              </p>
            </div>
            <span style={{
              color: order.status === 'paid' ? '#facc15' :
                order.status === 'preparing' ? '#60a5fa' :
                order.status === 'shipped' ? '#a78bfa' : '#4ade80',
              fontWeight: '700',
              fontSize: '12px',
              textTransform: 'uppercase',
            }}>
              {order.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}