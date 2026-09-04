// ─── Razorpay Payment Utilities ───
// Centralized module for all Razorpay payment operations.

interface InitiatePaymentParams {
  /** Total amount in INR (rupees, not paise — conversion is handled by the API) */
  amount: number;
  /** Number of items in the cart (used in the checkout description) */
  cartCount: number;
  /** Customer's full name for prefill */
  fullName: string;
  /** Customer's email for prefill */
  email: string;
  /** Customer's phone number for prefill */
  phone: string;
  /** Database order ID */
  orderId: string;
  /** Selected frontend payment method (e.g. Credit / Debit Card, UPI) */
  paymentMethod?: string;
}

/**
 * Creates a Razorpay order on the backend, opens the Razorpay Checkout modal,
 * and verifies the payment signature server-side.
 *
 * @returns `true` if payment succeeded, `false` if the user dismissed the modal.
 * @throws  Error on API failures, SDK issues, or verification failures.
 */
export async function initiateRazorpayPayment({
  amount,
  cartCount,
  fullName,
  email,
  phone,
  orderId,
  paymentMethod,
}: InitiatePaymentParams): Promise<boolean> {
  // Step 1: Create order on our backend
  console.log("Creating Razorpay order for amount:", amount);
  const orderRes = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, orderId }),
  });

  if (!orderRes.ok) {
    const err = await orderRes.json();
    console.error("Razorpay order creation failed:", err);
    throw new Error(err.error || "Failed to create Razorpay order");
  }

  const razorpayOrder = await orderRes.json();

  // Step 2: Open Razorpay Checkout Modal
  return new Promise<boolean>((resolve, reject) => {
    if (typeof window === "undefined" || !window.Razorpay) {
      reject(
        new Error(
          "Razorpay SDK not loaded. Please refresh the page and try again."
        )
      );
      return;
    }

    // Map payment method to Razorpay's prefill method.
    // IMPORTANT: only set prefillMethod when the user has EXPLICITLY selected
    // a specific payment method. When prefill.method is set (even to "card"),
    // Razorpay locks the Checkout modal to that tab and hides other methods.
    // "Credit / Debit Card" is the default state value — not an explicit choice —
    // so we treat it the same as no selection (prefillMethod = undefined), which
    // causes Checkout to open showing ALL available payment methods.
    let prefillMethod: "card" | "upi" | undefined;
    if (paymentMethod === "UPI / GPay / PhonePe") {
      prefillMethod = "upi";
      // Note: "Credit / Debit Card" is intentionally excluded here.
      // It is the default state, not an explicit user selection. Passing
      // prefill.method: "card" suppresses UPI even when the user hasn't chosen.
    }

    // Ensure a valid email is passed. Razorpay requires a valid email to enable
    // Netbanking/UPI/Wallet methods. Empty email falls back to Card-only.
    const validEmail = email && email.includes("@") ? email : "guest@sanayacollection.com";

    // Normalize phone to a valid 10-digit Indian mobile number.
    // Simply stripping non-digits is insufficient: "+91 98765 43210" becomes
    // "919876543210" (12 digits), which Razorpay's UPI eligibility check
    // silently rejects, causing UPI to disappear from the modal.
    const digitsOnly = phone.replace(/\D/g, "");
    const cleanedPhone = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

    // ── Diagnostic log — verify these values in the browser console ──
    console.log("[Razorpay] Checkout options debug:", {
      cleanedPhone,
      phoneDigitCount: cleanedPhone.length,
      prefillMethod: prefillMethod ?? "(omitted — all methods shown)",
      currency: razorpayOrder.currency || "INR",
    });

    const options: RazorpayOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
      amount: razorpayOrder.amount, // Already in paise from backend
      currency: razorpayOrder.currency || "INR",
      name: "Sanaya Collection",
      description: `Order of ${cartCount} item(s)`,
      order_id: razorpayOrder.id,
      handler: async (response: RazorpayResponse) => {
        try {
          // Step 3: Verify payment on backend
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            resolve(true);
          } else {
            reject(
              new Error(
                "Payment verification failed. Please contact support."
              )
            );
          }
        } catch (err) {
          reject(
            new Error("Could not verify payment. Please contact support.")
          );
        }
      },
      prefill: {
        name: fullName,
        email: validEmail,
        contact: cleanedPhone,
        // Only include method when the user explicitly picked one.
        // Omitting this key lets Razorpay show all available payment methods.
        ...(prefillMethod ? { method: prefillMethod } : {}),
      },
      theme: {
        color: "#C95B7B", // brand-accent
      },
      modal: {
        ondismiss: () => {
          resolve(false); // User closed the modal
        },
        confirm_close: true,
        escape: false,
        backdropclose: false,
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", (failedResponse: any) => {
      reject(
        new Error(
          failedResponse?.error?.description ||
          "Payment failed. Please try again or use a different payment method."
        )
      );
    });

    rzp.open();
  });
}
