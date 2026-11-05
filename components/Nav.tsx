"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useCart } from "./CartProvider";
export default function Nav() {
  const { data } = useSession();
  const { items, setOpen } = useCart();
  const role = (data?.user as any)?.role;
  return (
    <nav className="wrap">
      <Link href="/" className="logo">khabo</Link>
      <Link href="/#cats">Categories</Link><Link href="/#vendors">Kitchens</Link><Link href="/vendor/apply">Sell with us</Link>
      {role === "VENDOR" && <Link href="/vendor">My shop</Link>}
      {role === "ADMIN" && <><Link href="/admin">Admin</Link><Link href="/vendor">Vendor</Link></>}
      <button className="link" onClick={() => setOpen(true)}>Bag ({items.reduce((a: number, i: any) => a + i.qty, 0)})</button>
      {data ? <button className="link" onClick={() => signOut()}>Sign out</button> : <button className="btn" onClick={() => signIn()}>Sign in</button>}
    </nav>
  );
}
