import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nigerian Election Predictor',
  description: 'ML-powered Nigerian presidential election prediction platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">
                    🇳🇬 Nigerian Election Predictor
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Powered by Machine Learning
                  </span>
                </div>
              </div>
            </div>
          </nav>
          <main>{children}</main>
          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-gray-500 text-sm">
                © 2024 Nigerian Election Predictor. Built with Next.js and TensorFlow.js
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
