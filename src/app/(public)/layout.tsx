export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-primary md:bg-secondary p-0 md:p-4">
      {children}
    </main>
  );
}