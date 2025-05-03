import { Inter } from 'next/font/google';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import './globals.css';

// Load Inter font with Latin subset
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Cloud Hosting',
  description: 'Cloud Hosting Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <NavBar key={children.key || 'navbar'} /> {/* Preserve key for re-rendering */}
        {children}
        <Footer />
      </body>
    </html>
  );
}