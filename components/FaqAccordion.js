"use client";

import { useMemo, useState } from "react";

export default function FaqAccordion({ items = [] }) {
  const [openIndexes, setOpenIndexes] = useState(() => new Set([0]));

  const faqItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const toggleItem = (index) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="faq-list" role="list">
      {faqItems.map((item, index) => {
        const isOpen = openIndexes.has(index);
        const answerId = `faq-answer-${index}`;
        const questionId = `faq-question-${index}`;

        return (
          <article className={`faq-card ${isOpen ? "is-open" : ""}`} key={item.q || index} role="listitem">
            <button
              id={questionId}
              type="button"
              className="faq-trigger"
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => toggleItem(index)}
            >
              <span>{item.q}</span>
              <span className="faq-icon" aria-hidden="true">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              id={answerId}
              className={`faq-answer-wrap ${isOpen ? "is-open" : ""}`}
              role="region"
              aria-labelledby={questionId}
            >
              <div className="faq-answer">
                <p>{item.a}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

