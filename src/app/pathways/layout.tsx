export default function PathwaysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 md:py-16">
      {children}
    </div>
  );
}
