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
        fetchOrders(); // Refresh list
      } else {
        alert("Failed to update");
      }
    } catch (err) {
      console.error(err);
      alert("Error");
    }
  };

  if (loading) return <div style={{ padding: 40 }}>Loading Admin Panel...</div>;

  return (
    <div style={{ padding: 40, fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ margin: 0 }}>🛡️ Admin Dashboard</h1>
        <button onClick={() => signOut({ callbackUrl: "/" })} style={{ padding: "10px 20px", background: "#333", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Logout
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 40 }}>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Total Orders</p>
          <h2 style={{ margin: "10px 0 0 0" }}>{orders.length}</h2>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Pending Verification</p>
          <h2 style={{ margin: "10px 0 0 0", color: "#d97706" }}>
            {orders.filter(o => o.paymentStatus === "PENDING_VERIFICATION").length}
          </h2>
        </div>
        <div style={{ background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, color: "#666", fontSize: 14 }}>Total Revenue</p>
          <h2 style={{ margin: "10px 0 0 0", color: "#16a34a" }}>
            ৳{orders.filter(o => o.paymentStatus === "PAID").reduce((a, b) => a + b.total, 0)}
          </h2>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              <th style={{ padding: 16, fontWeight: 600 }}>Order ID</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Customer</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Payment Info</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Total</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Status</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: "#666" }}>No orders yet.</td></tr>
            )}
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: 16 }}>
                  <div style={{ fontWeight: 600 }}>#{o.orderNumber}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: 16 }}>
                  <div>{o.user.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{o.user.phone}</div>
                </td>
                <td style={{ padding: 16 }}>
                  <div style={{ fontWeight: 600, color: o.method === "COD" ? "#d97706" : "#2563eb" }}>{o.method}</div>
                  {o.payment?.trxId && <div style={{ fontSize: 12, color: "#666" }}>TrxID: {o.payment.trxId}</div>}
                  {o.payment?.senderNumber && <div style={{ fontSize: 12, color: "#666" }}>From: {o.payment.senderNumber}</div>}
                </td>
                <td style={{ padding: 16, fontWeight: 600 }}>৳{o.total}</td>
                <td style={{ padding: 16 }}>
                  <span style={{ padding: "4px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: o.status === "DELIVERED" ? "#dcfce7" : o.status === "CONFIRMED" ? "#dbeafe" : "#fef3c7", color: o.status === "DELIVERED" ? "#166534" : o.status === "CONFIRMED" ? "#1e40af" : "#92400e" }}>
                    {o.status}
                  </span>
                  <div style={{ fontSize: 12, marginTop: 4, color: "#666" }}>Pay: {o.paymentStatus}</div>
                </td>
                <td style={{ padding: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {o.paymentStatus === "PENDING_VERIFICATION" && (
                    <button onClick={() => handleAction(o.id, "VERIFY")} style={{ padding: "6px 12px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Verify Pay</button>
                  )}
                  {o.status === "CONFIRMED" && (
                    <button onClick={() => handleAction(o.id, "SHIP")} style={{ padding: "6px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Ship</button>
                  )}
                  {o.status === "SHIPPED" && (
                    <button onClick={() => handleAction(o.id, "DELIVER")} style={{ padding: "6px 12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Deliver</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}