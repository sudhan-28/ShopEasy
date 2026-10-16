import { useEffect, useMemo, useState } from 'react'
import { ShoppingBag, Search, Plus, Minus, X, ArrowRight, PackageCheck, Sparkles, Menu } from 'lucide-react'
import { createOrder, getCategories, getProducts } from './api'

const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0))

function App() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ customer_name: '', email: '', address: '' })

  useEffect(() => {
    let alive = true
    Promise.all([getProducts(), getCategories()])
      .then(([p, c]) => { if (alive) { setProducts(p); setCategories(c); setError('') } })
      .catch((e) => { if (alive) setError(e.message) })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    const timer = toast ? setTimeout(() => setToast(''), 3600) : undefined
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    let alive = true
    getProducts({ search, category })
      .then((data) => { if (alive) { setProducts(data); setError('') } })
      .catch((e) => { if (alive) setError(e.message) })
    return () => { alive = false }
  }, [search, category])

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  const featured = useMemo(() => products.filter(p => p.featured), [products])

  function addToCart(product) {
    if (product.stock < 1) { setToast('This product is currently out of stock.'); return }
    setCart(current => {
      const found = current.find(item => item.id === product.id)
      if (found) return current.map(item => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item)
      return [...current, { ...product, quantity: 1 }]
    })
    setToast(`${product.name} added to your bag`)
  }

  function changeQuantity(id, delta) {
    setCart(current => current.map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0))
  }

  async function submitOrder(event) {
    event.preventDefault()
    if (!cart.length) return
    setSubmitting(true)
    try {
      const order = await createOrder({
        ...form,
        items: cart.map(item => ({ product_id: item.id, quantity: item.quantity })),
      })
      setCart([])
      setCheckoutOpen(false)
      setCartOpen(false)
      setForm({ customer_name: '', email: '', address: '' })
      setToast(`Order #${order.id} placed successfully! No payment was collected.`)
      const fresh = await getProducts({ search, category })
      setProducts(fresh)
    } catch (e) {
      setToast(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <div className="announcement"><Sparkles size={14} /> Thoughtful finds for everyday living <span>—</span> Free shipping on demo orders</div>
      <header className="site-header">
        <a className="brand" href="#" aria-label="ShopEase home"><span className="brand-mark">s.</span><span>shop<span className="brand-light">ease</span></span></a>
        <nav className="desktop-nav"><a href="#shop">Shop all</a><a href="#featured">Featured</a><a href="#story">Our story</a></nav>
        <div className="header-actions">
          <label className="header-search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find something..." aria-label="Search products"/></label>
          <button className="bag-button" onClick={() => setCartOpen(true)} aria-label="Open shopping bag"><ShoppingBag size={19}/><span>Bag</span><b>{cartCount}</b></button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-dot"/> THE EVERYDAY EDIT</span>
            <h1>Little things.<br/><em>Better days.</em></h1>
            <p>Useful, well-designed essentials that make the everyday feel a little more special.</p>
            <a className="primary-button" href="#shop">Explore the collection <ArrowRight size={17}/></a>
            <div className="hero-footnote"><span className="avatar-stack"><i>✦</i><i>●</i><i>✿</i></span><span>Loved for the little details</span></div>
          </div>
          <div className="hero-art">
            <div className="hero-image-wrap"><img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1300&q=85" alt="Carefully styled everyday fashion essentials"/></div>
            <div className="floating-note"><span className="note-icon">✳</span><span><b>Made for daily life</b><small>Simple things, chosen well.</small></span></div>
            <div className="hero-stamp">THE<br/>GOOD<br/>STUFF <span>↘</span></div>
          </div>
        </section>

        <section className="benefits">
          <div><span>✳</span><p><b>Thoughtfully selected</b><small>Useful, not ordinary</small></p></div>
          <div><span>↗</span><p><b>Easy everyday style</b><small>Made to fit your life</small></p></div>
          <div><span>♡</span><p><b>Shopping made simple</b><small>Less fuss, more good stuff</small></p></div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading"><div><span className="eyebrow">YOUR NEXT FAVOURITE</span><h2>Shop the collection<span className="heading-period">.</span></h2></div><span className="product-count">{products.length} products</span></div>
          <div className="filters">
            <div className="category-tabs"><button className={category === 'All' ? 'active' : ''} onClick={() => setCategory('All')}>All items</button>{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div>
            <label className="mobile-search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products"/></label>
          </div>
          {error && <div className="error-panel"><b>Can't connect to the shop API.</b><span>{error}</span><small>Start the Django backend, then refresh this page.</small></div>}
          {loading ? <div className="loading-state">Gathering good things<span>···</span></div> : (
            <div className="product-grid">
              {products.map((product, index) => <article className="product-card" key={product.id}>
                <div className="product-image">
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'} alt={product.name} loading="lazy"/>
                  {product.featured && <span className="product-tag">BESTSELLER</span>}
                  <button className="quick-add" onClick={() => addToCart(product)} disabled={product.stock < 1} aria-label={`Add ${product.name} to bag`}><Plus size={19}/></button>
                </div>
                <div className="product-info"><div><span className="product-category">{product.category}</span><h3>{product.name}</h3></div><b className="price">{money(product.price)}</b></div>
                <p className="product-description">{product.description}</p>
                <div className="stock-note">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</div>
              </article>)}
            </div>
          )}
          {!loading && !error && products.length === 0 && <div className="empty-state">No products found. Try another search or category.</div>}
        </section>

        <section className="featured-banner" id="featured">
          <div className="banner-image"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85" alt="Warm, curated retail space"/></div>
          <div className="banner-copy"><span className="eyebrow">A LITTLE LESS, A LITTLE BETTER</span><h2>Keep the good.<br/><em>Skip the noise.</em></h2><p>We believe the best everyday items are the ones you reach for again and again.</p><a href="#shop" className="text-link">Find your everyday essential <ArrowRight size={16}/></a></div>
        </section>

        <section className="story-strip" id="story"><span className="story-symbol">s.</span><p>Good design should feel easy. That's the idea behind every item in our little corner of the internet.</p><span className="story-signoff">THE SHAPE OF EVERYDAY</span></section>
      </main>

      <footer className="footer"><a className="brand" href="#"><span className="brand-mark">s.</span><span>shop<span className="brand-light">ease</span></span></a><span>Small joys, thoughtfully found.</span><span>© 2026 ShopEase</span></footer>

      {cartOpen && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setCartOpen(false) }}>
        <aside className="side-panel">
          <div className="panel-heading"><div><span className="eyebrow">YOUR SELECTION</span><h2>Your bag <span>({cartCount})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag"><X/></button></div>
          {cart.length === 0 ? <div className="cart-empty"><ShoppingBag size={36}/><h3>Your bag is taking a break.</h3><p>Add something lovely to get started.</p><button className="primary-button" onClick={() => setCartOpen(false)}>Continue shopping <ArrowRight size={16}/></button></div> :
            <><div className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><img src={item.image_url} alt={item.name}/><div className="cart-item-info"><span className="product-category">{item.category}</span><b>{item.name}</b><span>{money(item.price)}</span><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)} aria-label="Decrease quantity"><Minus size={13}/></button><span>{item.quantity}</span><button disabled={item.quantity >= item.stock} onClick={() => changeQuantity(item.id, 1)} aria-label="Increase quantity"><Plus size={13}/></button></div></div><button className="remove-item" onClick={() => setCart(items => items.filter(i => i.id !== item.id))} aria-label={`Remove ${item.name}`}><X size={16}/></button></div>)}</div><div className="cart-bottom"><div className="subtotal"><span>Subtotal</span><b>{money(total)}</b></div><p>Shipping and taxes are not calculated in this demo.</p><button className="primary-button full-button" onClick={() => { setCartOpen(false); setCheckoutOpen(true) }}>Continue to checkout <ArrowRight size={17}/></button><small className="no-payment"><PackageCheck size={14}/> Demo checkout · No payment required</small></div></>}
        </aside>
      </div>}

      {checkoutOpen && <div className="overlay checkout-overlay" onMouseDown={e => { if (e.target === e.currentTarget) setCheckoutOpen(false) }}><section className="checkout-modal">
        <div className="panel-heading"><div><span className="eyebrow">ALMOST YOURS</span><h2>Checkout</h2></div><button className="icon-button" onClick={() => setCheckoutOpen(false)} aria-label="Close checkout"><X/></button></div>
        <p className="checkout-intro">Enter your delivery details to place this demo order. No payment will be taken.</p>
        <form onSubmit={submitOrder} className="checkout-form">
          <label>Full name<input required maxLength="120" value={form.customer_name} onChange={e => setForm({...form, customer_name:e.target.value})} placeholder="Your name"/></label>
          <label>Email address<input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})} placeholder="you@example.com"/></label>
          <label>Delivery address<textarea required maxLength="1000" rows="3" value={form.address} onChange={e => setForm({...form, address:e.target.value})} placeholder="Street, city, PIN code"/></label>
          <div className="checkout-total"><span>Order total</span><b>{money(total)}</b></div>
          <button className="primary-button full-button" disabled={submitting}>{submitting ? 'Placing order…' : 'Place demo order'} <ArrowRight size={17}/></button>
        </form>
      </section></div>}

      {toast && <div className="toast" role="status"><span className="toast-check">✓</span>{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={15}/></button></div>}
    </div>
  )
}

export default App
