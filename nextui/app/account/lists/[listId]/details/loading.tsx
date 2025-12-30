export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-12 animate-pulse">
      {/* Skeleton Nagłówka Strony */}
      <div className="mb-8">
        <div className="h-9 bg-zinc-200 rounded-lg w-48 mb-2" />
        <div className="h-5 bg-zinc-100 rounded-md w-32" />
      </div>

      <div className="w-full">
        {/* Skeleton Headerów Tabeli */}
        <div className="grid grid-cols-[40px_1fr_80px_60px_40px] gap-4 items-center px-5 mb-4">
          <div />
          <div className="h-3 bg-zinc-200 rounded w-16" />
          <div className="h-3 bg-zinc-200 rounded w-12 justify-self-center" />
          <div className="h-3 bg-zinc-200 rounded w-8 justify-self-center" />
          <div className="h-8 w-8 bg-zinc-100 rounded-full justify-self-end" />
        </div>

        {/* Skeleton Wierszy (Kart) */}
        <div className="space-y-3">
          {[...Array(6)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-[40px_1fr_80px_60px_40px] gap-4 items-center p-4 bg-white border border-zinc-100 rounded-2xl"
            >
              {/* Checkbox */}
              <div className="flex justify-center">
                <div className="h-5 w-5 bg-zinc-100 rounded-md" />
              </div>

              {/* Nazwa produktu */}
              <div className="h-4 bg-zinc-200 rounded-md w-3/4" />

              {/* Ilość */}
              <div className="flex justify-center">
                <div className="h-7 bg-zinc-50 rounded-lg w-12 border border-zinc-100" />
              </div>

              {/* Ikona typu */}
              <div className="flex justify-center">
                <div className="h-6 w-6 bg-zinc-100 rounded-full" />
              </div>

              {/* Akcje */}
              <div className="flex justify-end">
                <div className="h-8 w-8 bg-zinc-50 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
