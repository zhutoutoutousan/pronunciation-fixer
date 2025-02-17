import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Free English Pronunciation Practice Tool | Stellar Pronunciation Hero',
  description: 'Free AI-powered English pronunciation practice tool. Get instant feedback, IPA transcriptions, and improvement tips. No sign-up required.',
  keywords: [
    'free pronunciation tool',
    'english pronunciation practice',
    'pronunciation feedback',
    'learn english pronunciation',
    'IPA transcription',
    'speech recognition',
    'pronunciation AI',
    'free english learning',
    'pronunciation checker',
    'speak english better'
  ],
  openGraph: {
    title: 'Free English Pronunciation Practice Tool',
    description: 'Practice your English pronunciation with AI feedback - completely free, no sign-up needed.',
    type: 'website',
    locale: 'en_US',
    url: 'https://pronunciation.namelos.xyz',
    siteName: 'Stellar Pronunciation Hero',
    images: [{
      url: '/og-image.jpg', // You'll need to add this image
      width: 1200,
      height: 630,
      alt: 'Stellar Pronunciation Hero - Free English Pronunciation Practice'
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free English Pronunciation Practice Tool',
    description: 'Get instant AI feedback on your English pronunciation - 100% free',
    images: ['/og-image.jpg'], // Same image as OG
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add this when you have it
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://pronunciation.namelos.xyz" />
        {/* Schema.org markup for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Stellar Pronunciation Hero",
              "description": "Free AI-powered English pronunciation practice tool with instant feedback.",
              "url": "https://pronunciation.namelos.xyz",
              "applicationCategory": "EducationalApplication",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "Instant pronunciation feedback",
                "IPA transcription",
                "AI-powered analysis",
                "No registration required",
                "Free to use",
                "30-second audio support"
              ]
            })
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
