'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

export default function SupplierOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [supplier, setSupplier] = useState(null)
  const [updating, setUpdating] = useState(null)
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

      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, orders(id, status, customer_name, delivery_address, created_at)')
        .eq('supplier_id', supplierData.id)
        .order('created_at', { ascending: false })

      const grouped = orderItems?.reduce((acc, item) => {
        const orderId = item.orders.id
        if (!acc[orderId]) acc[orderId] = { ...item.orders, items: [] }
        acc[orderId].items.push(item)
        return acc
      }, {})

      setOrders(Object.values(grouped || {}))
      setLoading(false)
    }
    load()
  }, [])

  async function updateStatus(orderId, newStatus) {
    setUpdating(orderId)
    const supabase = createClient()
    await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    ))
    setUpdating(null)
  }

  const statusOptions = {
    paid: ['preparing'],
    preparing: ['shipped'],
    shipped: ['delivered'],
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
        <button
          onClick={() => router.push('/supplier')}
          style={{
            background: 'none',
            border: '1px solid #333',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >← Back</button>
        <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '2px' }}>ALL ORDERS</h1>
      </div>

      {loading ? (
        <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>Loading...</p>
      ) : orders.length === 0 ? (
        <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No orders yet</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map(order => (
            <div key={order.id} style={{
              border: '1px solid #222',
              borderRadius: '12px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p style={{ color: '#555', fontSize: '12px' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span style={{
                  color: order.status === 'paid' ? '#facc15' :
                    order.status === 'preparing' ? '#60a5fa' :
                    order.status === 'shipped' ? '#a78bfa' : '#4ade80',
                  fontWeight: '700',
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  border: '1px solid #333',
                  padding: '4px 12px',
                  borderRadius: '20px',
                }}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div style={{ background: '#111', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>ITEMS TO PREPARE</p>
                {order.items.map(item => (
                  <p key={item.id} style={{ fontSize: '14px', marginBottom: '4px' }}>
                    • {item.product_name} × {item.quantity}
                  </p>
                ))}
              </div>

              {/* Delivery */}
              <div style={{ background: '#111', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <p style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>DELIVERY DETAILS</p>
                <p style={{ fontSize: '14px', marginBottom: '4px' }}>
                  <span style={{ color: '#888' }}>Customer: </span>{order.customer_name}
                </p>
                <p style={{ fontSize: '14px' }}>
                  <span style={{ color: '#888' }}>Address: </span>{order.delivery_address}
                </p>
              </div>

              {/* Update Status */}
              {statusOptions[order.status] && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {statusOptions[order.status].map(nextStatus => (
                    <button
                      key={nextStatus}
                      onClick={() => updateStatus(order.id, nextStatus)}
                      disabled={updating === order.id}
                      style={{
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      {updating === order.id ? 'Updating...' : `Mark as ${nextStatus}`}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}