import './globals.css';
import Footer from '@app/components/Layout/Footer';
import Header from '@app/components/Layout/Header';
import Script from 'next/script';

export const revalidate = 60;

export const metadata = {
  metadataBase: new URL(process.env.APP_URL || 'http://localhost:3000'),
  title: {
    default: 'ProfVote — Professor:innen anonym bewerten',
    template: '%s · ProfVote',
  },
  description:
    'Anonyme, verifizierte Bewertungen von Professor:innen an deutschen Universitäten. Stuttgart, KIT und mehr.',
  openGraph: {
    title: 'ProfVote',
    description: 'Anonyme Professor:innen-Bewertungen für deutsche Unis.',
    type: 'website',
    locale: 'de_DE',
    siteName: 'ProfVote',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

const themeInitScript = `(function(){try{var m=localStorage.getItem('theme')||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <Header />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
