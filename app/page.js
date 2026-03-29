import { createClient } from '../lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        marginBottom: '60px',
        borderBottom: '1px solid #222',
      }}>
        <h1 style={{
          fontSize: '48px',
          fontWeight: '900',
          letterSpacing: '8px',
          marginBottom: '16px',
        }}>
          GENUINE
        </h1>
        <p style={{ color: '#888', fontSize: '16px', letterSpacing: '2px' }}>
          QUALITY YOU CAN TRUST
        </p>
      </div>

      {/* Products */}
      {!products || products.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#555', padding: '80px 0' }}>
          <p style={{ fontSize: '18px' }}>Products coming soon...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {products.map(product => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{
                border: '1px solid #222',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
                cursor: 'pointer',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
              >
                {/* Product Image */}
                <div style={{
                  width: '100%',
                  height: '260px',
                  background: '#111',
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
                    <span style={{ color: '#333', fontSize: '14px' }}>No image</span>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    {product.name}
                  </h3>
                  <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' }}>
                    {product.description?.substring(0, 80)}...
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: '700' }}>
                      KSh {product.retail_price?.toLocaleString()}
                    </span>
                    <span style={{
                      background: '#fff',
                      color: '#000',
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                    }}>
                      VIEW
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}