"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{ width: "100%", padding: "12px 16px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
    >
      🚪 Log Out
    </button>
  );
}