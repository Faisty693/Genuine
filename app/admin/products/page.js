'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', description: '', supplier_price: '',
    retail_price: '', stock: '', supplier_id: '', image_url: '',
  })
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (userData?.role !== 'admin') return router.push('/')

      const { data: p } = await supabase.from('products').select('*, suppliers(business_name)').order('created_at', { ascending: false })
      const { data: s } = await supabase.from('suppliers').select('*')
      setProducts(p || [])
      setSuppliers(s || [])
    }
    load()
  }, [])

  async function handleSubmit() {
    if (!form.name || !form.supplier_price || !form.retail_price) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('products').insert({
      name: form.name,
      description: form.description,
      supplier_price: parseFloat(form.supplier_price),
      retail_price: parseFloat(form.retail_price),
      stock: parseInt(form.stock) || 0,
      supplier_id: form.supplier_id || null,
      images: form.image_url ? [form.image_url] : [],
      is_active: true,
    })
    const { data: p } = await createClient().from('products').select('*, suppliers(business_name)').order('created_at', { ascending: false })
    setProducts(p || [])
    setForm({ name: '', description: '', supplier_price: '', retail_price: '', stock: '', supplier_id: '', image_url: '' })
    setShowForm(false)
    setLoading(false)
  }

  async function toggleActive(id, current) {
    const supabase = createClient()
    await supabase.from('products').update({ is_active: !current }).eq('id', id)
    setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p))
  }

  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #333',
    color: '#fff', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', outline: 'none',
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.push('/admin')} style={{ background: 'none', border: '1px solid #333', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>← Back</button>
          <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px' }}>PRODUCTS</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
          {showForm ? 'CANCEL' : '+ ADD PRODUCT'}
        </button>
      </div>

      {showForm && (
        <div style={{ border: '1px solid #333', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', color: '#888' }}>NEW PRODUCT</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {[
              { key: 'name', placeholder: 'Product Name' },
              { key: 'image_url', placeholder: 'Image URL' },
              { key: 'supplier_price', placeholder: 'Supplier Price (KSh)' },
              { key: 'retail_price', placeholder: 'Retail Price (KSh)' },
              { key: 'stock', placeholder: 'Stock Quantity' },
            ].map(field => (
              <input
                key={field.key}
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                style={inputStyle}
              />
            ))}
            <select
              value={form.supplier_id}
              onChange={e => setForm({ ...form, supplier_id: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.business_name}</option>)}
            </select>
          </div>
          <textarea
            placeholder="Product Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            style={{ ...inputStyle, marginTop: '16px', resize: 'none' }}
          />
          <div style={{ marginTop: '8px', padding: '8px', background: '#111', borderRadius: '8px', fontSize: '12px', color: '#4ade80' }}>
            💰 Your profit per item: KSh {(parseFloat(form.retail_price || 0) - parseFloat(form.supplier_price || 0)).toLocaleString()}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ marginTop: '16px', background: '#fff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
          >
            {loading ? 'SAVING...' : 'SAVE PRODUCT'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {products.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', padding: '40px' }}>No products yet</p>
        ) : products.map(product => (
          <div key={product.id} style={{ border: '1px solid #222', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ width: '60px', height: '60px', background: '#111', borderRadius: '8px', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{product.name}</p>
                <p style={{ color: '#888', fontSize: '12px' }}>{product.suppliers?.business_name || 'No supplier'}</p>
                <p style={{ color: '#555', fontSize: '12px' }}>Stock: {product.stock}</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontWeight: '700', marginBottom: '4px' }}>KSh {product.retail_price?.toLocaleString()}</p>
              <p style={{ color: '#4ade80', fontSize: '12px', marginBottom: '8px' }}>
                Profit: KSh {(product.retail_price - product.supplier_price).toLocaleString()}
              </p>
              <button
                onClick={() => toggleActive(product.id, product.is_active)}
                style={{ background: product.is_active ? '#222' : '#fff', color: product.is_active ? '#888' : '#000', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '12px' }}
              >
                {product.is_active ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}