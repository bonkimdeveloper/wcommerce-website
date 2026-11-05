"use client";
import { useCart } from "./CartProvider";
export default function AddButton({ id, title, price }: { id: string; title: string; price: number }) {
  const { add } = useCart();
  return <button className="btn" onClick={() => add({ id, title, price })}>Add</button>;
}
