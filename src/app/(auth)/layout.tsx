import { BrandMark } from "@/components/brand/brand-mark";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="min-h-screen bg-paper lg:grid lg:grid-cols-[minmax(22rem,0.85fr)_1.15fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="technical-grid absolute inset-0 opacity-15" />
        <BrandMark
          priority
          className="relative z-10 self-start bg-white px-4 py-3 text-ink"
        />
        <div className="relative z-10 max-w-lg">
          <p className="font-mono text-xs tracking-[0.18em] text-yaye-teal uppercase">
            Yaye Tech learning division
          </p>
          <p className="mt-5 text-4xl leading-tight font-semibold tracking-[-0.025em]">
            Training the people who build the future.
          </p>
          <div className="mt-10 grid grid-cols-3 border-y border-white/15 py-4 font-mono text-[0.62rem] tracking-[0.12em] text-white/60 uppercase">
            <span>Learn</span>
            <span>Practice</span>
            <span>Prove</span>
          </div>
        </div>
      </aside>
      <section className="grid min-h-screen place-items-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <BrandMark className="mb-10 text-ink lg:hidden" />
          {children}
        </div>
      </section>
    </main>
  );
}
