import { Inter } from "next/font/google";
import "./globals.css";
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/ReactToastify.min.css';
import 'react-photo-view/dist/react-photo-view.css';
import { GoogleAnalytics } from '@next/third-parties/google'


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "黑影胶片",
  description: "图床",
};



export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @media (prefers-color-scheme: dark) {
                html { background-color: #000; }
              }
              html { background-color: #f9fafb; }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
      <GoogleAnalytics gaId="G-JVKEXR5XSG" />
    </html>
  );
}
