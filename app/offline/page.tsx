import Link from "next/link";
import { WifiOff } from "lucide-react";
export default function OfflinePage() { return <main className="offline-page"><div><WifiOff size={52} /><p className="section-kicker">YOU’RE OFFLINE</p><h1>THE RACE WILL<br />WAIT FOR YOU.</h1><p>Reconnect to load the latest registration and leaderboard information.</p><Link className="button button-primary" href="/">Try home again</Link></div></main>; }
