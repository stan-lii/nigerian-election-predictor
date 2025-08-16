export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div>
          <h1>Nigerian Election Predictor</h1>
          {children}
        </div>
      </body>
    </html>
  )
}
