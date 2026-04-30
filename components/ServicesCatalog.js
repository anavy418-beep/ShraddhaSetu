"use client";

import { useMemo, useState } from "react";
import PujaCard from "@/components/PujaCard";

const POPULAR_PUJA_SLUG_ORDER = [
  "griha-pravesh-puja",
  "satyanarayan-puja",
  "marriage-puja",
  "bhoomi-puja",
  "rudrabhishek",
  "navagraha-shanti-puja",
  "pind-daan-puja",
  "diwali-puja",
  "ganesh-chaturthi-puja",
  "office-opening-puja"
];

export default function ServicesCatalog({ search = "", services = [], categories = [] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredPujas = useMemo(() => {
    const query = search.toLowerCase().trim();
    return services.filter((puja) => {
      const categoryCheck = activeCategory === "All" || puja.category === activeCategory;
      const searchCheck =
        !query ||
        puja.title.toLowerCase().includes(query) ||
        puja.description.toLowerCase().includes(query) ||
        puja.category.toLowerCase().includes(query);
      return categoryCheck && searchCheck;
    });
  }, [activeCategory, search, services]);

  const popularSlugRank = useMemo(
    () => new Map(POPULAR_PUJA_SLUG_ORDER.map((slug, index) => [slug, index])),
    []
  );

  const popularPujas = useMemo(() => {
    if (activeCategory !== "All") return [];
    return filteredPujas
      .filter((puja) => popularSlugRank.has(puja.slug))
      .sort((a, b) => popularSlugRank.get(a.slug) - popularSlugRank.get(b.slug));
  }, [activeCategory, filteredPujas, popularSlugRank]);

  const otherPujas = useMemo(() => {
    if (activeCategory !== "All") return filteredPujas;
    return filteredPujas.filter((puja) => !popularSlugRank.has(puja.slug));
  }, [activeCategory, filteredPujas, popularSlugRank]);

  return (
    <section className="section">
      <div className="container">
        <div className="row" style={{ marginBottom: 18 }}>
          <button
            className="chip"
            style={{ cursor: "pointer", borderColor: activeCategory === "All" ? "#a16207" : undefined }}
            onClick={() => {
              setActiveCategory("All");
            }}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className="chip"
              style={{ cursor: "pointer", borderColor: activeCategory === category ? "#a16207" : undefined }}
              onClick={() => {
                setActiveCategory(category);
              }}
            >
              {category}
            </button>
          ))}
        </div>
        {activeCategory === "All" ? (
          <>
            {!!popularPujas.length && (
              <>
                <h3
                  style={{
                    margin: "4px 0 14px",
                    color: "var(--deep-brown)",
                    fontSize: "1.1rem",
                    fontWeight: 700
                  }}
                >
                  Most Popular Pujas
                </h3>
                <div className="card-grid" style={{ marginBottom: 24 }}>
                  {popularPujas.map((puja) => (
                    <PujaCard key={puja.id} puja={puja} />
                  ))}
                </div>
              </>
            )}

            {!!otherPujas.length && (
              <>
                <h3
                  style={{
                    margin: "0 0 14px",
                    color: "var(--deep-brown)",
                    fontSize: "1.1rem",
                    fontWeight: 700
                  }}
                >
                  All Other Puja Services
                </h3>
                <div className="card-grid">
                  {otherPujas.map((puja) => (
                    <PujaCard key={puja.id} puja={puja} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="card-grid">
            {filteredPujas.map((puja) => (
              <PujaCard key={puja.id} puja={puja} />
            ))}
          </div>
        )}
        {!filteredPujas.length && <p>No pujas found for this filter.</p>}
      </div>
    </section>
  );
}
