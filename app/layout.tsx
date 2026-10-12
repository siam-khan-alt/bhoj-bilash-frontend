import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { RestaurantProvider } from "@/context/RestaurantContext";
import { LanguageProvider } from "@/context/LanguageContext";
import AppChrome from "@/components/layout/AppChrome";

export const metadata: Metadata = {
  title: "Bhoj Bilash — Bill & Hisab",
  description: "Bhoj Bilash er jonno simple bill + hisab",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-bg-main text-text-main font-sans antialiased transition-colors duration-300">
        <LanguageProvider>
        <ThemeProvider>
          <RestaurantProvider>
            <AuthProvider>
              <AppChrome>{children}</AppChrome>
              <Toaster position="top-right" />
            </AuthProvider>
          </RestaurantProvider>
        </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
