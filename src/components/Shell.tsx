"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

const NAV = [
  { href: "/", label: "Dashboard", icon: <rect x="3" y="3" width="7" height="7" /> },
  { href: "/businesses", label: "Businesses", icon: <rect x="4" y="2" width="16" height="20" rx="1" /> },
  { href: "/calls", label: "Calls", icon: <path d="M13.8 16.6a1 1 0 0 0 1.2-.3l.4-.5a2 2 0 0 1 1.6-.8h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.5.4a1 1 0 0 0-.3 1.2 14 14 0 0 0 6.4 6.4z" /> },
];

function breadcrumbFor(pathname: string) {
  if (pathname === "/") return "Dashboard";
  const top = NAV.find((n) => n.href !== "/" && pathname.startsWith(n.href));
  if (pathname.startsWith("/businesses/") && pathname !== "/businesses") return "Businesses / Detail";
  return top?.label ?? "Dashboard";
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  if (pathname === "/login") return <>{children}</>;

  return (
    <div className="app-shell">
      <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-mark">V</div>
          <div className="sidebar-label" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 17, whiteSpace: "nowrap", overflow: "hidden" }}>Voxa</div>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Collapse sidebar"
            style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text)", opacity: 0.6, padding: 4, flex: "none" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform .18s ease" }}>
              <path d="m11 17-5-5 5-5" /><path d="m18 17-5-5 5-5" />
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link${active ? " active" : ""}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                <span className="sidebar-label" style={{ whiteSpace: "nowrap" }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <LogoutButton />
        </div>
      </aside>

      <div className="main-scroll">
        <header className="topbar">
          <div className="topbar-crumb">{breadcrumbFor(pathname)}</div>
          <div className="topbar-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-4.34-4.34" /><circle cx="11" cy="11" r="8" /></svg>
            <input className="input" placeholder="Search businesses, calls, documents..." disabled title="Wired up in Phase 3" />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 30, height: 30, background: "var(--color-accent-200)", color: "var(--color-accent-800)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 12 }}>JM</div>
        </header>

        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
