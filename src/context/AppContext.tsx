"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  images: string[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
  isBestSeller: boolean;
  isFastSelling: boolean;
  isSale: boolean;
  fabric: string;
  description: string;
  careInstructions: string;
  shippingInfo: string;
  returnPolicy: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Address {
  fullName: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: string;
  shippingCost: number;
  tax: number;
  discountAmount: number;
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  trackingNumber: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: "customer" | "admin";
  addresses: Address[];
  wishlist: string[]; // Product IDs
  token?: string; // Authentication token for API requests
}

export interface HeroImage {
  _id?: string;
  desktopImage: string;
  mobileImage: string;
  order: number;
}

interface AppContextType {
  products: Product[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  users: User[];
  session: User | null;
  coupon: string | null;
  discountRate: number;
  
  // Cart Actions
  addToCart: (product: Product, size: string, color: string, qty?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateCartQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist Actions
  toggleWishlist: (productId: string) => Promise<void>;

  // Order Actions
  placeOrder: (shippingAddress: Address, paymentMethod: string, paymentStatus?: string) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;

  // User Actions
  signUp: (fullName: string, email: string, password: string, role?: string) => Promise<{ success: boolean; message: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; code?: string | null; user?: User }>;
  logout: () => void;
  updateProfile: (fullName: string, email: string) => Promise<{ success: boolean; message: string }>;
  addAddress: (address: Address) => Promise<void>;
  removeAddress: (index: number) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;

  // Admin Actions
  addProduct: (productData: Omit<Product, "id" | "rating" | "reviewCount">) => Promise<void>;
  editProduct: (productId: string, updatedData: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;

  // Hero Image Slider Actions
  heroImages: HeroImage[];
  addHeroImage: (desktopImage: string, mobileImage: string) => Promise<void>;
  editHeroImage: (id: string, updatedData: Partial<HeroImage>) => Promise<void>;
  deleteHeroImage: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_USERS: User[] = [
  {
    id: "admin",
    fullName: "Sanaya Admin",
    email: "admin@sanaya.com",
    password: "adminpassword",
    role: "admin",
    addresses: [],
    wishlist: []
  },
  {
    id: "admin_sabeer",
    fullName: "Sabeer Admin",
    email: "sabeersalotgi@gmail.com",
    password: "adminpassword",
    role: "admin",
    addresses: [],
    wishlist: []
  },
  {
    id: "customer1",
    fullName: "Aanya Verma",
    email: "aanya@gmail.com",
    password: "userpassword",
    role: "customer",
    addresses: [
      {
        fullName: "Aanya Verma",
        addressLine: "Flat 402, Lotus Residency, MG Road",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        phone: "7021366239"
      }
    ],
    wishlist: []
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [session, setSession] = useState<User | null>(null);
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [coupon, setCoupon] = useState<string | null>(null);
  const [discountRate, setDiscountRate] = useState<number>(0);

  // Helper to run fetch requests with Authorization token in headers
  const authenticatedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    let activeToken = session?.token;
    if (!activeToken && typeof window !== "undefined") {
      const sessionData = localStorage.getItem("sanaya_session");
      if (sessionData) {
        try {
          const parsed = JSON.parse(sessionData);
          activeToken = parsed.token;
        } catch (_) {}
      }
    }

    const headers = new Headers(options.headers);
    if (activeToken) {
      headers.set("Authorization", `Bearer ${activeToken}`);
    }

    return fetch(url, {
      ...options,
      headers
    });
  }, [session?.token]);

  // Sync state with API on mount and fallback to localStorage/seed data
  useEffect(() => {
    const loadData = async () => {
      try {
        let storedSession: User | null = null;
        if (typeof window !== "undefined") {
          const sessionData = localStorage.getItem("sanaya_session");
          if (sessionData) {
            storedSession = JSON.parse(sessionData);
          }
        }

        // Fetch products (public catalog)
        const resProducts = await fetch("/api/products");
        if (resProducts.ok) {
          const data = await resProducts.json();
          if (Array.isArray(data)) {
            setProducts(data);
          }
        }

        if (storedSession) {
          setSession(storedSession);
          setWishlist(storedSession.wishlist || []);

          // Verify session is still valid by fetching profile
          const resProfile = await authenticatedFetch(`/api/users/${storedSession.id}`);
          if (resProfile.ok) {
            const latestUser = await resProfile.json();
            if (latestUser) {
              const updatedSession = { ...storedSession, ...latestUser };
              delete updatedSession.password;
              setSession(updatedSession);
              saveToLocalStorage("sanaya_session", updatedSession);
            }

            // Session is valid — fetch orders
            const resOrders = await authenticatedFetch("/api/orders");
            if (resOrders.ok) {
              const data = await resOrders.json();
              if (Array.isArray(data)) {
                setOrders(data);
              }
            }

            // Fetch user registry only for administrators
            if (storedSession.role === "admin") {
              const resUsers = await authenticatedFetch("/api/users");
              if (resUsers.ok) {
                const data = await resUsers.json();
                if (Array.isArray(data)) {
                  setUsers(data);
                }
              }
            }
          } else if (resProfile.status === 401 || resProfile.status === 403) {
            // Server rejected the session — cookies expired or missing.
            // Clear stale localStorage session so user is prompted to log in again.
            console.warn("Session expired or invalid. Clearing local session.");
            setSession(null);
            setWishlist([]);
            if (typeof window !== "undefined") {
              localStorage.removeItem("sanaya_session");
              localStorage.removeItem("sanaya_wishlist");
            }
          }
        }
      } catch (error) {
        console.error("Failed to load initial data from APIs", error);
      }
    };
    loadData();

    // Fetch hero images asynchronously without blocking main data load
    const loadHeroImages = async () => {
      try {
        const resHeroImages = await fetch("/api/hero-images");
        if (resHeroImages.ok) {
          const data = await resHeroImages.json();
          if (Array.isArray(data)) {
            setHeroImages(data);
          }
        }
      } catch (error) {
        console.error("Failed to load hero images asynchronously", error);
      }
    };
    loadHeroImages();

    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("sanaya_cart");
      const storedWishlist = localStorage.getItem("sanaya_wishlist");
      const storedSession = localStorage.getItem("sanaya_session");

      if (storedCart) setCart(JSON.parse(storedCart));
      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      if (storedSession) {
        const parsedSession = JSON.parse(storedSession);
        setSession(parsedSession);
        setWishlist(parsedSession.wishlist || []);
      }
    }
  }, [authenticatedFetch]);

  // Save changes to localStorage helper
  const saveToLocalStorage = (key: string, value: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  // Cart Actions
  const addToCart = (product: Product, size: string, color: string, qty: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      let newCart;
      if (existingItemIndex > -1) {
        newCart = [...prevCart];
        newCart[existingItemIndex].quantity += qty;
      } else {
        newCart = [...prevCart, { product, quantity: qty, selectedSize: size, selectedColor: color }];
      }

      saveToLocalStorage("sanaya_cart", newCart);
      return newCart;
    });
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
          )
      );
      saveToLocalStorage("sanaya_cart", newCart);
      return newCart;
    });
  };

  const updateCartQty = (productId: string, size: string, color: string, qty: number) => {
    setCart((prevCart) => {
      const newCart = prevCart.map((item) => {
        if (
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
        ) {
          return { ...item, quantity: Math.max(1, qty) };
        }
        return item;
      });
      saveToLocalStorage("sanaya_cart", newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
    setDiscountRate(0);
    saveToLocalStorage("sanaya_cart", []);
  };

  const applyCoupon = (code: string) => {
    const uppercaseCode = code.toUpperCase();
    if (uppercaseCode === "WELCOME10") {
      setCoupon(uppercaseCode);
      setDiscountRate(0.10); // 10% off
      return { success: true, message: "Promo code 'WELCOME10' applied successfully! You saved 10%." };
    } else if (uppercaseCode === "SANAYA20") {
      setCoupon(uppercaseCode);
      setDiscountRate(0.20); // 20% off
      return { success: true, message: "Promo code 'SANAYA20' applied successfully! You saved 20%." };
    }
    return { success: false, message: "Invalid coupon code. Try 'WELCOME10' or 'SANAYA20'." };
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscountRate(0);
  };

  // Wishlist Actions
  const toggleWishlist = async (productId: string) => {
    let newWishlist: string[];
    if (wishlist.includes(productId)) {
      newWishlist = wishlist.filter((id) => id !== productId);
    } else {
      newWishlist = [...wishlist, productId];
    }

    setWishlist(newWishlist);
    saveToLocalStorage("sanaya_wishlist", newWishlist);

    // If user logged in, sync to user's profile
    if (session) {
      const updatedUser = { ...session, wishlist: newWishlist };
      setSession(updatedUser);
      saveToLocalStorage("sanaya_session", updatedUser);

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === session.id ? { ...u, wishlist: newWishlist } : u))
      );

      try {
        await authenticatedFetch(`/api/users/${session.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wishlist: newWishlist })
        });
      } catch (error) {
        console.error("Failed to update wishlist on backend", error);
      }
    }
  };

  // Order Actions
  const placeOrder = async (shippingAddress: Address, paymentMethod: string, paymentStatus?: string) => {
    if (cart.length === 0) return null;

    // Subtotal
    const subtotal = cart.reduce((acc, item) => acc + item.product.salePrice * item.quantity, 0);
    const discountAmount = Math.round(subtotal * discountRate);
    const gstRate = 0.18; // 18% GST
    const tax = Math.round((subtotal - discountAmount) * gstRate);
    const shippingCost = subtotal - discountAmount > 2000 ? 0 : 150;
    const totalAmount = subtotal - discountAmount + tax + shippingCost;

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: session?.id || "guest", // Link order to session user ID for secure dashboard filters
      date: new Date().toISOString().split("T")[0],
      items: [...cart],
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || (paymentMethod === "Cash On Delivery (COD)" ? "Pending" : "Paid"),
      shippingCost,
      tax,
      discountAmount,
      totalAmount,
      status: "Pending",
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    };

    try {
      const res = await authenticatedFetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder)
      });
      if (res.ok) {
        const savedOrder = await res.json();
        setOrders((prevOrders) => [savedOrder, ...prevOrders]);
        if (newOrder.paymentStatus !== "Pending" || paymentMethod === "Cash On Delivery (COD)") {
          clearCart();
        }
        return savedOrder;
      }
    } catch (error) {
      console.error("Failed to place order on backend", error);
    }
    return null;
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const res = await authenticatedFetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.id === orderId ? updated : o))
        );
      }
    } catch (error) {
      console.error("Failed to update order status on backend", error);
    }
  };

  // User Actions
  const signUp = async (fullName: string, email: string, password: string, role: string = "customer") => {
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Failed to create account" };
      }

      setUsers((prevUsers) => [...prevUsers, data]);

      // Log the user in immediately
      const sessionUser = { ...data };
      delete sessionUser.password;
      setSession(sessionUser);
      setWishlist([]);
      saveToLocalStorage("sanaya_session", sessionUser);

      // Instantly fetch user orders
      const resOrders = await authenticatedFetch("/api/orders");
      if (resOrders.ok) {
        const ordersData = await resOrders.json();
        if (Array.isArray(ordersData)) setOrders(ordersData);
      }

      return { success: true, message: "Account created successfully!" };
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to connect to backend" };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || "Invalid email or password.", code: data.code || null };
      }

      // Set Session
      setSession(data);
      setWishlist(data.wishlist || []);
      saveToLocalStorage("sanaya_session", data);

      // Fetch user's orders immediately after logging in
      const resOrders = await authenticatedFetch("/api/orders");
      if (resOrders.ok) {
        const ordersData = await resOrders.json();
        if (Array.isArray(ordersData)) setOrders(ordersData);
      }

      // Fetch user list if admin
      if (data.role === "admin") {
        const resUsers = await authenticatedFetch("/api/users");
        if (resUsers.ok) {
          const usersData = await resUsers.json();
          if (Array.isArray(usersData)) setUsers(usersData);
        }
      }

      return { success: true, message: `Welcome back, ${data.fullName}!`, user: data };
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to connect to backend", code: null };
    }
  };

  const logout = async () => {
    try {
      // Clear secure cookies on backend (as fallback)
      await authenticatedFetch("/api/users/logout", { method: "POST" });
    } catch (error) {
      console.error("Failed to run logout api", error);
    }
    setSession(null);
    setWishlist([]);
    setOrders([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sanaya_session");
      localStorage.removeItem("sanaya_wishlist");
    }
  };

  const updateProfile = async (fullName: string, email: string) => {
    if (!session) return { success: false, message: "No active session." };

    try {
      const res = await authenticatedFetch(`/api/users/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email })
      });
      if (res.ok) {
        const updated = await res.json();
        const sessionUser = { ...updated };
        delete sessionUser.password;
        setSession(sessionUser);
        saveToLocalStorage("sanaya_session", sessionUser);

        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === session.id ? updated : u))
        );
        return { success: true, message: "Profile updated successfully!" };
      }
      return { success: false, message: "Failed to update profile." };
    } catch (error: any) {
      return { success: false, message: error.message || "Failed to connect to backend" };
    }
  };

  const addAddress = async (address: Address) => {
    if (!session) return;
    const updatedAddresses = [...session.addresses, address];
    
    try {
      const res = await authenticatedFetch(`/api/users/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses })
      });
      if (res.ok) {
        const updated = await res.json();
        const sessionUser = { ...updated };
        delete sessionUser.password;
        setSession(sessionUser);
        saveToLocalStorage("sanaya_session", sessionUser);

        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === session.id ? updated : u))
        );
      }
    } catch (error) {
      console.error("Failed to add address on backend", error);
    }
  };

  const removeAddress = async (index: number) => {
    if (!session) return;
    const updatedAddresses = session.addresses.filter((_, idx) => idx !== index);

    try {
      const res = await authenticatedFetch(`/api/users/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addresses: updatedAddresses })
      });
      if (res.ok) {
        const updated = await res.json();
        const sessionUser = { ...updated };
        delete sessionUser.password;
        setSession(sessionUser);
        saveToLocalStorage("sanaya_session", sessionUser);

        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === session.id ? updated : u))
        );
      }
    } catch (error) {
      console.error("Failed to remove address on backend", error);
    }
  };

  const forgotPassword = async (email: string) => {
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: true, message: "A password reset link has been sent to your registered email address." };
    }
    return { success: false, message: "Email address not found. Please try again." };
  };

  // Admin Actions
  const addProduct = async (productData: Omit<Product, "id" | "rating" | "reviewCount">) => {
    try {
      const res = await authenticatedFetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData)
      });
      if (res.ok) {
        const savedProduct = await res.json();
        setProducts((prevProducts) => [savedProduct, ...prevProducts]);
      }
    } catch (error) {
      console.error("Failed to add product on backend", error);
    }
  };

  const editProduct = async (productId: string, updatedData: Partial<Product>) => {
    try {
      const res = await authenticatedFetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts((prevProducts) =>
          prevProducts.map((p) => (p.id === productId ? updatedProduct : p))
        );
      }
    } catch (error) {
      console.error("Failed to edit product on backend", error);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const res = await authenticatedFetch(`/api/products/${productId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
      }
    } catch (error) {
      console.error("Failed to delete product on backend", error);
    }
  };

  const addHeroImage = async (desktopImage: string, mobileImage: string) => {
    try {
      const res = await authenticatedFetch("/api/hero-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desktopImage, mobileImage }),
      });
      if (res.ok) {
        const saved = await res.json();
        setHeroImages((prev) => [...prev, saved]);
      }
    } catch (error) {
      console.error("Failed to add hero image on backend", error);
    }
  };

  const deleteHeroImage = async (id: string) => {
    try {
      const res = await authenticatedFetch(`/api/hero-images/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHeroImages((prev) => prev.filter((img) => img._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete hero image on backend", error);
    }
  };

  const editHeroImage = async (id: string, updatedData: Partial<HeroImage>) => {
    try {
      const res = await authenticatedFetch(`/api/hero-images/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        const updated = await res.json();
        setHeroImages((prev) =>
          prev.map((img) => (img._id === id ? updated : img))
        );
      }
    } catch (error) {
      console.error("Failed to edit hero image on backend", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        cart,
        wishlist,
        orders,
        users,
        session,
        coupon,
        discountRate,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        applyCoupon,
        removeCoupon,
        toggleWishlist,
        placeOrder,
        updateOrderStatus,
        signUp,
        login,
        logout,
        updateProfile,
        addAddress,
        removeAddress,
        forgotPassword,
        addProduct,
        editProduct,
        deleteProduct,
        heroImages,
        addHeroImage,
        editHeroImage,
        deleteHeroImage
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
