import type { Package } from "@/types";

export const mockPackages: Package[] = [
  {
    _id: "pkg_001",
    name: "Lunch Package",
    items: [
      { foodId: "food_005", qty: 1 },
      { foodId: "food_010", qty: 1 },
    ],
    price: 550,
    offerPrice: 499,
    offerNote: "Dupur Offer",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    _id: "pkg_002",
    name: "Burger Combo",
    items: [
      { foodId: "food_001", qty: 1 },
      { foodId: "food_012", qty: 1 },
    ],
    price: 450,
    image: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=500",
    active: true,
    createdAt: new Date().toISOString(),
  },
];
