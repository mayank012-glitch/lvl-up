"use client";
import { useEffect } from "react";
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" })
      .then(registration => registration.update())
      .catch(error => console.warn("LVL Up offline support is unavailable.", error));
  }, []);
  return null;
}
