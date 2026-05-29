import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'WeatherScope — AI Engineer Intern Assessment',
  description: 'Full-stack weather app by Zhiliang Wang — PM Accelerator Technical Assessment',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  );
}
