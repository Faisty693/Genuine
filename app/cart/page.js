'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const [cart, setCart] = useState([])
  const router = useRouter()

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('genuine_cart') || '[]')
    setCart(stored)
  }, [])

  function updateQuantity(id, quantity) {
    const updated = cart.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    )
    setCart(updated)
    localStorage.setItem('genuine_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  function removeItem(id) {
    const updated = cart.filter(item => item.id !== id)
    setCart(updated)
    localStorage.setItem('genuine_cart', JSON.stringify(updated))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const total = cart.reduce((acc, item) => acc + item.retail_price * item.quantity, 0)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '40px', letterSpacing: '2px' }}>
        YOUR CART
      </h1>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>
          <p style={{ fontSize: '18px', marginBottom: '24px' }}>Your cart is empty</p>
          <button
            onClick={() => router.push('/')}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            SHOP NOW
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            {cart.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                border: '1px solid #222',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: '#111',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}>
                  {item.images && item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : null}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', marginBottom: '4px' }}>{item.name}</p>
                  <p style={{ color: '#888', fontSize: '14px' }}>
                    KSh {item.retail_price?.toLocaleString()}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    style={{
                      background: '#111',
                      border: '1px solid #333',
                      color: '#fff',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '18px',
                    }}
                  >-</button>
                  <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    style={{
                      background: '#111',
                      border: '1px solid #333',
                      color: '#fff',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '18px',
                    }}
                  >+</button>
                </div>

                <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: '700' }}>
                  KSh {(item.retail_price * item.quantity).toLocaleString()}
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#555',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >✕</button>
              </div>
            ))}
          </div>

          <div style={{
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontSize: '18px', color: '#888' }}>Total</span>
              <span style={{ fontSize: '24px', fontWeight: '900' }}>
                KSh {total.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => router.push('/checkout')}
              style={{
                width: '100%',
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                letterSpacing: '1px',
              }}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      )}
    </div>
  )
}