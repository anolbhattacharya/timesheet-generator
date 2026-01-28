import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Lab Timesheet Generator',
  description: 'Generate randomised timesheet entries for the AI Lab team',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
