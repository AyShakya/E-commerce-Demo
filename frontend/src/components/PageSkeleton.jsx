export function ProductDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-[#080808] text-white animate-pulse">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 xl:px-16 py-8">
        <div className="h-3 w-40 bg-white/10 rounded mb-8" />
        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 xl:gap-20">
          <div className="lg:col-span-7">
            <div className="min-h-[360px] md:min-h-[560px] bg-white/10 border border-white/10" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <div className="h-3 w-28 bg-white/10 rounded" />
            <div className="h-12 w-3/4 bg-white/10 rounded" />
            <div className="h-8 w-1/2 bg-white/10 rounded" />
            <div className="h-20 w-full bg-white/10 rounded" />
            <div className="h-px w-full bg-white/10" />
            <div className="h-12 w-full bg-white/10 rounded" />
            <div className="h-12 w-full bg-white/10 rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function CartPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#080808] text-white animate-pulse">
      <div className="max-w-[1400px] mx-auto px-8 md:px-12 py-20 space-y-12">
        <div className="flex flex-col items-center gap-5">
          <div className="h-3 w-32 bg-white/10 rounded" />
          <div className="h-16 w-64 bg-white/10 rounded" />
          <div className="h-px w-20 bg-white/10" />
        </div>
        <div className="grid lg:grid-cols-12 gap-12">
          <section className="lg:col-span-7 space-y-8">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-6 border-b border-white/10 pb-8">
                <div className="w-28 md:w-40 aspect-[3/4] bg-white/10" />
                <div className="flex-1 space-y-4">
                  <div className="h-5 w-2/3 bg-white/10 rounded" />
                  <div className="h-4 w-1/3 bg-white/10 rounded" />
                  <div className="h-6 w-24 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </section>
          <aside className="lg:col-span-5 bg-white/[0.03] border border-white/10 p-10 space-y-6 h-fit">
            <div className="h-4 w-40 bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/10 rounded" />
            <div className="h-12 w-full bg-white/10 rounded" />
          </aside>
        </div>
      </div>
    </main>
  );
}

export function CheckoutSkeleton() {
  return (
    <main className="min-h-screen bg-[#050505] text-white animate-pulse">
      <div className="w-full max-w-[1200px] px-8 md:px-16 py-24 mx-auto space-y-12">
        <div className="text-center space-y-5">
          <div className="h-3 w-56 bg-white/10 rounded mx-auto" />
          <div className="h-20 w-72 bg-white/10 rounded mx-auto" />
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="h-[360px] bg-white/[0.03] border border-white/10" />
          <div className="h-[420px] bg-white/[0.03] border border-white/10" />
        </div>
      </div>
    </main>
  );
}
