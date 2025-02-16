import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import localFont from "next/font/local";
import "./globals.css";
import '@/styles/auth.scss'
import { ServiceProvider } from '@/contexts/ServiceContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import { initializeUploadDirectories } from '@/lib/init';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import NextAuthProvider from '@/components/providers/SessionProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import { headers } from 'next/headers';
import '@/styles/calendar.css'
import 'react-day-picker/dist/style.css';
import { TemplateProvider } from '@/contexts/TemplateContext';
import { Toaster } from "@/components/ui/toaster"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Legal Services Platform",
  description: "Professional legal services management platform",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const session = await getServerSession(authOptions);

    return (
      <html lang="en" suppressHydrationWarning>
        <head>
          <link 
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" 
            rel="stylesheet" 
          />
          <link 
            rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
            integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
            crossOrigin="anonymous" 
            referrerPolicy="no-referrer" 
          />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
            <NextAuthProvider session={session}>
              <AuthProvider>
                <NotificationProvider>
                  <ServiceProvider>
                    <ThemeProvider
                      attribute="class"
                      defaultTheme="system"
                      enableSystem
                      disableTransitionOnChange
                    >
                      <LanguageProvider>
                        <TemplateProvider>
                          {children}
                        </TemplateProvider>
                      </LanguageProvider>
                    </ThemeProvider>
                  </ServiceProvider>
                </NotificationProvider>
              </AuthProvider>
            </NextAuthProvider>
          </ErrorBoundary>
          <Toaster />
        </body>
      </html>
    );
  } catch (error) {
    console.error('Root layout error:', error);
    return (
      <html lang="en">
        <body>
          <ErrorBoundary fallback={<div>Something went wrong</div>}>
            {children}
          </ErrorBoundary>
        </body>
      </html>
    );
  }
}
