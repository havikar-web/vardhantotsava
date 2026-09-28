import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vardhantotsava | Mantrakshata - Sacred Vedic Birthday Celebrations',
  description: 'Authentic Vedic birthday and milestone celebrations (Vardhantotsava) in Bengaluru with initiated Acharya home rituals, sacred Ayushya Homa, and consecrated Mantrakshata.',
  metadataBase: new URL('https://www.mantrakshata.com'),
  icons: {
    icon: '/assets/official-logo.webp'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ivory text-charcoal font-sans antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
