import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./race-theme.css";
import { AppNav } from "@/components/app-nav";
import {SiteFooter} from "@/components/site-footer";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  title: { default: "LVL Up | Youth Fitness Race", template: "%s | LVL Up" },
  description: "Discover LVL Up, the five-station youth fitness race. Explore the challenges, find upcoming events and get ready for your start line.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "LVL Up" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg", apple: "/icons/apple-touch-icon.png" },
};
export const viewport: Viewport = { themeColor: "#c8ff00", width: "device-width", initialScale: 1 };
import {getChatGPTUser,chatGPTSignInPath} from "@/app/chatgpt-auth";
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user=await getChatGPTUser();
  return <html lang="en"><body className="race-theme"><AppNav accountAction={user?<a className="nav-register nav-account" href="/my-result">My account</a>:<a className="nav-register nav-account" href={chatGPTSignInPath("/my-result")} target="_top">Sign up / Log in</a>} />{children}<SiteFooter/><ServiceWorkerRegistration /></body></html>;
}
