import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Medifold",
  description: "Personalized health tips and recommendations",
  generator: "v0.dev",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false} // Explicitly disable system theme preference if defaulting to light
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
