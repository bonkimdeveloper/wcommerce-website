const base = () => process.env.SSL_SANDBOX === "false" ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com";

export async function initPayment(o: { tranId: string; total: number; name: string; email: string; address: string; phone: string; origin: string }) {
  if (!process.env.SSL_STORE_ID || !process.env.SSL_STORE_PASS) throw new Error("SSLCommerz credentials are not configured.");
  const body = new URLSearchParams({
    store_id: process.env.SSL_STORE_ID,
    store_passwd: process.env.SSL_STORE_PASS,
    total_amount: String(o.total),
    currency: "BDT",
    tran_id: o.tranId,
    success_url: `${o.origin}/api/payment/success`,
    fail_url: `${o.origin}/api/payment/fail`,
    cancel_url: `${o.origin}/api/payment/cancel`,
    ipn_url: `${o.origin}/api/payment/ipn`,
    cus_name: o.name,
    cus_email: o.email,
    cus_add1: o.address,
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: o.phone,
    shipping_method: "Courier",
    product_name: "Khabo order",
    product_category: "Food",
    product_profile: "general",
    ship_name: o.name,
    ship_add1: o.address,
    ship_city: "Dhaka",
    ship_country: "Bangladesh",
    ship_postcode: "1200",
  });
  const response = await fetch(`${base()}/gwprocess/v4/api.php`, { method: "POST", body, cache: "no-store" });
  if (!response.ok) throw new Error("SSLCommerz could not initialize the payment.");
  const result = await response.json();
  if (!result.GatewayPageURL) throw new Error(result.failedreason || "SSLCommerz init failed");
  return result.GatewayPageURL as string;
}

// Always validate server-side; never trust the callback POST body alone.
export async function validate(valId: string) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(valId)) return { ok: false, amount: 0, tranId: "", currency: "" };
  if (!process.env.SSL_STORE_ID || !process.env.SSL_STORE_PASS) throw new Error("SSLCommerz credentials are not configured.");
  const params = new URLSearchParams({
    val_id: valId,
    store_id: process.env.SSL_STORE_ID,
    store_passwd: process.env.SSL_STORE_PASS,
    format: "json",
  });
  const response = await fetch(`${base()}/validator/api/validationserverAPI.php?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) throw new Error("SSLCommerz validation request failed.");
  const result = await response.json();
  return {
    ok: result.status === "VALID" || result.status === "VALIDATED",
    amount: Number(result.amount),
    tranId: typeof result.tran_id === "string" ? result.tran_id : "",
    currency: typeof result.currency === "string" ? result.currency : (typeof result.currency_type === "string" ? result.currency_type : ""),
  };
}
