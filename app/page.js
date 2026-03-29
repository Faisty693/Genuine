'use client'
import { useEffect, useState } from 'react'
import { createClient } from '../lib/supabase/client'
import Link from 'next/link'

const CATEGORIES = [
  { label: 'All', keywords: [] },
  { label: 'T-Shirts', keywords: ['t-shirt', 'tshirt', 't shirt'] },
  { label: 'Trousers', keywords: ['trouser'] },
  { label: 'Khaki Trousers', keywords: ['khaki'] },
  { label: 'Jeans', keywords: ['jean'] },
  { label: 'Sweatpants', keywords: ['sweatpant', 'sweat pant'] },
  { label: 'Shoes', keywords: ['shoe', 'sneaker', 'boot', 'sandal'] },
  { label: 'Belts', keywords: ['belt'] },
  { label: 'Hoodies', keywords: ['hoodie', 'hoody'] },
  { label: 'Jackets', keywords: ['jacket'] },
  { label: 'Full Outfits', keywords: ['outfit', 'set', 'full'] },
  { label: 'Home Appliances', keywords: ['appliance', 'blender', 'iron', 'kettle', 'toaster', 'microwave', 'fridge', 'cooker', 'fan', 'tv', 'television', 'vacuum', 'washer'] },
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchProducts() {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (data) setProducts(data)
    }
    fetchProducts()
  }, [])

  const categoryFiltered = activeTab === 'All'
    ? products
    : products.filter(p => {
        const name = (p.name || '').toLowerCase()
        const desc = (p.description || '').toLowerCase()
        const keywords = CATEGORIES.find(c => c.label === activeTab)?.keywords || []
        return keywords.some(kw => name.includes(kw) || desc.includes(kw))
      })

  const filteredProducts = search.trim() === ''
    ? categoryFiltered
    : categoryFiltered.filter(p => {
        const q = search.toLowerCase()
        return (p.name || '').toLowerCase().includes(q) ||
               (p.description || '').toLowerCase().includes(q)
      })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

      {/* Hero */}
      <div style={{
        textAlign: 'center',
        padding: '60px 20px 40px',
        borderBottom: '1px solid #222',
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: '900', letterSpacing: '8px', marginBottom: '16px' }}>
          GENUINE
        </h1>
        <p style={{ color: '#888', fontSize: '16px', letterSpacing: '2px', marginBottom: '32px' }}>
          QUALITY YOU CAN TRUST
        </p>

        {/* Search Bar */}
        <div style={{
          maxWidth: '520px',
          margin: '0 auto',
          position: 'relative',
        }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '16px',
            color: '#c084fc',
          }}>🔍</span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              width: '100%',
              padding: '14px 16px 14px 44px',
              borderRadius: '50px',
              border: '1.5px solid #7c3aed',
              background: '#0d0d1a',
              color: '#e9d5ff',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 0 12px rgba(124, 58, 237, 0.3)',
              transition: 'box-shadow 0.2s',
            }}
            onFocus={e => e.target.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.6)'}
            onBlur={e => e.target.style.boxShadow = '0 0 12px rgba(124, 58, 237, 0.3)'}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        padding: '24px 24px 0',
        marginBottom: '32px',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => setActiveTab(cat.label)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: activeTab === cat.label ? 'none' : '1px solid #333',
              background: activeTab === cat.label ? '#7c3aed' : 'transparent',
              color: activeTab === cat.label ? '#fff' : '#888',
              fontSize: '13px',
              fontWeight: activeTab === cat.label ? '700' : '400',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              transition: 'all 0.2s',
              boxShadow: activeTab === cat.label ? '0 0 10px rgba(124,58,237,0.4)' : 'none',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products */}
      <div style={{ padding: '0 24px 40px' }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#555', padding: '80px 0' }}>
            <p style={{ fontSize: '18px' }}>
              {search ? `No results for "${search}"` : activeTab === 'All' ? 'Products coming soon...' : `No ${activeTab} available yet.`}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {filteredProducts.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                  style={{ border: '1px solid #222', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#222'}
                >
                  <div style={{ width: '100%', height: '260px', background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ color: '#333', fontSize: '14px' }}>No image</span>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{product.name}</h3>
                    <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px', lineHeight: '1.5' }}>
                      {product.description?.substring(0, 80)}...
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: '700' }}>KSh {product.retail_price?.toLocaleString()}</span>
                      <span style={{ background: '#7c3aed', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>VIEW</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}