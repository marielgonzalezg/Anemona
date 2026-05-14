import { useState } from "react";

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BanorteLogo = () => (
  <img
    src="BanortePIC.png"
    alt="Banorte"
    style={{ width: "272px", height: "33px", objectFit: "contain", filter: "brightness(0) invert(1)" }}
  />
);

export default function Header() {
  const [activeIcon, setActiveIcon] = useState<string | null>(null);

  return (
    <header
      style={{
        width: "100%",
        height: "63px",
        backgroundColor: "#E30613",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "12px",
        paddingRight: "20px",
        boxSizing: "border-box",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 8px)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", zIndex: 1 }}>
        <BanorteLogo />
      </div>

      {/* Icons */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
          zIndex: 1,
        }}
      >
        {[
          { id: "search", Icon: SearchIcon },
          { id: "bell", Icon: BellIcon },
          { id: "menu", Icon: MenuIcon },
        ].map(({ id, Icon }) => (
          <button
            key={id}
            onMouseEnter={() => setActiveIcon(id)}
            onMouseLeave={() => setActiveIcon(null)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              transition: "background 0.2s ease, transform 0.15s ease",
              backgroundColor:
                activeIcon === id ? "rgba(255,255,255,0.15)" : "transparent",
              transform: activeIcon === id ? "scale(1.1)" : "scale(1)",
            }}
            aria-label={id}
          >
            <Icon />
          </button>
        ))}
      </div>
    </header>
  );
}