"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = { productId: string; name: string; slug: string; sku: string; price: number; imageUrl: string; quantity: number };
type CartContextValue = { items: CartLine[]; addItem: (item: Omit<CartLine, "quantity">) => void; updateQuantity: (productId: string, quantity: number) => void; removeItem: (productId: string) => void; clearCart: () => void; count: number; subtotal: number };
const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "eh-fabrics-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved) as CartLine[]);
    } catch { window.localStorage.removeItem(STORAGE_KEY); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((item: Omit<CartLine, "quantity">) => {
    setItems((current) => {
      const found = current.find((line) => line.productId === item.productId);
      if (found) return current.map((line) => line.productId === item.productId ? { ...line, quantity: Math.min(line.quantity + 1, 10) } : line);
      return [...current, { ...item, quantity: 1 }];
    });
  }, []);
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) { setItems((current) => current.filter((line) => line.productId !== productId)); return; }
    setItems((current) => current.map((line) => line.productId === productId ? { ...line, quantity: Math.min(quantity, 10) } : line));
  }, []);
  const removeItem = useCallback((productId: string) => setItems((current) => current.filter((line) => line.productId !== productId)), []);
  const clearCart = useCallback(() => setItems([]), []);
  const value = useMemo(() => ({
    items, addItem, updateQuantity, removeItem, clearCart,
    count: items.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: items.reduce((sum, line) => sum + line.price * line.quantity, 0),
  }), [items, addItem, updateQuantity, removeItem, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider.");
  return value;
}
