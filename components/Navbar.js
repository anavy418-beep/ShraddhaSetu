"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "All Puja Services", href: "/services" },
  { label: "Cities", href: "/cities" },
  { label: "E-Puja", href: "/e-puja" },
  { label: "Panchang", href: "/panchang" },
  { label: "Astrology", href: "/astrology" },
  { label: "Kundali", href: "/astrology/kundali" },
  { label: "Match Making", href: "/astrology/match-making" },
  { label: "Shop", href: "/shop" },
  { label: "Book Now", href: "/booking" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data) => {
        if (mounted) {
          setUser(data.user || null);
        }
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const onLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="nav-wrap">
      <div className="container nav">
        <Link className="brand" href="/">
          ShraddhaSetu
        </Link>
        <button type="button" className="nav-toggle" onClick={() => setMobileOpen((open) => !open)}>
          {mobileOpen ? "Close" : "Menu"}
        </button>
        <nav className={`nav-links ${mobileOpen ? "is-open" : ""}`}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={isActive ? { background: "#f8ebd4", color: "#7f1d1d", fontWeight: 700 } : {}}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          {user?.role === "ADMIN" && <Link href="/admin-dashboard" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>}
          {user?.role === "USER" && <Link href="/user-dashboard" onClick={() => setMobileOpen(false)}>My Dashboard</Link>}
          {user?.role === "PANDIT" && <Link href="/pandits" onClick={() => setMobileOpen(false)}>Pandit Dashboard</Link>}
          {!user && <Link href="/login" onClick={() => setMobileOpen(false)}>Login/Register</Link>}
          {user && (
            <button type="button" className="btn btn-outline" onClick={onLogout}>
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
