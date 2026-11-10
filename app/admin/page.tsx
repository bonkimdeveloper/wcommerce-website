"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

export default function AdminPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAction = async (orderId: string, action: string) => {
    if (!confirm(`Are you sure you want to ${action} this order?`)) return;
    
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        alert("Success!");
        fetchOrders(); // রিফ্রেশ লিস্ট
      } else {
        alert("Failed to update");
      }
    } catch (err) {
      console.error(err);
      alert("Error");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading Admin Panel...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto", background: "#f8fafc", minHeight: "100vh" }}>
      
      {/* হেডার */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "15px", marginBottom: 30 }}>
        <h1 style={{ margin: 0, fontSize: "1.8rem" }}>🛡️ Admin Dashboard</h1>
        <button onClick={() => signOut({ callbackUrl: "/" })} style={{ padding: "10px 20px", background: "#333", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
          Logout
        </button>
      </div>

      {/* স্ট্যাটস */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20, marginBottom: 40 }}>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Total Orders</p>
          <h2 style={{ margin: "10px 0 0 0", fontSize: "2rem" }}>{orders.length}</h2>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Pending Verification</p>
          <h2 style={{ margin: "10px 0 0 0", color: "#d97706", fontSize: "2rem" }}>
            {orders.filter(o => o.paymentStatus === "PENDING_VERIFICATION").length}
          </h2>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Total Revenue</p>
          <h2 style={{ margin: "10px 0 0 0", color: "#16a34a", fontSize: "2rem" }}>
            ৳{orders.filter(o => o.paymentStatus === "PAID").reduce((a, b) => a + b.total, 0)}
          </h2>
        </div>
      </div>

      {/* অর্ডার লিস্ট (মোবাইল ফ্রেন্ডলি কার্ড ভিউ) */}
      <h2 style={{ fontSize: "1.4rem", marginBottom: "20px" }}>All Orders</h2>
      
      {orders.length === 0 ? (
         <div style={{ background: "#fff", padding: 40, textAlign: "center", borderRadius: 12, color: "#666" }}>
            No orders yet.
         </div>
      ) : (
        <div style={{ display: "grid", gap: "15px" }}>
          {orders.map((o) => (
            <div key={o.id} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "15px" }}>
              
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "15px", gap: "10px" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>Order #{o.orderNumber}</div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{new Date(o.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: o.status === "DELIVERED" ? "#dcfce7" : o.status === "CONFIRMED" ? "#dbeafe" : "#fef3c7", color: o.status === "DELIVERED" ? "#166534" : o.status === "CONFIRMED" ? "#1e40af" : "#92400e" }}>
                    {o.status}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", fontSize: "0.95rem" }}>
                <div>
                  <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: 12, fontWeight: 600 }}>CUSTOMER</p>
                  <p style={{ margin: 0, fontWeight: 600 }}>{o.user.name}</p>
                  <p style={{ margin: 0, color: "#666" }}>{o.user.phone}</p>
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: 12, fontWeight: 600 }}>PAYMENT INFO</p>
                  <p style={{ margin: 0, fontWeight: 700, color: o.method === "COD" ? "#d97706" : "#2563eb" }}>{o.method}</p>
                  {o.payment?.trxId && <p style={{ margin: 0, fontSize: 13 }}>TrxID: {o.payment.trxId}</p>}
                  {o.payment?.senderNumber && <p style={{ margin: 0, fontSize: 13 }}>From: {o.payment.senderNumber}</p>}
                </div>
                <div>
                  <p style={{ margin: "0 0 4px 0", color: "#666", fontSize: 12, fontWeight: 600 }}>TOTAL AMOUNT</p>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "1.2rem", color: "#16a34a" }}>৳{o.total}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Pay Status: {o.paymentStatus}</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "5px" }}>
                {o.paymentStatus === "PENDING_VERIFICATION" && (
                  <button onClick={() => handleAction(o.id, "VERIFY")} style={{ padding: "10px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, flex: "1 1 auto" }}>Verify Pay</button>
                )}
                {o.status === "CONFIRMED" && (
                  <button onClick={() => handleAction(o.id, "SHIP")} style={{ padding: "10px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, flex: "1 1 auto" }}>Ship Order</button>
                )}
                {o.status === "SHIPPED" && (
                  <button onClick={() => handleAction(o.id, "DELIVER")} style={{ padding: "10px 16px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, flex: "1 1 auto" }}>Mark Delivered</button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}