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
        email: email,
        contact: phone,
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
