'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'

const DELIVERY_RATES = {
  'Nairobi': 0,
  'Mombasa': 250,
  'Kisumu': 200,
  'Nakuru': 150,
}

const TOWNS = Object.keys(DELIVERY_RATES)

export default function CheckoutPage() {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedTown, setSelectedTown] = useState('')
  const [deliveryFee, setDeliveryFee] = useState(null)
  const [supplierCities, setSupplierCities] = useState([])
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: '',
  })
  const router = useRouter()

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('genuine_cart') || '[]')
    if (stored.length === 0) router.push('/cart')
    setCart(stored)
  }, [])

  useEffect(() => {
    async function fetchSupplierCities() {
      if (cart.length === 0) return
      const supabase = createClient()
      const supplierIds = [...new Set(cart.map(item => item.supplier_id).filter(Boolean))]
      if (supplierIds.length === 0) return
      const { data } = await supabase
        .from('suppliers')
        .select('id, city')
        .in('id', supplierIds)
      if (data) setSupplierCities(data)
    }
    fetchSupplierCities()
  }, [cart])

  useEffect(() => {
    if (!selectedTown) {
      setDeliveryFee(null)
      return
    }
    const allSuppliersInTown = supplierCities.length > 0 &&
      supplierCities.every(s => s.city?.toLowerCase() === selectedTown.toLowerCase())

    if (allSuppliersInTown) {
      setDeliveryFee(0)
    } else {
      setDeliveryFee(DELIVERY_RATES[selectedTown] ?? 0)
    }
  }, [selectedTown, supplierCities])

  const subtotal = cart.reduce((acc, item) => acc + item.retail_price * item.quantity, 0)
  const total = subtotal + (deliveryFee ?? 0)

  async function handleCheckout() {
    if (!form.full_name || !form.phone || !form.address) {
      setMessage('Please fill in all fields')
      return
    }
    if (!selectedTown) {
      setMessage('Please select your delivery town')
      return
    }

    setLoading(true)
    setMessage('Creating your order...')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user?.id || null,
          customer_name: form.full_name,
          delivery_address: `${form.address}, ${selectedTown}`,
          status: 'pending',
          total: total,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price_at_purchase: item.retail_price,
        supplier_id: item.supplier_id,
      }))

      await supabase.from('order_items').insert(orderItems)

      const { data: payment } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          phone: form.phone,
          amount: total,
          status: 'pending',
        })
        .select()
        .single()

      setMessage('Sending M-Pesa prompt to your phone...')

      const response = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: form.phone,
          amount: total,
          orderId: order.id,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await supabase
          .from('payments')
          .update({ checkout_request_id: result.checkoutRequestId })
          .eq('id', payment.id)

        localStorage.removeItem('genuine_cart')
        window.dispatchEvent(new Event('cartUpdated'))

        setMessage('✓ M-Pesa prompt sent! Check your phone and enter your PIN.')

        setTimeout(() => {
          router.push(`/orders/${order.id}`)
        }, 3000)
      } else {
        setMessage('Payment failed: ' + result.message)
        setLoading(false)
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '40px', letterSpacing: '2px' }}>
        CHECKOUT
      </h1>

      {/* Order Summary */}
      <div style={{ border: '1px solid #222', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#888' }}>
          ORDER SUMMARY
        </h2>
        <p style={{ fontSize: '12px', color: '#4ade80', marginBottom: '12px' }}>
          🕐 Estimated delivery: 1 day
        </p>

        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
            <span>{item.name} x{item.quantity}</span>
            <span>KSh {(item.retail_price * item.quantity).toLocaleString()}</span>
          </div>
        ))}

        {selectedTown && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '14px', color: deliveryFee === 0 ? '#4ade80' : '#fff' }}>
            <span>Delivery ({selectedTown})</span>
            <span>{deliveryFee === 0 ? 'FREE' : `KSh ${deliveryFee.toLocaleString()}`}</span>
          </div>
        )}

        <div style={{ borderTop: '1px solid #222', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px' }}>
          <span>Total</span>
          <span>KSh {total.toLocaleString()}</span>
        </div>

        {selectedTown && deliveryFee === 0 && (
          <p style={{ fontSize: '12px', color: '#4ade80', marginTop: '8px' }}>
            ✓ Free delivery — supplier is in {selectedTown}
          </p>
        )}
        {selectedTown && deliveryFee !== null && deliveryFee > 0 && (
          <p style={{ fontSize: '12px', color: '#888', marginTop: '8px' }}>
            * Delivery charges apply for orders outside the supplier's town
          </p>
        )}
      </div>

      {/* Form Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '13px' }}>FULL NAME</label>
          <input
            type="text"
            value={form.full_name}
            onChange={e => setForm({ ...form, full_name: e.target.value })}
            placeholder="John Doe"
            style={{ width: '100%', background: '#111', border: '1px solid #333', color: '#fff', padding: '12px 16px', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '13px' }}>M-PESA PHONE NUMBER</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="0712345678"
            style={{ width: '100%', background: '#111', border: '1px solid #333', color: '#fff', padding: '12px 16px', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '13px' }}>DELIVERY TOWN</label>
          <select
            value={selectedTown}
            onChange={e => setSelectedTown(e.target.value)}
            style={{ width: '100%', background: '#111', border: '1px solid #333', color: selectedTown ? '#fff' : '#555', padding: '12px 16px', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
          >
            <option value="">Select your town...</option>
            {TOWNS.map(town => (
              <option key={town} value={town}>{town}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '13px' }}>DELIVERY ADDRESS</label>
          <textarea
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            placeholder="Street, Area"
            rows={3}
            style={{ width: '100%', background: '#111', border: '1px solid #333', color: '#fff', padding: '12px 16px', borderRadius: '8px', fontSize: '15px', outline: 'none', resize: 'none' }}
          />
        </div>
      </div>

      {message && (
        <div style={{ background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', color: message.includes('✓') ? '#4ade80' : '#fff', fontSize: '14px' }}>
          {message}
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={loading || !selectedTown}
        style={{
          width: '100%',
          background: loading || !selectedTown ? '#333' : '#7c3aed',
          color: loading || !selectedTown ? '#888' : '#fff',
          border: 'none',
          padding: '16px',
          borderRadius: '12px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: loading || !selectedTown ? 'not-allowed' : 'pointer',
          letterSpacing: '1px',
        }}
      >
        {loading ? 'PROCESSING...' : `PAY KSh ${total.toLocaleString()} VIA M-PESA`}
      </button>
    </div>
  )
}