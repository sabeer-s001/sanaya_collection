// ─── Razorpay Payment Utilities ───
// Centralized module for all Razorpay payment operations.

interface InitiatePaymentParams {
  /** Total amount in INR (rupees) */
  amount: number;
  /** Number of items in cart */
  cartCount: number;
  /** Customer full name for prefill */
  fullName: string;
  /** Customer email for prefill */
  email: string;
  /** Customer phone for prefill */
  phone: string;
  /** Selected payment method */
  paymentMethod?: string;
  /** Full order data object (shipping address, items, discount, shipping, etc.) */
  orderData: any;
}

export interface PaymentResult {
  success: boolean;
  cancelled?: boolean;
  order?: any;
  error?: string;
}

/**
 * Creates a Razorpay order on backend, opens Checkout modal,
 * and verifies payment signature server-side before creating order in DB.
 */
export async function initiateRazorpayPayment({
  amount,
  cartCount,
  fullName,
  email,
  phone,
  paymentMethod,
  orderData,
}: InitiatePaymentParams): Promise<PaymentResult> {
  // Step 1: Create Razorpay order on backend (without creating DB record)
  console.log("[RAZORPAY] Requesting Razorpay order for amount:", amount);
  const orderRes = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount }),
  });

  if (!orderRes.ok) {
    const err = await orderRes.json();
    console.error("[RAZORPAY] Order creation failed:", err);
    throw new Error(err.error || "Failed to create Razorpay order.");
  }

  const razorpayOrder = await orderRes.json();

  // Step 2: Open Razorpay Checkout Modal
  return new Promise<PaymentResult>((resolve, reject) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      reject(
        new Error(
          "Razorpay payment system not ready. Please refresh the page and try again."
        )
      );
      return;
    }

    let prefillMethod: "card" | "upi" | undefined;
    if (paymentMethod === "UPI / GPay / PhonePe") {
      prefillMethod = "upi";
    }

    const validEmail = email && email.includes("@") ? email : "guest@sanayacollection.com";

    const digitsOnly = phone.replace(/\D/g, "");
    const cleanedPhone = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      amount: razorpayOrder.amount, // Already in paise from backend
      currency: razorpayOrder.currency || "INR",
      name: "Sanaya Collection",
      description: `Order of ${cartCount} item(s)`,
      order_id: razorpayOrder.id,
      handler: async (response: RazorpayResponse) => {
        try {
          // Step 3: Verify payment signature and create order on backend
          console.log("[RAZORPAY] Payment completed. Verifying signature on server...");
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok && verifyData.success) {
            resolve({ success: true, order: verifyData.order });
          } else {
            reject(
              new Error(
                verifyData.error || "Payment verification failed. Security signature invalid."
              )
            );
          }
        } catch (err: any) {
          reject(
            new Error(err.message || "Could not verify payment. Please try again or contact support.")
          );
        }
      },
      prefill: {
        name: fullName,
        email: validEmail,
        contact: cleanedPhone,
        ...(prefillMethod ? { method: prefillMethod } : {}),
      },
      theme: {
        color: "#C95B7B", // brand-accent
      },
      modal: {
        ondismiss: () => {
          console.log("[RAZORPAY] Payment modal dismissed by user.");
          resolve({ success: false, cancelled: true });
        },
        confirm_close: true,
        escape: false,
        backdropclose: false,
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", (failedResponse: any) => {
      console.warn("[RAZORPAY] Payment failed event:", failedResponse);
      const failReason = failedResponse?.error?.description || "Payment failed. Please try again.";
      reject(new Error(failReason));
    });

    rzp.open();
  });
}

