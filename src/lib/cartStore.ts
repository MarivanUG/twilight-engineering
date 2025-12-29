import { create } from 'zustand';
import type { Product, CartItem } from '../types';

interface CartState {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  setIsCartOpen: (isOpen: boolean) => void;
  toggleCart: () => void;
  cartItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  isCartOpen: false,
  addToCart: (product: Product) =>
    set((state) => {
      const existing = state.cartItems.find((item) => item.id === product.id);
      if (existing) {
        return {
          cartItems: state.cartItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return { cartItems: [...state.cartItems, { ...product, quantity: 1 }] };
    }),
  removeFromCart: (id: string | number) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== id),
    })),
  updateQuantity: (id: string | number, quantity: number) => {
    if (quantity < 1) return;
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  },
  setIsCartOpen: (isOpen: boolean) => set({ isCartOpen: isOpen }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  cartItemCount: () => {
    return get().cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }
}));
