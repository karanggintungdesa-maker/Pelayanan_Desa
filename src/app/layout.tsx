
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { FaviconManager } from '@/components/favicon-manager';
import { PT_Sans } from 'next/font/google';

// Menggunakan Next.js Font untuk menghindari masalah CORS pada pengunduhan gambar
const ptSans = PT_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'PELAYANAN DESA KARANGGINTUNG',
  description: 'Aplikasi Pelayanan Publik Desa Karanggintung',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${ptSans.variable} font-body antialiased`}>
        <FirebaseClientProvider>
          <FaviconManager />
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
