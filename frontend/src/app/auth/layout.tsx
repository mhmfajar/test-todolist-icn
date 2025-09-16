export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-dvh place-items-center bg-gray-50">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
