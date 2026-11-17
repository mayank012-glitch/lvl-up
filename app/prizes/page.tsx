import type { Metadata } from "next";

export const metadata: Metadata = { title: "Prizes" };

export default function PrizesPage() {
  return (
    <main className="inner-page dark-page prizes-page">
      <div className="page-shell">
        <div className="page-heading"><h1>THE FINISH EXPERIENCE</h1></div>
        <img
          className="block h-auto w-full rounded-lg"
          src="/images/finish-experience.webp"
          alt="LVL UP participants crossing the finish line under a results screen as confetti falls."
          width={1584}
          height={748}
        />
      </div>
    </main>
  );
}
