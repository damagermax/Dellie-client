"use client";

function ShimmerBlock({ className }: { className: string }) {
  return <div className={`animate-pulse bg-gray-200 ${className}`} />;
}

export function ProductDetailShimmer() {
  return (
    <div className="min-h-screen bg-gray-50" aria-busy="true" aria-label="Loading product details">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="border-r border-gray-200 bg-white">
          <header className="border-b border-gray-200 p-3 sm:px-5 sm:py-5 md:px-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <ShimmerBlock className="h-10 w-10 shrink-0 rounded-full" />
                <div className="hidden min-w-0 space-y-3 md:block">
                  <div className="flex items-center gap-2">
                    <ShimmerBlock className="h-7 w-52 rounded-md" />
                    <ShimmerBlock className="h-7 w-16 rounded-md" />
                  </div>
                  <ShimmerBlock className="h-4 w-72 rounded-full" />
                </div>
              </div>
              <div className="flex gap-2">
                <ShimmerBlock className="h-8 w-20 rounded-md" />
                <ShimmerBlock className="h-8 w-16 rounded-md" />
              </div>
            </div>
          </header>

          <section className="grid gap-4 px-4 py-5 sm:gap-6 md:px-5 md:py-6 lg:grid-cols-[200px_minmax(0,1fr)]">
            <ShimmerBlock className="aspect-square w-[20%] rounded-sm lg:w-full" />

            <div className="min-w-0">
              <div className="grid grid-cols-2 border-y border-gray-200 md:grid-cols-4">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={`detail-${index}`} className="space-y-2 border-b border-r border-gray-200 px-4 py-4 md:border-b-0 last:border-r-0">
                    <ShimmerBlock className="h-3 w-14 rounded-full" />
                    <ShimmerBlock className="h-4 w-24 max-w-full rounded-full" />
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-b border-gray-200 px-4 py-4">
                <ShimmerBlock className="h-3 w-24 rounded-full" />
                <ShimmerBlock className="h-4 w-full rounded-full" />
                <ShimmerBlock className="h-4 w-4/5 rounded-full" />
              </div>
            </div>
          </section>

          <section className="pb-8">
            <div className="mb-6 hidden justify-center gap-2 md:flex">
              {Array.from({ length: 4 }, (_, index) => (
                <ShimmerBlock key={`tab-${index}`} className="h-9 w-28 rounded-full" />
              ))}
            </div>

            <div className="grid px-4 md:px-9 xl:grid-cols-2">
              {Array.from({ length: 2 }, (_, cardIndex) => (
                <div key={`card-${cardIndex}`} className="min-h-64 border border-gray-200 bg-gray-50 px-5 py-5">
                  <div className="space-y-4">
                    <ShimmerBlock className="h-5 w-36 rounded-full" />
                    <ShimmerBlock className="h-8 w-24 rounded-md" />
                    <div className="border-t border-gray-200 pt-5">
                      {Array.from({ length: 3 }, (_, rowIndex) => (
                        <div key={`card-${cardIndex}-row-${rowIndex}`} className="mb-4 flex items-center justify-between gap-4">
                          <ShimmerBlock className="h-4 w-28 rounded-full" />
                          <ShimmerBlock className="h-4 w-20 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="bg-gray-50 px-5 py-5 md:px-8" />
      </div>
    </div>
  );
}
