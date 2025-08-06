import './globals.css'

export const metadata = {
  title: 'Multimodal AI Agent',
  description: 'Upload PDFs and chat with AI using multimodal embeddings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
