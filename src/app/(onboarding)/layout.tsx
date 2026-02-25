import Image from "next/image";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-10">
        <Image
          src="/logo.svg"
          alt="Deltra"
          width={108}
          height={29}
          className="dark:invert"
          priority
        />
      </div>
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
