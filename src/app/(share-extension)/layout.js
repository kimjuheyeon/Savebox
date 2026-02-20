export default function ShareExtensionLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-900 flex justify-center">
      <div className="relative w-full max-w-[440px]">
        {children}
      </div>
    </div>
  );
}
