import type { Food } from "@/types";

export const mockFoods: Food[] = [
  { _id: "food_001", name: "Chicken Burger", category: "Burger", price: 320, image: "https://images.unsplash.com/photo-1568909344668-6f14a07b56a0?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_002", name: "Beef Cheese Burger", category: "Burger", price: 380, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_003", name: "Margherita Pizza", category: "Pizza", price: 650, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_004", name: "Pepperoni Pizza", category: "Pizza", price: 750, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_005", name: "Chicken Biryani", category: "Biryani", price: 450, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_006", name: "Mutton Biryani", category: "Biryani", price: 550, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=500", available: false, createdAt: new Date().toISOString() },
  { _id: "food_007", name: "Chocolate Cake", category: "Dessert", price: 220, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_008", name: "Chicken Shawarma", category: "Burger", price: 280, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_009", name: "BBQ Chicken Pizza", category: "Pizza", price: 800, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_010", name: "Kheer", category: "Dessert", price: 150, image: "https://images.unsplash.com/photo-1488477181946-64290103bb53?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_011", name: "Fried Rice with Chicken", category: "Biryani", price: 380, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_012", name: "Ice Cream Sundae", category: "Dessert", price: 180, image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500", available: true, createdAt: new Date().toISOString() },
  // ---- Drinks (pani + soft drinks + cha) — 250ml / 500ml alada item, dam alada ----
  { _id: "food_013", name: "Mineral Water 500ml", category: "Drinks", price: 20, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_014", name: "Coca-Cola 500ml", category: "Drinks", price: 40, image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_015", name: "Mojo 500ml", category: "Drinks", price: 40, image: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_016", name: "SevenUp 500ml", category: "Drinks", price: 40, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_017", name: "Fanta 500ml", category: "Drinks", price: 45, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_018", name: "Dudh Cha", category: "Drinks", price: 20, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_025", name: "Coca-Cola 250ml", category: "Drinks", price: 25, image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_026", name: "Mojo 250ml", category: "Drinks", price: 25, image: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_027", name: "SevenUp 250ml", category: "Drinks", price: 25, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_028", name: "Fanta 250ml", category: "Drinks", price: 30, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500", available: true, createdAt: new Date().toISOString() },
  // ---- Juice (fresh + lassi + shake) ----
  { _id: "food_019", name: "Fresh Orange Juice", category: "Juice", price: 80, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_020", name: "Mango Juice", category: "Juice", price: 100, image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_021", name: "Lemon-Mint Juice", category: "Juice", price: 60, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_022", name: "Mixed Fruit Juice", category: "Juice", price: 90, image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_023", name: "Sweet Lassi", category: "Juice", price: 70, image: "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=500", available: true, createdAt: new Date().toISOString() },
  { _id: "food_024", name: "Banana Milkshake", category: "Juice", price: 120, image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?w=500", available: true, createdAt: new Date().toISOString() },
];
