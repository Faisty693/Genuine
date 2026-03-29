'use client'
import Link from 'next/link'
import Logo from './Logo'
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('genuine_cart') || '[]')
    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0))

    const handleStorage = () => {
      const cart = JSON.parse(localStorage.getItem('genuine_cart') || '[]')
      setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0))
    }
    window.addEventListener('cartUpdated', handleStorage)

    async function getUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
        setRole(data?.role)
      }
    }
    getUser()

    return () => window.removeEventListener('cartUpdated', handleStorage)
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    setShowMenu(false)
    window.location.href = '/'
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: '#000', borderBottom: '1px solid #222',
      padding: '0 24px', height: '64px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <Logo size={36} />
        <span style={{ color: '#fff', fontSize: '20px', fontWeight: '700', letterSpacing: '2px' }}>GENUINE</span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link href="/cart" style={{ color: '#fff', textDecoration: 'none', position: 'relative' }}>
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: '-8px', right: '-8px',
              background: '#fff', color: '#000', borderRadius: '50%',
              width: '18px', height: '18px', fontSize: '11px', fontWeight: '700',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{cartCount}</span>
          )}
        </Link>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            <User size={22} />
          </button>

          {showMenu && (
            <div style={{
              position: 'absolute', top: '40px', right: 0,
              background: '#111', border: '1px solid #222',
              borderRadius: '12px', padding: '8px', minWidth: '180px', zIndex: 200,
            }}>
              {user ? (
                <>
                  <p style={{ color: '#888', fontSize: '12px', padding: '8px 12px', borderBottom: '1px solid #222', marginBottom: '8px' }}>
                    {user.email}
                  </p>
                  {(role === 'admin' || role === 'supplier') && (
                    <button
                      onClick={() => { setShowMenu(false); router.push(role === 'admin' ? '/admin' : '/supplier') }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: '#fff', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
                    >
                      <LayoutDashboard size={16} /> Dashboard
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', background: 'none', border: 'none', color: '#f87171', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setShowMenu(false); router.push('/login') }}
                    style={{ display: 'block', width: '100%', background: '#fff', border: 'none', color: '#000', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); router.push('/signup') }}
                    style={{ display: 'block', width: '100%', background: 'none', border: '1px solid #333', color: '#fff', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}