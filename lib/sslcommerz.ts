const base = () => process.env.SSL_SANDBOX === "false" ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com";

export async function initPayment(o: { tranId: string; total: number; name: string; email: string; address: string; phone: string; origin: string }) {
  const body = new URLSearchParams({
    store_id: process.env.SSL_STORE_ID!, store_passwd: process.env.SSL_STORE_PASS!,
    total_amount: String(o.total), currency: "BDT", tran_id: o.tranId,
    success_url: `${o.origin}/api/payment/success`, fail_url: `${o.origin}/api/payment/fail`,
    cancel_url: `${o.origin}/api/payment/cancel`, ipn_url: `${o.origin}/api/payment/ipn`,
    cus_name: o.name, cus_email: o.email, cus_add1: o.address, cus_city: "Dhaka", cus_country: "Bangladesh", cus_phone: o.phone,
    shipping_method: "Courier", product_name: "Khabo order", product_category: "Food", product_profile: "general",
    ship_name: o.name, ship_add1: o.address, ship_city: "Dhaka", ship_country: "Bangladesh", ship_postcode: "1200",
  });
  const r = await fetch(`${base()}/gwprocess/v4/api.php`, { method: "POST", body });
  const j = await r.json();
  if (!j.GatewayPageURL) throw new Error(j.failedreason || "SSLCommerz init failed");
  return j.GatewayPageURL as string;
}

// Always validate server-side; never trust the POST body alone.
export async function validate(valId: string) {
  const u = `${base()}/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${process.env.SSL_STORE_ID}&store_passwd=${process.env.SSL_STORE_PASS}&format=json`;
  const j = await (await fetch(u)).json();
  return { ok: j.status === "VALID" || j.status === "VALIDATED", amount: Number(j.amount), tranId: j.tran_id as string };
}
