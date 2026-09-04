// ─── iThink Logistics API v3 Service ───
// Centralized, server-only module for all iThink Logistics operations.
// Handles shipment creation, tracking, cancellation with retry logic
// and idempotency guards.
//
// API Reference: https://docs.ithinklogistics.com/doc-add-order/3
// Endpoint for order creation: POST /api_v3/order/add.json
// Endpoint for tracking:       POST /api_v3/order/track.json
// Endpoint for cancellation:   POST /api_v3/order/cancel.json
//
// ── Payload Audit (vs. official iThink V3 docs) ──────────────────────────
//
// TOP-LEVEL inside data{} (NOT inside shipments[]):
//   access_token          - Mandatory
//   secret_key            - Mandatory
//   pickup_address_id     - Mandatory (*Required Pickup Warehouse Id)
//   shipments             - Mandatory (array, max 10 orders)
//   order_type            - Optional: "forward" | "reverse" (default: forward)
//   s_type                - Optional: "air" | "surface"  ← This is "Shipment Service Type"
//   logistics             - Optional: delhivery, bluedart, xpressbees, ecom, ekart
//
// INSIDE shipments[]:
//   order, order_date, total_amount                      - Mandatory
//   name, add, pin, phone                                - Mandatory
//   billing_name, billing_add, billing_pin, billing_phone - Mandatory
//   return_address_id                                    - Mandatory
//   products[{ product_name, product_quantity, product_price }] - Mandatory
//   shipment_length, shipment_width, shipment_height, weight    - Mandatory
//   payment_mode: "COD" | "Prepaid"                      - Optional (default: cod)
//   cod_amount                                           - Optional
//
// SUCCESS RESPONSE AWB key: data["1"].waybill  (V3: waybill, NOT awb_no/awb_number)
// Courier name in response:  data["1"].logistic_name
// ──────────────────────────────────────────────────────────────────────────

import { dbConnect, OrderModel } from "@/lib/mongodb";

// ─── Configuration ───

const getConfig = () => ({
  accessToken: process.env.ITHINK_ACCESS_TOKEN || "",
  secretKey: process.env.ITHINK_SECRET_KEY || "",
  baseUrl: (process.env.ITHINK_BASE_URL || "https://my.ithinklogistics.com").replace(/\/$/, ""),
  // Pickup Warehouse ID from iThink dashboard (Settings → Warehouses)
  // REQUIRED: Set ITHINK_PICKUP_ADDRESS_ID in .env.local
  pickupAddressId: process.env.ITHINK_PICKUP_ADDRESS_ID || "",
  // Return address ID — can be same as pickup warehouse ID
  returnAddressId: process.env.ITHINK_RETURN_ADDRESS_ID || process.env.ITHINK_PICKUP_ADDRESS_ID || "",
  warehouse: {
    name: process.env.ITHINK_WAREHOUSE_NAME || "Sanaya Collection",
    address: process.env.ITHINK_WAREHOUSE_ADDRESS || "",
    city: process.env.ITHINK_WAREHOUSE_CITY || "Mumbai",
    state: process.env.ITHINK_WAREHOUSE_STATE || "Maharashtra",
    pin: process.env.ITHINK_WAREHOUSE_PIN || "400001",
    phone: process.env.ITHINK_WAREHOUSE_PHONE || "",
  },
});

// ─── Types ───

export interface ShipmentResult {
  success: boolean;
  awbNumber: string;
  courierName: string;
  shipmentId?: string;
  error?: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location: string;
  remark: string;
}

export interface TrackingResult {
  success: boolean;
  awbNumber: string;
  currentStatus: string;
  expectedDelivery?: string;
  courierName?: string;
  events: TrackingEvent[];
  error?: string;
}

export interface CancelResult {
  success: boolean;
  message: string;
  error?: string;
}

// ─── Error Classes ───

export class ShipmentCreationError extends Error {
  constructor(message: string, public readonly orderId: string) {
    super(message);
    this.name = "ShipmentCreationError";
  }
}

export class TrackingError extends Error {
  constructor(message: string, public readonly awbNumber: string) {
    super(message);
    this.name = "TrackingError";
  }
}

