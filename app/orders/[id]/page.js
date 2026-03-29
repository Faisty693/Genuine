'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

export default function OrderPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      const supabase = createClient()

      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id)

      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', id)
        .single()

      setOrder(orderData)
      setItems(itemsData || [])
      setPayment(paymentData)
      setLoading(false)
    }

    fetchOrder()
  }, [id])

  const statusColors = {
    pending: '#888',
    paid: '#4ade80',
    preparing: '#facc15',
    shipped: '#60a5fa',
    delivered: '#4ade80',
    cancelled: '#f87171',
  }

  const statusSteps = ['pending', 'paid', 'preparing', 'shipped', 'delivered']

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px', color: '#555' }}>
      Loading...
    </div>
  )

  if (!order) return (
    <div style={{ textAlign: 'center', padding: '100px', color: '#555' }}>
      Order not found
    </div>
  )

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
      <button
        onClick={() => router.push('/')}
        style={{
          background: 'none',
          border: '1px solid #333',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '40px',
        }}
      >
        ← Continue Shopping
      </button>

      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px', letterSpacing: '2px' }}>
        ORDER DETAILS
      </h1>
      <p style={{ color: '#555', fontSize: '13px', marginBottom: '40px' }}>
        #{order.id.slice(0, 8).toUpperCase()}
      </p>

      {/* Status */}
      <div style={{
        border: '1px solid #222',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ color: '#888', fontSize: '14px' }}>STATUS</span>
          <span style={{
            color: statusColors[order.status] || '#fff',
            fontWeight: '700',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            {order.status}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {statusSteps.map((step, index) => (
            <div key={step} style={{ flex: 1 }}>
              <div style={{
                height: '4px',
                borderRadius: '2px',
                background: statusSteps.indexOf(order.status) >= index ? '#fff' : '#222',
                transition: 'background 0.3s',
              }} />
              <p style={{
                fontSize: '9px',
                color: statusSteps.indexOf(order.status) >= index ? '#fff' : '#444',
                marginTop: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      {payment && (
        <div style={{
          border: '1px solid #222',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '14px', color: '#888', marginBottom: '16px' }}>PAYMENT</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#888' }}>Status</span>
            <span style={{ color: payment.status === 'completed' ? '#4ade80' : '#facc15' }}>
              {payment.status.toUpperCase()}
            </span>
          </div>
          {payment.mpesa_code && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#888' }}>M-Pesa Code</span>
              <span style={{ fontWeight: '700' }}>{payment.mpesa_code}</span>
            </div>
          )}
        </div>
      )}

      {/* Order Items */}
      <div style={{
        border: '1px solid #222',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontSize: '14px', color: '#888', marginBottom: '16px' }}>ITEMS</h2>
        {items.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px',
            fontSize: '14px',
          }}>
            <span>{item.product_name} x{item.quantity}</span>
            <span>KSh {(item.price_at_purchase * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div style={{
          borderTop: '1px solid #222',
          marginTop: '16px',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: '800',
        }}>
          <span>Total</span>
          <span>KSh {order.total.toLocaleString()}</span>
        </div>
      </div>

      {/* Delivery Info */}
      <div style={{
        border: '1px solid #222',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h2 style={{ fontSize: '14px', color: '#888', marginBottom: '16px' }}>DELIVERY</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ color: '#888' }}>Name</span>
          <span>{order.customer_name}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#888' }}>Address</span>
          <span style={{ textAlign: 'right', maxWidth: '60%' }}>{order.delivery_address}</span>
        </div>
      </div>
    </div>
  )
}