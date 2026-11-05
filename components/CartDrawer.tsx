"use client";
import Link from "next/link";
import { useCart } from "./CartProvider";
export default function CartDrawer() {
  const { items, change, subtotal, open, setOpen } = useCart();
  if (!open) return null;
  return (
    <aside className="drawer" aria-label="Your bag">
      <div style={{ display: "flex", justifyContent: "space-between" }}><h2 style={{ fontSize: 26 }}>Your bag</h2><button className="link" onClick={() => setOpen(false)}>Close</button></div>
      <div className="items">
        {!items.length && <p>Your bag is empty. Pick a kitchen and add something tasty.</p>}
        {items.map((i: any) => (
          <div className="li" key={i.id}><span>{i.title}<br /><small>৳{i.price}</small></span>
            <span className="qty"><button onClick={() => change(i.id, -1)}>−</button> {i.qty} <button onClick={() => change(i.id, 1)}>+</button></span></div>
        ))}
      </div>
      <strong>Subtotal ৳{subtotal}</strong>
      <small>Delivery and any discounts are worked out at checkout.</small>
      {items.length > 0 && <Link className="btn" href="/checkout" onClick={() => setOpen(false)}>Checkout</Link>}
    </aside>
  );
}
