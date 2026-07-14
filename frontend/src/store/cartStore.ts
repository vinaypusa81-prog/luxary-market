import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { persist, devtools } from 'zustand/middleware';

/* ── Types ────────────────────────────────────────────────── */
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
  quantity: number;
  size?: string;
  color?: string;
  sku: string;
  stock: number;
  sellerId?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  couponCode: string;
  couponDiscount: number;
  // Actions
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
}

/**
 * Cart Store — Zustand store with localStorage persistence.
 * Manages cart items, quantities, and coupon codes.
 */
export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        isOpen: false,
        couponCode: '',
        couponDiscount: 0,

        addItem: (newItem) => {
          const { items } = get();
          const key = `${newItem.productId}-${newItem.variantId || ''}`;

          const existing = items.find(
            (i) => `${i.productId}-${i.variantId || ''}` === key
          );

          if (existing) {
            // Increment quantity if item exists
            const newQty = Math.min(existing.quantity + (newItem.quantity || 1), existing.stock);
            set((state) => ({
              items: state.items.map((i) =>
                `${i.productId}-${i.variantId || ''}` === key
                  ? { ...i, quantity: newQty }
                  : i
              ),
              isOpen: true,
            }));
          } else {
            // Add new item
            set((state) => ({
              items: [
                ...state.items,
                {
                  ...newItem,
                  id: newItem.id || `${newItem.productId}-${newItem.variantId || ''}-${Date.now()}`,
                  quantity: newItem.quantity || 1,
                },
              ],
              isOpen: true,
            }));
          }
        },

        removeItem: (id) => {
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        },

        updateQuantity: (id, quantity) => {
          if (quantity <= 0) {
            get().removeItem(id);
            return;
          }
          set((state) => ({
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
            ),
          }));
        },

        clearCart: () => set({ items: [], couponCode: '', couponDiscount: 0 }),

        openCart: () => set({ isOpen: true }),
        closeCart: () => set({ isOpen: false }),
        toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

        applyCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),
        removeCoupon: () => set({ couponCode: '', couponDiscount: 0 }),
      }),
      {
        name: 'luxemarket-cart',
        // Only persist items and coupon data, not UI state
        partialize: (state) => ({
          items: state.items,
          couponCode: state.couponCode,
          couponDiscount: state.couponDiscount,
        }),
      }
    ),
    { name: 'CartStore' }
  )
);

/* ── Selectors ────────────────────────────────────────────── */
export const useCartTotal = () =>
  useCartStore(
    useShallow((state) => {
      const subtotal = state.items.reduce(
        (sum, item) => sum + (item.salePrice || item.price) * item.quantity,
        0
      );
      const discount = state.couponDiscount;
      const shipping = subtotal > 999 ? 0 : 79;
      const tax = (subtotal - discount) * 0.18;
      const total = subtotal - discount + shipping + tax;
      return { subtotal, discount, shipping, tax, total };
    })
  );

export const useCartItemCount = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0)
  );
