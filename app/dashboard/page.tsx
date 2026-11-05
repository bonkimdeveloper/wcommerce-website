"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f7f8f9", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* সাইডবার */}
      <aside style={{ width: "240px", padding: "30px 20px", display: "flex", flexDirection: "column", gap: "40px" }}>
        {/* লোগো */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", background: "linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)", borderRadius: "8px", color: "white", fontWeight: "bold", fontSize: "14px", padding: "8px" }}>
          viewe
        </div>

        {/* মেনু */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "16px", marginTop: "20px" }}>
          <Link href="#" style={{ color: "#111", fontWeight: "600", textDecoration: "none" }}>Orders</Link>
          <Link href="#" style={{ color: "#888", textDecoration: "none" }}>Profile</Link>
        </nav>
      </aside>

      {/* মেইন কনটেন্ট */}
      <main style={{ flex: 1, padding: "30px 40px" }}>
        
        {/* টপ বার (ইউজার আইকন) */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </div>
        </div>

        {/* ওয়েলকাম কার্ড */}
        <div style={{ background: "white", borderRadius: "24px", padding: "40px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", position: "relative", overflow: "hidden", minHeight: "350px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#111", marginBottom: "4px" }}>Welcome</h1>
              <p style={{ fontSize: "18px", color: "#777" }}>Ready to shop?</p>
            </div>
            <Link href="/" style={{ background: "#e83e74", color: "white", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "500", fontSize: "14px" }}>
              Shop now
            </Link>
          </div>

          {/* প্রোডাক্ট ক্যারোসেল (ছবির মতো সাজানো) */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "70px", position: "relative", width: "100%" }}>
            
            {/* বাম দিকের ১ম */}
            <div style={{ width: "110px", height: "150px", background: "#f8f9fa", borderRadius: "16px", transform: "rotate(-15deg) translateY(30px) translateX(30px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.05)", zIndex: 1 }}>
              <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=150" alt="drink" style={{ width: "70%", transform: "rotate(5deg)" }} />
            </div>
            
            {/* বাম দিকের ২য় */}
            <div style={{ width: "130px", height: "170px", background: "#f8f9fa", borderRadius: "16px", transform: "rotate(-8deg) translateY(10px) translateX(15px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.05)", zIndex: 2 }}>
              <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=150" alt="drink" style={{ width: "70%" }} />
            </div>

            {/* মাঝখানের বড় */}
            <div style={{ width: "150px", height: "190px", background: "#f8f9fa", borderRadius: "20px", zIndex: 3, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 15px 30px rgba(0,0,0,0.08)", transform: "translateY(-10px)" }}>
              <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=150" alt="drink" style={{ width: "70%" }} />
            </div>

            {/* ডান দিকের ১ম */}
            <div style={{ width: "130px", height: "170px", background: "#f8f9fa", borderRadius: "16px", transform: "rotate(8deg) translateY(10px) translateX(-15px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.05)", zIndex: 2 }}>
              <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=150" alt="drink" style={{ width: "70%" }} />
            </div>

            {/* ডান দিকের ২য় */}
            <div style={{ width: "110px", height: "150px", background: "#f8f9fa", borderRadius: "16px", transform: "rotate(15deg) translateY(30px) translateX(-30px)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px rgba(0,0,0,0.05)", zIndex: 1 }}>
              <img src="https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=150" alt="drink" style={{ width: "70%", transform: "rotate(-5deg)" }} />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}