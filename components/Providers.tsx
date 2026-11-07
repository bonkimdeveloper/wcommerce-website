"use client";

import { SessionProvider } from "next-auth/react";
import CartProvider from "./CartProvider";
import CartDrawer from "./CartDrawer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
        <CartDrawer />
      </CartProvider>
    </SessionProvider>
  );
}