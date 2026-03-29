'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'

export default function ProductPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  function addToCart() {
    const cart = JSON.parse(localStorage.getItem('genuine_cart') || '[]')
    const existing = cart.find(item => item.id === product.id)
    if (existing) {
      existing.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }
    localStorage.setItem('genuine_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '100px', color: '#555' }}>
      Loading...
    </div>
  )

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '100px', color: '#555' }}>
      Product not found
    </div>
  )

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <button
        onClick={() => router.back()}
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
        ← Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
        {/* Image */}
        <div style={{
          background: '#111',
          borderRadius: '12px',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ color: '#333' }}>No image</span>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>{product.name}</h1>
          <p style={{ color: '#888', lineHeight: '1.7' }}>{product.description}</p>
          <div style={{ fontSize: '32px', fontWeight: '900' }}>
            KSh {product.retail_price?.toLocaleString()}
          </div>
          <div style={{ color: '#555', fontSize: '14px' }}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </div>

          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            style={{
              background: added ? '#333' : '#fff',
              color: added ? '#fff' : '#000',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '1px',
            }}
          >
            {added ? '✓ ADDED TO CART' : 'ADD TO CART'}
          </button>

          <button
            onClick={() => { addToCart(); router.push('/cart') }}
            disabled={product.stock === 0}
            style={{
              background: 'none',
              color: '#fff',
              border: '1px solid #fff',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              letterSpacing: '1px',
            }}
          >
            BUY NOW
          </button>
        </div>
      </div>
    </div>
  )
}