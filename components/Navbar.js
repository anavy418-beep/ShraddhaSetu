"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const navItems = [
  { label: "All Puja Services", href: "/services" },
  { label: "Cities", href: "/cities" },
  { label: "E-Puja", href: "/e-puja" },
  { label: "Pandits", href: "/pandits" },
  { label: "Book Now", href: "/booking" }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardHref = useMemo(() => {
    if (!user) {
      return "/login";
    }
    if (user.role === "ADMIN") {
      return "/admin-dashboard";
    }
    if (user.role === "PANDIT") {
      return "/pandits";
    }
    return "/user-dashboard";
  }, [user]);

  const loadAuthState = useCallback(async () => {
    setAuthLoading(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = await response.json();
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuthState();
  }, [loadAuthState, pathname]);

  const onLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
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
          {user && (
            <>
              <Link href={dashboardHref} onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <span style={{ color: "#5f4635", fontSize: "0.95rem", padding: "6px 8px", fontWeight: 600, marginLeft: 4 }}>
                {user.name || user.email}
              </span>
            </>
          )}
          {!authLoading && !user && <Link href="/login" onClick={() => setMobileOpen(false)}>Login/Register</Link>}
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
