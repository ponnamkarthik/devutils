"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/UI";

export function ServiceWorkerRegister() {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const [updateReady, setUpdateReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Avoid SW in dev to prevent caching/hard-refresh confusion.
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(
          "/service-worker.js",
          {
            scope: "/",
          }
        );

        registrationRef.current = registration;

        // If an update is already waiting (e.g. after refresh), surface it.
        if (registration.waiting && navigator.serviceWorker.controller) {
          setUpdateReady(true);
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;

          installing.addEventListener("statechange", () => {
            if (installing.state !== "installed") return;
            // If there's already a controller, a new SW is ready.
            if (navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });

        // If the user accepts update, controllerchange triggers; reload then.
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch {
        // Silent fail: PWA is progressive enhancement.
      }
    };

    // Register after load to avoid competing with initial navigation.
    if (document.readyState === "complete") {
      void register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  const applyUpdate = async () => {
    const registration = registrationRef.current;
    if (!registration) {
      window.location.reload();
      return;
    }

    const waiting = registration.waiting;
    if (waiting) {
      waiting.postMessage({ type: "SKIP_WAITING" });
      return;
    }

    // Fallback: try to fetch an update, then reload.
    try {
      await registration.update();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  if (!updateReady || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-lg border bg-card p-3 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Update available</p>
          <p className="truncate text-xs text-muted-foreground">
            A newer version of DevUtils is ready.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDismissed(true)}
          >
            Later
          </Button>
          <Button size="sm" variant="primary" onClick={applyUpdate}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
