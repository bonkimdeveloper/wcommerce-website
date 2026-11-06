import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const session = await getSession();
  const user = session?.user as any;

  if (!user) {
    redirect("/");
  }

  // ইমেইলের বদলে ইউজার আইডি দিয়ে ডাটা খোঁজা হচ্ছে (যাতে ফোন লগইনে ক্র্যাশ না করে)
  const dbUser = await db.user.findUnique({ where: { id: user.id } });
  
  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f6f1", fontFamily: "var(--fb, system-ui)" }}>
      
      {/* সাইডবার */}
      <aside style={{ width: "260px", background: "#fff", padding: "30px 20px", borderRight: "1px solid #eaeaea", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#ff9b54", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
            {dbUser?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", margin: 0, fontWeight: 700 }}>{dbUser?.name || "User"}</h2>
            <p style={{ fontSize: "0.8rem", color: "#666", margin: 0 }}>{dbUser?.phone || dbUser?.email}</p>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link href="/dashboard" style={{ padding: "12px 16px", background: "#f0fdf4", color: "#166534", borderRadius: "8px", textDecoration: "none", fontWeight: 600 }}>
            📦 My Orders
          </Link>
          <Link href="/dashboard/profile" style={{ padding: "12px 16px", color: "#444", borderRadius: "8px", textDecoration: "none", fontWeight: 500 }}>
            👤 Profile Settings
          </Link>
          {dbUser?.role === "ADMIN" && (
            <Link href="/admin" style={{ padding: "12px 16px", color: "#444", borderRadius: "8px", textDecoration: "none", fontWeight: 500 }}>
              🛡️ Admin Panel
            </Link>
          )}
          <div style={{ marginTop: "auto", paddingTop: "40px" }}>
            <LogoutButton />
          </div>
        </nav>
      </aside>

      {/* মেইন কনটেন্ট */}
      <main style={{ flex: 1, padding: "40px" }}>
        <div style={{ maxWidth: "900px" }}>
          <div style={{ background: "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", marginBottom: "30px" }}>
            <h1 style={{ fontSize: "1.8rem", margin: "0 0 10px", fontFamily: "var(--fd, sans-serif)" }}>Welcome back, {dbUser?.name?.split(" ")[0] || "User"}! 👋</h1>
            <p style={{ color: "#666", margin: 0 }}>Here you can track your recent orders and manage your account.</p>
          </div>

          <h2 style={{ fontSize: "1.4rem", marginBottom: "20px" }}>Recent Orders</h2>
          
          {orders.length === 0 ? (
            <div style={{ background: "#fff", padding: "40px", borderRadius: "16px", textAlign: "center", color: "#666" }}>
              <p style={{ fontSize: "2rem", marginBottom: "10px" }}>🛍️</p>
              <h3 style={{ margin: "0 0 10px" }}>No orders yet</h3>
              <p style={{ marginBottom: "20px" }}>Looks like you haven't placed any orders yet.</p>
              <Link href="/" style={{ background: "#4a1a00", color: "#fff", padding: "10px 20px", borderRadius: "99px", textDecoration: "none", fontWeight: 600 }}>Start Shopping</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {orders.map((order) => (
                <div key={order.id} style={{ background: "#fff", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", gap: "15px" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "15px" }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "1.05rem" }}>Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p style={{ margin: "4px 0 0", color: "#666", fontSize: "0.85rem" }}>{new Date(order.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ 
                        background: order.status === 'PAID' ? '#dcfce7' : order.status === 'PENDING' ? '#fef08a' : '#fee2e2', 
                        color: order.status === 'PAID' ? '#166534' : order.status === 'PENDING' ? '#854d0e' : '#991b1b',
                        padding: "6px 12px", borderRadius: "99px", fontSize: "0.8rem", fontWeight: 700 
                      }}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    {order.items.map((item: any) => (
                      <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.95rem" }}>
                        <span>{item.qty} × {item.product.title}</span>
                        <span style={{ fontWeight: 600 }}>৳{item.price * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: "15px", fontWeight: 700, fontSize: "1.1rem" }}>
                    <span>Total</span>
                    <span>৳{order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}