"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch({ popularPujas = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    router.push(`/services?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      <form className="hero-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search puja, service or city..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button className="btn btn-primary" type="submit">
          Search
        </button>
      </form>
      <div className="row" style={{ marginTop: 16 }}>
        {popularPujas.map((item) => (
          <button
            key={item}
            className="chip"
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/services?search=${encodeURIComponent(item)}`)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="row" style={{ marginTop: 22 }}>
        <button className="btn btn-primary" onClick={() => router.push("/services")}>
          Find a Pandit
        </button>
        <button className="btn btn-outline" onClick={() => router.push("/services")}>
          Explore Pujas
        </button>
      </div>
    </>
  );
}
