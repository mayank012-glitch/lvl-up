"use client";

import type { CSSProperties } from "react";
import { sponsorLogoLayout } from "@/lib/sponsor-logo-layout";

type Sponsor = { id: string; title: string; image: string };

export function SponsorCarousel({ sponsors }: { sponsors: Sponsor[] }) {
  if (!sponsors.length) return null;

  return (
    <div className="sponsor-carousel">
      <div className="sponsor-carousel-viewport" role="region" aria-label="Associated brands" tabIndex={0}>
        <div className="sponsor-carousel-track" style={{ "--sponsor-duration": `${Math.max(30, sponsors.length * 6)}s` } as CSSProperties}>
          {[false, true].map(duplicate => (
            <div className="sponsor-carousel-group" key={String(duplicate)} aria-hidden={duplicate || undefined}>
              {sponsors.map(sponsor => (
                <figure key={sponsor.id} className={sponsorLogoLayout(sponsor.image) ? "sponsor-optical-logo" : undefined} style={sponsorLogoLayout(sponsor.image)}>
                  <span className="sponsor-logo-artwork">
                    <img src={`/media/${sponsor.image}`} alt={duplicate ? "" : sponsor.title} loading="lazy" width={284} height={152} />
                  </span>
                </figure>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
