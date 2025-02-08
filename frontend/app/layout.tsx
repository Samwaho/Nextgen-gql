import type { Metadata } from "next";
import "./globals.css";

import TanstackProvider from "@/providers/TanstackProvider";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/providers/ThemeProvider";
import { ApolloProvider } from "@/providers/ApolloProvider";

export const metadata: Metadata = {
  title: "NetGN - ISP Management System",
  description: "A comprehensive system for managing Internet Service Provider operations, customers, stations, and services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-body_light dark:bg-body_dark">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ApolloProvider>
            <TanstackProvider>
              {children}
              <Toaster
                toastOptions={{
                  classNames: {
                    error:
                      "text-rose-600 bg-card_light dark:bg-card_dark border-none",
                    success:
                      "text-green-600 bg-card_light dark:bg-card_dark border-none",
                    warning: "text-yellow-400 bg-card_light dark:bg-card_dark",
                    info: "text-sky-600 bg-card_light dark:bg-card_dark",
                  },
                }}
              />
            </TanstackProvider>
          </ApolloProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
