import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  title: 'Articleship Masterclass | The Umbrella Network',
  description:
    'A practical 6-day Articleship Masterclass for CA students covering CV building, applications, domain selection, interviews, LinkedIn, HR communication and more.',
  metadataBase: new URL('https://umbrellanetwork.in'),
  openGraph: {
    type: 'website',
    title: 'Articleship Masterclass | The Umbrella Network',
    description:
      'A practical 6-day Articleship Masterclass for CA students covering CV building, applications, domain selection, interviews, LinkedIn, HR communication and more.',
    siteName: 'The Umbrella Network',
    images: [{ url: '/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Articleship Masterclass | The Umbrella Network',
    description:
      "Don't just apply everywhere. Build the right strategy for your CA articleship with our 6-day Masterclass.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: '6-Day CA Articleship Masterclass',
    description:
      'A practical 6-day masterclass to help CA students approach their articleship search with the right CV, strategy, communication, and interview preparation.',
    provider: {
      '@type': 'Organization',
      name: 'The Umbrella Network',
      sameAs: 'https://www.linkedin.com/in/ca-harsh-kaushik/',
    },
    offers: {
      '@type': 'Offer',
      price: '999',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online',
      duration: 'P6D',
    },
  };

  return (
    <html lang="en" className={`scroll-smooth ${plusJakartaSans.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="bg-slate-50 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
