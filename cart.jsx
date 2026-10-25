/* =========================================================
   ARIA — CART (React + Promises)
   Uses the same "ariaCart" localStorage data as the rest of the site
   ========================================================= */
const { useState, useEffect } = React;

const CART_KEY = 'ariaCart';
const FREE_SHIPPING_ABOVE = 5000;
const SHIPPING_FEE = 99;

const money = (n) => '₹' + Number(n).toLocaleString('en-IN');

/* ---------------------------------------------------------
   PROMISE 1: load the cart.
   Resolves with the saved items, rejects if the data is broken.
   (The short delay imitates a real server request.)
   --------------------------------------------------------- */
function loadCart() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(JSON.parse(localStorage.getItem(CART_KEY)) || []);
      } catch (error) {
        reject(error);
      }
    }, 400);
  });
}

/* ---------------------------------------------------------
   PROMISE 2: save the cart.
   --------------------------------------------------------- */
function saveCart(cart) {
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      resolve(cart);
    } catch (error) {
      reject(error);
    }
  });
}

/* ---------------------------------------------------------
   PROMISE 3: checkout.
   Rejects if the cart is empty, otherwise resolves after "processing".
   --------------------------------------------------------- */
function placeOrder(cart) {
  return new Promise((resolve, reject) => {
    if (cart.length === 0) {
      reject(new Error('Your cart is empty'));
      return;
    }
    setTimeout(() => resolve('Checkout coming soon'), 900);
  });
}

/* ---------- one row in the cart ---------- */
function CartItem({ item, onChange, onRemove }) {
  return (
    <article className="cart-item">
      <img className="cart-item__image" src={item.image} alt={item.name} />

      <div>
        <h3 className="cart-item__name">{item.name}</h3>
        <p className="cart-item__price">{money(item.price)}</p>

        <div className="cart-item__actions">
          <div className="cart-qty">
            <button type="button" aria-label="Decrease quantity"
                    onClick={() => onChange(item.id, -1)}>−</button>
            <span>{item.quantity}</span>
            <button type="button" aria-label="Increase quantity"
                    onClick={() => onChange(item.id, 1)}>+</button>
          </div>

          <button type="button" className="cart-remove"
                  onClick={() => onRemove(item.id)}>Remove</button>
        </div>
      </div>

      <div className="cart-item__total">{money(item.price * item.quantity)}</div>
    </article>
  );
}

/* ---------- order summary box ---------- */
function OrderSummary({ subtotal, shipping, total, onCheckout, processing }) {
  return (
    <aside className="cart-card cart-summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Order Summary</h2>

      <div className="cart-summary__row">
        <span>Subtotal</span>
        <span>{money(subtotal)}</span>
      </div>

      <div className="cart-summary__row">
        <span>Shipping</span>
        <span>{shipping === 0 ? 'FREE' : money(shipping)}</span>
      </div>

      <div className="cart-summary__divider"></div>

      <div className="cart-summary__total">
        <span>Total</span>
        <strong>{money(total)}</strong>
      </div>

      <p className="cart-summary__note">
        <strong>Free shipping</strong> on orders above {money(FREE_SHIPPING_ABOVE)}.
      </p>

      <button type="button" className="btn-gold cart-checkout-btn"
              onClick={onCheckout} disabled={processing}>
        {processing ? 'Processing…' : 'Proceed to Checkout'}
      </button>

      <a href="ethnic.html" className="btn-outline cart-continue">Continue Shopping</a>
    </aside>
  );
}

/* ---------- the whole page ---------- */
function App() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState('');

  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  /* load the cart once, when the page opens */
  useEffect(() => {
    loadCart()
      .then((items) => setCart(items))
      .catch(() => {
        setCart([]);
        setToast('Could not read your cart');
      })
      .finally(() => setLoading(false));
  }, []);

  /* save + update the navbar badge whenever the cart changes
     (skipped while loading, so an empty list never overwrites the saved cart) */
  useEffect(() => {
    if (loading) return;

    saveCart(cart)
      .catch(() => setToast('Could not save your cart'));

    const badge = document.getElementById('cartBadge');
    if (badge) {
      badge.textContent = count;
      badge.classList.toggle('is-visible', count > 0);
    }
  }, [cart, loading]);

  /* hide the toast after a moment */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 1400);
    return () => clearTimeout(t);
  }, [toast]);

  function changeQty(id, delta) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
    setToast('Cart updated');
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((i) => i.id !== id));
    setToast('Item removed');
  }

  function checkout() {
    setProcessing(true);

    placeOrder(cart)
      .then((message) => setToast(message))
      .catch((error) => setToast(error.message))
      .finally(() => setProcessing(false));
  }

  return (
    <>
      <main className="cart-page">
        <div className="cart-page__inner">

          <div className="cart-page__heading">
            <p className="cart-page__eyebrow">Your Selection</p>
            <h1 className="cart-page__title">Shopping Cart</h1>
            <p className="cart-page__subtitle">
              Review the pieces you've chosen before you continue.
            </p>
          </div>

          <div className="cart-layout">
            <section className="cart-card" aria-labelledby="cart-items-heading">
              <div className="cart-card__header">
                <h2 id="cart-items-heading">Your Items</h2>
                <span className="cart-count-text">
                  {count} {count === 1 ? 'item' : 'items'}
                </span>
              </div>

              {loading ? (
                <div className="cart-empty">
                  <p>Loading your cart…</p>
                </div>
              ) : cart.length > 0 ? (
                <div className="cart-items">
                  {cart.map((item) => (
                    <CartItem key={item.id} item={item}
                              onChange={changeQty} onRemove={removeItem} />
                  ))}
                </div>
              ) : (
                <div className="cart-empty">
                  <div className="cart-empty__icon">🛍</div>
                  <h3>Your cart is empty</h3>
                  <p>Add something beautiful from our collection.</p>
                  <a href="ethnic.html" className="btn-gold">Continue Shopping</a>
                </div>
              )}
            </section>

            <OrderSummary subtotal={subtotal} shipping={shipping} total={total}
                          onCheckout={checkout} processing={processing} />
          </div>

        </div>
      </main>

      <div className={'cart-toast' + (toast ? ' is-visible' : '')}>
        {toast || 'Cart updated'}
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);