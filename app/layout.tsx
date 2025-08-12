import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Markdown Converter',
  description: 'Convert markdown files to HTML, JSON, and plain text formats securely',
  keywords: 'markdown, converter, HTML, JSON, text, file conversion',
  authors: [{ name: 'Markdown Converter' }],
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-dark-950 via-navy-950 to-dark-950">
          {children}
        </div>
      </body>
    </html>
  )
}
