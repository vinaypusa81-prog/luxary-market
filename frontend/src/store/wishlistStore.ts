import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
  brand?: string;
  rating?: number;
  discount?: number;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  isWishlisted: (productId: string) => boolean;
  clearWishlist: () => void;
}

/**
 * Wishlist Store — Persisted Zustand store for wishlist management.
 */
export const useWishlistStore = create<WishlistState>()(
  devtools(
    persist(
      (set, get) => ({
        items: [],

        addItem: (item) => {
          const exists = get().items.some((i) => i.productId === item.productId);
          if (!exists) {
            set((state) => ({
              items: [...state.items, { ...item, addedAt: new Date().toISOString() }],
            }));
          }
        },

        removeItem: (productId) => {
          set((state) => ({
            items: state.items.filter((i) => i.productId !== productId),
          }));
        },

        toggleItem: (item) => {
          const exists = get().items.some((i) => i.productId === item.productId);
          if (exists) get().removeItem(item.productId);
          else get().addItem(item);
        },

        isWishlisted: (productId) => get().items.some((i) => i.productId === productId),

        clearWishlist: () => set({ items: [] }),
      }),
      { name: 'luxemarket-wishlist' }
    ),
    { name: 'WishlistStore' }
  )
);
