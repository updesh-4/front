const API_BASE = import.meta.env.VITE_API_URL || 'https://back-g0yq.onrender.com';

export async function fetchProducts() {
  const res = await fetch(`${API_BASE}/api/products`);
  return res.json();
}

export async function fetchCart(userId = 'demo-user') {
  const res = await fetch(`${API_BASE}/api/cart?userId=${userId}`);
  return res.json();
}

export async function addToCart(productId, qty = 1) {
  const res = await fetch(`${API_BASE}/api/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, qty }),
  });
  return res.json();
}

export async function removeCartItem(id) {
  const res = await fetch(`${API_BASE}/api/cart/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function checkout(payload) {
  const res = await fetch(`${API_BASE}/api/cart/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return res.json();
}
