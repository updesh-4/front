import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchCart, addToCart, removeCartItem, checkout } from './api';
import toast, { Toaster } from 'react-hot-toast';
import { FaShoppingCart } from 'react-icons/fa';

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [receipt, setReceipt] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const p = await fetchProducts();
      setProducts(p);
      const c = await fetchCart();
      setCart(c.cart || { items: [], subtotal: 0 });
    } catch (e) {
      console.error(e);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(id) {
    await addToCart(id, 1);
    const c = await fetchCart();
    setCart(c.cart);
    toast.success('Added to cart');
  }

  async function handleRemove(id) {
    await removeCartItem(id);
    const c = await fetchCart();
    setCart(c.cart);
    toast('Removed');
  }

  async function handleCheckout(form) {
    const res = await checkout({ cartItems: cart.items, name: form.name, email: form.email });
    if (res.receipt) {
      setReceipt(res.receipt);
      setCart({ items: [], subtotal: 0 });
      setShowCheckout(false);
      toast.success('Checkout complete!');
    } else {
      toast.error('Checkout failed');
    }
  }

  return (
    <div className="container mx-auto p-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3"><FaShoppingCart className="text-yellow-400"/> ShopVibeX</h1>
        <span className="text-lg font-medium text-gray-300">🛒 {cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
      </header>

      <main className="grid md:grid-cols-2 gap-10">
        <section>
          <h2 className="text-2xl mb-4 font-semibold">Products</h2>
          {loading && <div className="text-gray-400">Loading...</div>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white/10 p-4 rounded-xl text-center hover:scale-105 transition-shadow shadow-lg">
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="text-gray-300 mb-3">₹{p.price}</p>
                <button onClick={() => handleAdd(p.id)} className="bg-yellow-400 text-black px-3 py-1 rounded font-semibold hover:bg-yellow-300">Add to Cart</button>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-md p-5 rounded-xl">
          <h2 className="text-2xl mb-4 font-semibold">Your Cart</h2>
          {cart.items.length === 0 && <p className="text-gray-400">Cart is empty.</p>}
          <ul>
            {cart.items.map(it => (
              <li key={it._id} className="flex justify-between items-center border-b border-gray-700 py-2">
                <span>{it.name} × {it.qty}</span>
                <div>
                  ₹{it.price * it.qty}
                  <button onClick={() => handleRemove(it._id)} className="ml-3 text-red-400 hover:text-red-600 font-bold">✕</button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-bold">Total: ₹{cart.subtotal}</p>
          <button onClick={() => setShowCheckout(true)} disabled={cart.items.length === 0} className="mt-3 bg-brand hover:bg-brand-dark text-white px-4 py-2 rounded-lg font-semibold transition">Checkout</button>
        </section>
      </main>

      {showCheckout && <CheckoutModal onClose={() => setShowCheckout(false)} onSubmit={handleCheckout} />}
      {receipt && <Receipt receipt={receipt} onClose={() => setReceipt(null)} />}

      <Toaster position="bottom-right" />
    </div>
  );
}

function CheckoutModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  function submit(e) {
    e.preventDefault();
    onSubmit({ name, email });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <form onSubmit={submit} className="bg-white text-black p-6 rounded-lg w-80 space-y-4">
        <h3 className="text-xl font-bold">Checkout</h3>
        <input type="text" placeholder="Name" required value={name} onChange={e => setName(e.target.value)} className="border w-full p-2 rounded" />
        <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} className="border w-full p-2 rounded" />
        <div className="flex justify-between">
          <button type="submit" className="bg-brand text-white px-3 py-1 rounded">Confirm</button>
          <button type="button" onClick={onClose} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Receipt({ receipt, onClose }) {
  return (
    <div className="fixed bottom-4 right-4 bg-white text-black p-4 rounded-lg shadow-xl w-80">
      <h4 className="font-bold mb-2">Receipt</h4>
      <p>ID: {receipt.id}</p>
      <p>Name: {receipt.name}</p>
      <p>Email: {receipt.email}</p>
      <p>Total: ₹{receipt.total}</p>
      <p>Date: {new Date(receipt.timestamp).toLocaleString()}</p>
      <button onClick={onClose} className="mt-3 bg-brand text-white px-3 py-1 rounded">Close</button>
    </div>
  );
}
