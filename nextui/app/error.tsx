"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-5 border border-red-200 bg-red-50 rounded-lg">
      <h2 className="text-red-700 font-bold">Coś poszło nie tak!</h2>
      <p className="text-sm text-red-500 mb-4">{error.message}</p>
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        onClick={() => reset()}
      >
        Spróbuj ponownie
      </button>
    </div>
  );
}