// ─── Retry Helper ───

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(15000), // 15s timeout per request
      });
      return response;
    } catch (err: any) {
      lastError = err;
      // Exponential backoff: 1s, 2s, 4s
      if (attempt < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError || new Error("Request failed after retries");
}

// ─── Map iThink status codes to our Order status ───

function mapIthinkStatusToOrderStatus(
  ithinkStatus: string
): "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled" {
  const s = ithinkStatus.toLowerCase();

  if (s.includes("delivered") || s.includes("completed")) return "Delivered";
  if (s.includes("out for delivery") || s.includes("in transit") || s.includes("shipped"))
    return "Shipped";
  if (
    s.includes("picked up") ||
    s.includes("processing") ||
    s.includes("manifested") ||
    s.includes("booked")
  )
    return "Processing";
  if (s.includes("cancel") || s.includes("rto")) return "Cancelled";

  return "Processing";
}

// ─── Create Shipment ───

export async function createShipment(order: any): Promise<ShipmentResult> {
  const config = getConfig();

  if (!config.accessToken || !config.secretKey) {
    console.error("[LOGISTICS] iThink Logistics credentials not configured");
    return {
      success: false,
      awbNumber: "",
      courierName: "",
      error: "iThink Logistics credentials not configured",
    };
  }

  if (!config.pickupAddressId) {
    console.error("[LOGISTICS] ITHINK_PICKUP_ADDRESS_ID is not set. Set this in .env.local to your iThink Warehouse ID.");
    return {
      success: false,
      awbNumber: "",
      courierName: "",
      error: "ITHINK_PICKUP_ADDRESS_ID not configured. Get your warehouse ID from iThink dashboard → Settings → Warehouses.",
    };
  }

  // Format date helper: DD-MM-YYYY HH:MM:SS (iThink V3 docs format)
  const d = new Date(order.date || order.createdAt || Date.now());
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

  // Build product list from order items
  // products[]: product_name (Mandatory), product_quantity (Mandatory), product_price (Mandatory)
  const products = order.items.map((item: any) => ({
    product_name: item.product?.name || "Clothing",
    product_sku: item.product?.id || "SKU-GEN",
    product_quantity: String(item.quantity || 1),
    product_price: String(item.product?.salePrice || 0),
    product_tax_rate: "0",
    product_hsn_code: "",
    product_discount: "0",
  }));

  // ── Payment mode ──
  // Razorpay orders = Prepaid (payment already captured)
  // COD orders = COD (cash collected at delivery)
  const isCOD =
    order.paymentMethod === "Cash On Delivery (COD)" ||
    order.paymentStatus === "Pending" ||
    order.paymentStatus === "cod" ||
    order.paymentStatus === "unpaid";
  // V3 docs: payment_mode values are "COD" or "Prepaid"
  const paymentMode = isCOD ? "COD" : "Prepaid";

  // ── Phone number — digits only ──
  const shippingPhone = (
    order.shippingAddress?.phone ||
    order.phone ||
    ""
  ).replace(/\D/g, "");

  const pinCode = String(order.shippingAddress?.postalCode || "").trim();
  const customerEmail = order.email || order.shippingAddress?.email || "";

  // ────────────────────────────────────────────────────────────────────────
  // PAYLOAD — matched field-by-field to iThink Logistics API V3.0.0 docs
  // Endpoint: POST /api_v3/order/add.json
  //
  // STRUCTURE (per official V3 docs sample):
  //   data: {
  //     shipments: [ { ...shipment fields, return_address_id } ],
  //     pickup_address_id: "...",   ← TOP-LEVEL, not inside shipments
  //     access_token: "...",        ← TOP-LEVEL
  //     secret_key: "...",          ← TOP-LEVEL
  //     order_type: "forward",      ← TOP-LEVEL: "forward" | "reverse"
  //     s_type: "surface",          ← TOP-LEVEL: "air" | "surface" (Shipment Service Type)
  //   }
  // ────────────────────────────────────────────────────────────────────────
  const payload = {
    data: {
      shipments: [
        {
          // ── Order identification ──
          waybill: "",
          order: order.id,
          sub_order: "",
          order_date: formattedDate,  // Required: DD-MM-YYYY HH:MM:SS

          // ── Totals ──
          total_amount: String(order.totalAmount || 0),

          // ── Shipping (delivery) address ──
          name: order.shippingAddress?.fullName || "",
          add: order.shippingAddress?.addressLine || "",
          add2: "",
          add3: "",
          pin: pinCode,
          city: order.shippingAddress?.city || "",
          state: order.shippingAddress?.state || "",
          country: "India",
          phone: shippingPhone,
          // alt_phone auto-set = same phone (no second UI input required)
          alt_phone: shippingPhone,
          email: customerEmail,

          // ── Billing address ──
          // is_billing_same_as_shipping: when billing = shipping, omit the flag
          // or pass "no" and duplicate the fields (safer for max compatibility)
          is_billing_same_as_shipping: "no",
          billing_name: order.shippingAddress?.fullName || "",
          billing_add: order.shippingAddress?.addressLine || "",
          billing_add2: "",
          billing_add3: "",
          billing_pin: pinCode,
          billing_city: order.shippingAddress?.city || "",
          billing_state: order.shippingAddress?.state || "",
          billing_country: "India",
          billing_phone: shippingPhone,
          billing_alt_phone: shippingPhone,
          billing_email: customerEmail,

          // ── Product line items (Mandatory) ──
          products: products,

          // ── Shipment dimensions (Mandatory) ──
          shipment_length: "30",  // cm — typical fashion clothing parcel
          shipment_width: "25",   // cm
          shipment_height: "10",  // cm
          weight: "0.5",          // kg — default for apparel/clothing

          // ── Charges (Optional, send 0) ──
          shipping_charges: "0",
          giftwrap_charges: "0",
          transaction_charges: "0",
          total_discount: "0",
          first_attemp_discount: "0",
          cod_charges: "0",
          advance_amount: "0",

          // ── Payment ──
          payment_mode: paymentMode,           // "COD" or "Prepaid"
          cod_amount: isCOD ? String(order.totalAmount || 0) : "0",

          // ── Optional fields ──
          reseller_name: "",
          eway_bill_number: "",
          gst_number: "",
          what3words: "",

          // ── Return address (Mandatory per V3 docs) ──
          return_address_id: config.returnAddressId,
        },
      ],

      // ────────────────────────────────────────────────────────────────────
      // TOP-LEVEL data fields (per official V3 docs structure)
      // These go OUTSIDE shipments[], at the data{} level
      // ────────────────────────────────────────────────────────────────────

      // *Required: Pickup Warehouse ID from iThink dashboard
      pickup_address_id: config.pickupAddressId,

      // Auth credentials
      access_token: config.accessToken,
      secret_key: config.secretKey,

      // ── Shipment Service Type (Resolves: "Shipment Service Type field must be present") ──
      // Field name in iThink V3 docs: s_type (NOT service_type / shipment_type)
      // Valid values: "air" | "surface"
      // Default for clothing store: "surface" (ground/road shipping)
      s_type: "surface",

      // ── Order Type / Direction ──
      // Field name: order_type
      // Valid values: "forward" | "reverse"
      // Default for customer orders: "forward" (seller → customer)
      order_type: "forward",
    },
  };

  // Safe debug log — mask secrets
  const debugPayload = {
    ...payload,
    data: {
      ...payload.data,
      access_token: payload.data.access_token
        ? "***" + payload.data.access_token.substring(payload.data.access_token.length - 4)
        : "",
      secret_key: payload.data.secret_key
        ? "***" + payload.data.secret_key.substring(payload.data.secret_key.length - 4)
        : "",
    },
  };

  console.log(`[LOGISTICS] Starting iThink Logistics V3 sync for order: ${order.id}`);
  console.log("[LOGISTICS] Payload details:", JSON.stringify(debugPayload, null, 2));

  try {
    const response = await fetchWithRetry(
      `${config.baseUrl}/api_v3/order/add.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log(`[LOGISTICS] Response status: ${response.status}`);
    console.log("[LOGISTICS] Response body:", JSON.stringify(data, null, 2));

    // ── Parse iThink API V3 success response ──
    // Official V3 success body:
    //   { status: "success", status_code: 200,
    //     data: { "1": { status: "Success", waybill: "...", logistic_name: "...", refnum: "..." } } }
    //
    // IMPORTANT: In V3, the AWB key is "waybill" (NOT "awb_no").
    //            Courier name key is "logistic_name" (NOT "courier_name").
    //            The data is keyed by sequential index ("1", "2", ...) NOT by order ID.
    if (data.status === "success" || data.status_code === 200) {
      // Try sequential index "1" first (V3 standard), then fallback to order ID key
      const shipmentData =
        data.data?.["1"] ||
        data.data?.[order.id] ||
        // Last resort: grab first value of data object
        (data.data && typeof data.data === "object" && !Array.isArray(data.data)
          ? Object.values(data.data)[0] as any
          : null);

      // AWB key priority for V3: waybill → awb_no → awb_number → awb
      const awbNumber =
        shipmentData?.waybill ||
        shipmentData?.awb_no ||
        shipmentData?.awb_number ||
        shipmentData?.awb ||
        "";

      // Courier name priority for V3: logistic_name → courier_name → courier
      const courierName =
        shipmentData?.logistic_name ||
        shipmentData?.courier_name ||
        shipmentData?.courier ||
        "";

      const shipmentId =
        shipmentData?.shipment_id ||
        shipmentData?.refnum ||
        shipmentData?.order_id ||
        "";

      if (awbNumber) {
        const maskedAWB =
          String(awbNumber).substring(0, 4) + "****" + String(awbNumber).slice(-4);
        console.log(
          `[LOGISTICS] ✅ Shipment created. AWB: ${maskedAWB}, Courier: ${courierName}`
        );
        return {
          success: true,
          awbNumber: String(awbNumber),
          courierName: String(courierName),
          shipmentId: String(shipmentId),
        };
      }

      // API returned success status but no AWB
      const errorMsg =
        shipmentData?.remark ||
        shipmentData?.error ||
        shipmentData?.message ||
        data.html_message ||
        data.message ||
        "Order accepted but no AWB returned. Check iThink dashboard.";
      console.warn(
        "[LOGISTICS] No AWB in response. data.data:",
        JSON.stringify(data.data)
      );
      return {
        success: false,
        awbNumber: "",
        courierName: "",
        error: errorMsg,
      };
    }

    // Non-success status
    return {
      success: false,
      awbNumber: "",
      courierName: "",
      error: data.html_message || data.message || data.error || "iThink API returned failure status",
    };
  } catch (err: any) {
    console.error("[LOGISTICS] Error during shipment creation:", err);
    return {
      success: false,
      awbNumber: "",
      courierName: "",
      error: err.message || "Network error calling iThink API",
    };
  }
}

// ─── Track Shipment ───

export async function trackShipment(awbNumber: string): Promise<TrackingResult> {
  const config = getConfig();

  if (!awbNumber) {
    return {
      success: false,
      awbNumber: "",
      currentStatus: "",
      events: [],
      error: "AWB number is required",
    };
  }

  const payload = {
    data: {
      awb_number_list: awbNumber,
      access_token: config.accessToken,
      secret_key: config.secretKey,
    },
  };

  try {
    const response = await fetchWithRetry(
      `${config.baseUrl}/api_v3/order/track.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      2 // Fewer retries for tracking (non-critical)
    );

    const data = await response.json();

    if (data.status === "success" || data.status_code === 200) {
      const trackingData = data.data?.[awbNumber] || data.data;

      // Parse tracking events/scans
      const scans: TrackingEvent[] = [];
      const scanList =
        trackingData?.scans ||
        trackingData?.tracking_data ||
        trackingData?.packet_status ||
        [];

      if (Array.isArray(scanList)) {
        for (const scan of scanList) {
          scans.push({
            timestamp: scan.date_time || scan.timestamp || scan.date || "",
            status: scan.status || scan.scan_type || "",
            location: scan.location || scan.city || scan.scan_location || "",
            remark: scan.remark || scan.activity || scan.description || "",
          });
        }
      }

      const currentStatus =
        trackingData?.current_status ||
        trackingData?.status ||
        trackingData?.latest_status ||
        "";
      const courierName =
        trackingData?.logistic_name ||
        trackingData?.courier_name ||
        trackingData?.courier ||
        "";
      const expectedDelivery =
        trackingData?.expected_delivery_date ||
        trackingData?.edd ||
        "";

      return {
        success: true,
        awbNumber,
        currentStatus: String(currentStatus),
        expectedDelivery: expectedDelivery ? String(expectedDelivery) : undefined,
        courierName: courierName ? String(courierName) : undefined,
        events: scans,
      };
    }

    return {
      success: false,
      awbNumber,
      currentStatus: "",
      events: [],
      error: data.message || "Tracking lookup failed",
    };
  } catch (err: any) {
    return {
      success: false,
      awbNumber,
      currentStatus: "",
      events: [],
      error: err.message || "Network error fetching tracking data",
    };
  }
}

// ─── Cancel Shipment ───

export async function cancelShipment(awbNumber: string): Promise<CancelResult> {
  const config = getConfig();

  if (!awbNumber) {
    return { success: false, message: "", error: "AWB number is required" };
  }

  const payload = {
    data: {
      awb_numbers: awbNumber,
      access_token: config.accessToken,
      secret_key: config.secretKey,
    },
  };

  try {
    const response = await fetchWithRetry(
      `${config.baseUrl}/api_v3/order/cancel.json`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (data.status === "success" || data.status_code === 200) {
      return {
        success: true,
        message: data.message || "Shipment cancelled successfully",
      };
    }

    return {
      success: false,
      message: "",
      error: data.message || "Cancellation failed",
    };
  } catch (err: any) {
    return {
      success: false,
      message: "",
      error: err.message || "Network error during cancellation",
    };
  }
}

// ─── High-Level: Create Shipment for Order (with idempotency) ───
// Called after payment verification. Updates MongoDB with result.

export async function createShipmentForOrder(order: any): Promise<ShipmentResult> {
  // Idempotency guard: don't create duplicate shipments
  if (order.awbNumber && order.awbNumber.length > 0) {
    const maskedAWB = String(order.awbNumber).substring(0, 4) + "****" + String(order.awbNumber).substring(String(order.awbNumber).length - 4);
    console.log(
      `[LOGISTICS] Shipment already exists for order ${order.id} (AWB: ${maskedAWB}). Skipping.`
    );
    return {
      success: true,
      awbNumber: order.awbNumber,
      courierName: order.courierName || "",
      shipmentId: order.shipmentId || "",
    };
  }

  const result = await createShipment(order);

  // Update the order in MongoDB with the result
  try {
    await dbConnect();

    if (result.success) {
      await OrderModel.findOneAndUpdate(
        { id: order.id },
        {
          logisticsProvider: "iThink Logistics",
          shipmentId: result.shipmentId || "",
          awbNumber: result.awbNumber,
          courierName: result.courierName,
          trackingNumber: result.awbNumber, // Also update the legacy field
          shipmentStatus: "Booked",
          shipmentCreatedAt: new Date(),
          status: "Processing",
          logisticsError: "",
        }
      );
      const maskedAWB = String(result.awbNumber).substring(0, 4) + "****" + String(result.awbNumber).substring(String(result.awbNumber).length - 4);
      console.log(
        `✅ [LOGISTICS] Shipment created for order ${order.id} — AWB: ${maskedAWB}, Courier: ${result.courierName}`
      );
    } else {
      await OrderModel.findOneAndUpdate(
        { id: order.id },
        {
          logisticsError: result.error || "Shipment creation failed",
        }
      );
      console.error(
        `❌ [LOGISTICS] Shipment creation failed for order ${order.id}: ${result.error}`
      );
    }
  } catch (dbErr: any) {
    console.error(
      `❌ [LOGISTICS] Failed to update order ${order.id} after shipment creation:`,
      dbErr
    );
  }

  return result;
}

// ─── High-Level: Sync Tracking Status for Order ───
// Fetches live tracking from iThink and updates the order in MongoDB.

export async function syncTrackingForOrder(
  orderId: string,
  awbNumber: string
): Promise<TrackingResult> {
  const result = await trackShipment(awbNumber);

  if (result.success && result.currentStatus) {
    try {
      await dbConnect();

      const mappedStatus = mapIthinkStatusToOrderStatus(result.currentStatus);

      await OrderModel.findOneAndUpdate(
        { id: orderId },
        {
          shipmentStatus: result.currentStatus,
          status: mappedStatus,
          trackingUpdatedAt: new Date(),
          ...(result.courierName ? { courierName: result.courierName } : {}),
        }
      );
    } catch (dbErr: any) {
      console.error(
        `Failed to sync tracking for order ${orderId}:`,
        dbErr
      );
    }
  }

  return result;
}
