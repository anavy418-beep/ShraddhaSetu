"use client";

import Link from "next/link";

const processSteps = [
  {
    label: "Step 1: Choose E-Puja package",
    type: "scroll",
    targetId: "e-puja-packages",
    ariaLabel: "Go to E-Puja packages section"
  },
  {
    label: "Step 2: Fill Sankalp and devotee details",
    type: "link",
    href: "/booking?mode=e-puja",
    ariaLabel: "Open E-Puja booking form"
  },
  {
    label: "Step 3: Confirm booking",
    type: "link",
    href: "/booking?mode=e-puja#confirm",
    ariaLabel: "Open booking confirmation step"
  },
  {
    label: "Step 4: Receive WhatsApp/Email confirmation",
    type: "scroll",
    targetId: "e-puja-confirmation-info",
    ariaLabel: "Scroll to confirmation information"
  },
  {
    label: "Step 5: Join live puja",
    type: "scroll",
    targetId: "live-puja-support",
    ariaLabel: "Scroll to live puja support section"
  },
  {
    label: "Step 6: Receive prasad if selected",
    type: "scroll",
    targetId: "prasad-delivery-info",
    ariaLabel: "Scroll to prasad delivery information"
  }
];

function scrollToSection(targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function EPujaProcessSteps() {
  return (
    <div className="card-grid">
      {processSteps.map((step) =>
        step.type === "link" ? (
          <Link key={step.label} href={step.href} className="epuja-process-card" aria-label={step.ariaLabel}>
            <span>{step.label}</span>
            <span aria-hidden="true" className="epuja-process-arrow">
              →
            </span>
          </Link>
        ) : (
          <button
            key={step.label}
            type="button"
            className="epuja-process-card"
            aria-label={step.ariaLabel}
            onClick={() => scrollToSection(step.targetId)}
          >
            <span>{step.label}</span>
            <span aria-hidden="true" className="epuja-process-arrow">
              →
            </span>
          </button>
        )
      )}
    </div>
  );
}

