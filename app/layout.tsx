import type { Metadata } from 'next';
import { Fira_Code } from 'next/font/google';
import './globals.css';

const firaCode = Fira_Code({
  variable: '--font-firacode',
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
        className={`${firaCode.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
