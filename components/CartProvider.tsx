"use client";
import { createContext, useContext, useEffect, useState } from "react";
export type Line = { id: string; title: string; price: number; qty: number };
const Ctx = createContext<any>(null);
export const useCart = () => useContext(Ctx);

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem("khabo-bag") || "[]")); } catch {} }, []);
  useEffect(() => { try { localStorage.setItem("khabo-bag", JSON.stringify(items)); } catch {} }, [items]);
  const add = (p: Omit<Line, "qty">) => { setItems((c) => c.some((i) => i.id === p.id) ? c.map((i) => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { ...p, qty: 1 }]); setOpen(true); };
  const change = (id: string, d: number) => setItems((c) => c.map((i) => i.id === id ? { ...i, qty: i.qty + d } : i).filter((i) => i.qty > 0));
  const clear = () => setItems([]);
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  return <Ctx.Provider value={{ items, add, change, clear, subtotal, open, setOpen }}>{children}</Ctx.Provider>;
}
