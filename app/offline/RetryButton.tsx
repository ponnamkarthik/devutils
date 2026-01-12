"use client";

export function RetryButton() {
  return (
    <button
      className="inline-flex items-center justify-center rounded-md border px-4 py-2"
      onClick={() => window.location.reload()}
      type="button"
    >
      Retry
    </button>
  );
}
