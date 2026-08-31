import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Nook — Full-Stack Developer',
  description: 'Full-stack developer crafting thoughtful interfaces and resilient systems.',
  openGraph: {
    title: 'Nook — Full-Stack Developer',
    description: 'Thoughtful interfaces. Resilient systems.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Nook — Full-Stack Developer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nook — Full-Stack Developer',
    description: 'Thoughtful interfaces. Resilient systems.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
