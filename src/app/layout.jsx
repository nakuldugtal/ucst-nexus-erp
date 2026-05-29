import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });

export const metadata = {
  title: 'UCST Nexus ERP',
  description: 'Premium university ERP and student management portal for UCST College.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className="font-[var(--font-space)] bg-background text-foreground">
        <div className="min-h-screen bg-mesh-dark">{children}</div>
      </body>
    </html>
  );
}