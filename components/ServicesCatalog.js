"use client";

import { useMemo, useState } from "react";
import PujaCard from "@/components/PujaCard";

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
        <div className="card-grid">
          {filteredPujas.map((puja) => (
            <PujaCard key={puja.id} puja={puja} />
          ))}
        </div>
        {!filteredPujas.length && <p>No pujas found for this filter.</p>}
      </div>
    </section>
  );
}
