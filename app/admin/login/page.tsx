"use client";

import { useState } from "react";
import { signIn, getSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!phone || !password) {
      setError("Please enter phone and password.");
      return;
    }

    setLoading(true);

    try {
      // ১. আগের কাস্টমার সেশন থাকলে তা মুছে ফেলবে (যাতে কনফ্লিক্ট না হয়)
      await signOut({ redirect: false });

      // ২. নতুন অ্যাডমিন লগইন
      const res = await signIn("credentials", {
        phone,
        password,
        role: "ADMIN",
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid phone or password.");
        return;
      }

      const session = await getSession();
      const role = (session?.user as any)?.role;

      if (role !== "ADMIN") {
        setError("Access denied. You are not an admin.");
        return;
      }

      // ৩. সফল হলে অ্যাডমিন ড্যাশবোর্ডে রিডাইরেক্ট
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f3f6f1", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#fff", padding: 40, borderRadius: 24, width: "100%", maxWidth: 400, boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1 style={{ margin: 0, fontSize: 28, color: "#170f1b" }}>🛡️ Admin Portal</h1>
          <p style={{ color: "#666", marginTop: 8 }}>Sign in to manage Khabo</p>
        </div>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 20, textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#333" }}>Phone Number</label>
            <input 
              type="tel" 
              placeholder="01XXXXXXXXX" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #dcdcd8", borderRadius: 10, fontSize: 16, outline: "none" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6, color: "#333" }}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #dcdcd8", borderRadius: 10, fontSize: 16, outline: "none" }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ background: "#4a1a00", color: "#fff", padding: "14px", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 8 }}
          >
            {loading ? "Verifying..." : "Login as Admin"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "#666" }}>
          <a href="/" style={{ color: "#4a1a00", fontWeight: 600, textDecoration: "none" }}>← Back to Store</a>
        </div>
      </div>
    </div>
  );
}