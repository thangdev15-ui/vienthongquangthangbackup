"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  sku: string | null;
  price: number | null;
  salePrice: number | null;
  priceType: string;
  stock: number;
  qty: number;
};

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

type ShopCtx = {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (item: Omit<CartItem, "qty">, qty?: number, silent?: boolean) => void;
  updateQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  wishlist: string[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string, name?: string) => void;
  toasts: Toast[];
  toast: (message: string, type?: Toast["type"]) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
};

const Ctx = createContext<ShopCtx | null>(null);

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setCart(readLS<CartItem[]>("qt_cart", []));
    setWishlist(readLS<string[]>("qt_wishlist", []));
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("qt_cart", JSON.stringify(cart));
  }, [cart, hydrated]);
  useEffect(() => {
    if (hydrated) localStorage.setItem("qt_wishlist", JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const addToCart = useCallback(
    (item: Omit<CartItem, "qty">, qty = 1, silent = false) => {
      if (item.priceType !== "fixed" || item.price == null) {
        toast("Sản phẩm có giá \"Liên hệ\" — vui lòng gọi 0941.74.6161 để được báo giá.", "info");
        return;
      }
      setCart((prev) => {
        const found = prev.find((c) => c.productId === item.productId);
        if (found) {
          return prev.map((c) => (c.productId === item.productId ? { ...c, qty: Math.min(999, c.qty + qty) } : c));
        }
        return [...prev, { ...item, qty: Math.min(999, qty) }];
      });
      if (!silent) {
        toast("Đã thêm vào giỏ hàng.");
        setCartOpen(true);
      }
    },
    [toast],
  );

  const updateQty = useCallback((productId: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((c) => c.productId !== productId)
        : prev.map((c) => (c.productId === productId ? { ...c, qty: Math.min(999, qty) } : c)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((c) => c.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const isWishlisted = useCallback((id: string) => wishlist.includes(id), [wishlist]);
  const toggleWishlist = useCallback(
    (id: string, name?: string) => {
      setWishlist((prev) => {
        const on = prev.includes(id);
        toast(on ? "Đã bỏ khỏi danh sách yêu thích." : `Đã thêm${name ? ` "${name.slice(0, 40)}"` : ""} vào yêu thích.`, "info");
        return on ? prev.filter((x) => x !== id) : [...prev, id];
      });
    },
    [toast],
  );

  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((s, c) => s + ((c.salePrice ?? c.price) ?? 0) * c.qty, 0),
    [cart],
  );

  const value: ShopCtx = {
    cart,
    cartCount,
    cartSubtotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
    wishlist,
    isWishlisted,
    toggleWishlist,
    toasts,
    toast,
    cartOpen,
    setCartOpen,
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} />
    </Ctx.Provider>
  );
}

function ToastViewport({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null;
  const styles: Record<Toast["type"], string> = {
    success: "border-success-600/30 bg-success-50 text-success-700",
    error: "border-sale-500/30 bg-sale-50 text-sale-700",
    info: "border-brand-200 bg-brand-50 text-brand-800",
  };
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div key={t.id} className={`pointer-events-auto flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium shadow-lg animate-fade-up ${styles[t.type]}`}>
          <span className="max-w-[80vw]">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export function useShop(): ShopCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
