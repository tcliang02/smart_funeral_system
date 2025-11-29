import type { Metadata } from 'next';
import '../index.css';
import ClientAuthProvider from './ClientAuthProvider';
import FloatingChatbot from '../components/FloatingChatbot';
import FeedbackButton from '../components/FeedbackButton';

// Force dynamic rendering for all pages to prevent useAuth prerendering errors
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'ZENLINK',
  description: 'Comprehensive funeral service management platform',
  icons: {
    icon: '/images/zenlink logo.png',
    shortcut: '/images/zenlink logo.png',
    apple: '/images/zenlink logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientAuthProvider>
          {children}
          <FloatingChatbot />
          <FeedbackButton />
        </ClientAuthProvider>
      </body>
    </html>
  );
}

