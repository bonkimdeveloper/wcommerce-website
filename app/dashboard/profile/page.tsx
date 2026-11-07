"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user) {
      setName((session.user as any).name || "");
      setPhone((session.user as any).phone || "");
      setImage((session.user as any).image || "");
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, avatar: image }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Profile updated successfully!");
        
        // এখানে সেশন আপডেট করা হলো
        await update({ name, phone, image });
        
        // হোমপেজে ইউজারের নাম আপডেট করার জন্য লোকাল স্টোরেজেও সেভ করা হলো
        localStorage.setItem("khabo-user-name", name);
        
        router.refresh();
      } else {
        setMessage("❌ " + (data.error || "Failed to update"));
      }
    } catch (err) {
      setMessage("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f6f1", fontFamily: "system-ui, sans-serif", flexWrap: "wrap" }}>
      
      {/* সাইডবার */}
      <aside style={{ width: "100%", maxWidth: "280px", background: "#fff", padding: "30px 20px", borderRight: "1px solid #eaeaea", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#ff9b54", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", overflow: "hidden" }}>
            {image ? <img src={image} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (name.charAt(0).toUpperCase() || "U")}
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>{name || "User"}</h2>
            <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>{phone}</p>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link href="/dashboard" style={{ padding: "12px 16px", color: "#444", borderRadius: "8px", textDecoration: "none", fontWeight: 500 }}>
            📦 My Orders
          </Link>
          <Link href="/dashboard/profile" style={{ padding: "12px 16px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
            👤 Profile Settings
          </Link>
        </nav>
      </aside>

      {/* মেইন কনটেন্ট */}
      <main style={{ flex: 1, padding: "40px 20px", minWidth: "300px" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}>
          <h1 style={{ fontSize: "1.6rem", marginBottom: "30px" }}>👤 Edit Profile</h1>

          {message && (
            <div style={{ padding: 12, borderRadius: 8, marginBottom: 20, background: message.includes("✅") ? "#dcfce7" : "#fee2e2", color: message.includes("✅") ? "#166534" : "#991b1b", fontWeight: 600, fontSize: "0.9rem" }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "#ff9b54", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: "bold", overflow: "hidden" }}>
                {image ? <img src={image} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (name.charAt(0).toUpperCase() || "U")}
              </div>
              <input 
                type="url"
                placeholder="Profile Image URL (e.g. https://...)" 
                value={image}
                onChange={(e) => setImage(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1.5px solid #dcdcd8", borderRadius: "10px", fontSize: "0.9rem", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1.5px solid #dcdcd8", borderRadius: "10px", fontSize: "1rem", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: "100%", padding: "12px", border: "1.5px solid #dcdcd8", borderRadius: "10px", fontSize: "1rem", outline: "none" }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ background: "#4a1a00", color: "#fff", padding: "14px", border: "none", borderRadius: "10px", fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}