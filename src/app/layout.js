import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata = {
  title: "Inner Weather · Vnitřní počasí",
  description: "Krátký pohled na to, v jaké je období.",
  manifest: "/manifest.json",
  themeColor: "#221D27",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Inner Weather",
  },
  icons: {
    apple: "/icon-180.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body>
        <AuthProvider>{children}</AuthProvider>
        {/* Registrace Service Workeru pro PWA */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if('serviceWorker' in navigator){
                window.addEventListener('load',function(){
                  navigator.serviceWorker.register('/sw.js').catch(function(e){console.warn('SW:',e);});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}