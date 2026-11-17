"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Flag, Home, Info, Trophy } from "lucide-react";
const links = [["Home", "/", Home], ["Stations", "/stations", Flag], ["Prizes", "/prizes", Trophy], ["Leaderboard", "/leaderboard", BarChart3], ["The Race Format", "/event-info", Info]] as const;
export function AppNav({accountAction}:{accountAction:React.ReactNode}) {
  const pathname = usePathname();
  return <header className="site-header"><div className="nav-shell">
    <Link className="brand" href="/" aria-label="LVL UP home"><img className="brand-deck-logo" src="/images/lvl-up-deck-logo.svg" alt="LVL UP" width={142} height={48}/></Link>
    <nav id="main-navigation" className="nav-links" aria-label="Main navigation">
      {links.map(([label, href, Icon]) => <a key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={pathname === href ? "active" : ""}><Icon size={18} />{label}</a>)}
      <a href="/register" className="nav-register">Register</a>
      {accountAction}
    </nav>
  </div></header>;
}
