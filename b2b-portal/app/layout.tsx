import type { Metadata } from 'next';
import './globals.css';
import { Poppins, Open_Sans } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-open-sans',
  display: 'swap',
});
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'B2B Portal',
  description: 'B2B productportal voor zakelijke klanten',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={`page-wrapper ${poppins.variable} ${openSans.variable}`}>
        <Header />
        <main className="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
