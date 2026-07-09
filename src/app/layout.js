import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "Inner Weather · Vnitřní počasí",
  description: "Krátký pohled na to, v jaké je období.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}