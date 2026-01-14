import Link from "next/link";
import { RetryButton } from "./RetryButton";

export const metadata = {
  title: "Offline Mode | DevUtils – Free Online Developer Tools",
  description:
    "You appear to be offline. DevUtils works best with a network connection, but many tools still work once cached.",
};

export default function OfflinePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10">
      <h1 className="text-2xl font-semibold">You’re offline</h1>
      <p className="text-muted-foreground">
        Some pages may still work if they were opened before. Reconnect to load
        the latest content.
      </p>
      <div className="flex gap-3">
        <Link
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
          href="/"
        >
          Go to Home
        </Link>
        <RetryButton />
      </div>
    </main>
  );
}
