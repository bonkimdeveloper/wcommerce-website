"use client";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

export const dynamic = "force-dynamic";

export default function Checkout() {
  // Fallback ভ্যালু দেওয়া হলো, যাতে কনটেক্সট null হলেও ক্র্যাশ না করে
  const cart = useCart() || { items: [], subtotal: 0, clear: () => {} };
  const { items, subtotal, clear } = cart;
  
  const [f, setF] = useState({ line: "", phone: "", method: "SSLCOMMERZ" });
  const [err, setErr] = useState(""); 
  const [busy, setBusy] = useState(false);
  
  // শুধুমাত্র একটি pay ফাংশন
  async function pay() {
    setBusy(true); 
    setErr("");
    
    try {
      const r = await fetch("/api/checkout", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          items: items.map((i: any) => ({ id: i.id, title: i.title, qty: i.qty })), 
          address: { line: f.line, phone: f.phone }, 
          method: f.method 
        }) 
      });
      
      const j = await r.json(); 
      setBusy(false);
      
      if (!r.ok) {
        alert(j.error || "Something went wrong");
        return setErr(j.error || "Something went wrong");
      }
      
      clear(); 
      window.location.href = j.url;
      
    } catch (error) {
      setBusy(false); 
      alert("Network error or server is down.");
    }
  }
  
  return (
    <main className="wrap" style={{ maxWidth: 520, paddingTop: 40 }}>
      <h2>Checkout</h2>
      {items.map((i: any) => (
        <div className="li" key={i.id} style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{i.qty} × {i.title}</span>
          <span>৳{i.price * i.qty}</span>
        </div>
      ))}
      <p>Subtotal ৳{subtotal} + ৳60 delivery</p>
      
      <label>Delivery address</label>
      <textarea value={f.line} onChange={(e) => setF({ ...f, line: e.target.value })} />
      
      <label>Phone</label>
      <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      
      <label>Payment</label>
      <select value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>
        <option value="SSLCOMMERZ">bKash, Nagad or card (SSLCommerz)</option>
        <option value="COD">Cash on delivery</option>
      </select>
      
      {err && <p style={{ color: "var(--chili)" }}>{err}</p>}
      
      <p>
        <button className="btn" disabled={busy || !items.length || !f.line || !f.phone} onClick={pay}>
          {busy ? "Please wait…" : "Place order"}
        </button>
      </p>
    </main>
  );
}