"use client";
import { SessionProvider } from "next-auth/react";
import CartProvider from "./CartProvider";
import CartDrawer from "./CartDrawer";
import Nav from "./Nav";
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider><CartProvider><Nav />{children}<CartDrawer /></CartProvider></SessionProvider>;
}
