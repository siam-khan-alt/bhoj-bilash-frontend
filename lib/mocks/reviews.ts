import type { Review } from "@/types";

/** Demo seed — আসল কাস্টমার রিভিউ এলে এগুলো বদলে যাবে। */
export const mockReviews: Review[] = [
  {
    _id: "rev_001",
    name: "রহিম উদ্দিন",
    rating: 5,
    text: "বিরিয়ানিটা গরম গরম পেয়েছি, মাংস একদম নরম ছিল। এই দামে এর চেয়ে ভালো আর হয় না।",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "rev_002",
    name: "শারমিন আক্তার",
    rating: 5,
    text: "বাচ্চাদের নিয়ে বসে খেয়েছি। ওয়েটার ভাই খুব আন্তরিক, খাবারও তাড়াতাড়ি এসেছে।",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: "rev_003",
    name: "কামাল হোসেন",
    rating: 4,
    text: "পার্সেল নিয়েছিলাম, প্যাকেজিং ভালো ছিল। শুক্রবার ভিড়ের সময় একটু দেরি হয়।",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
