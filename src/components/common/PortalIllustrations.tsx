import React from "react";
import Box, { type BoxProps } from "@mui/material/Box";

/**
 * Modern 3D isometric geometric illustration inspired by the reference dashboard.
 * Features stacked cubic staircases with vibrant gradient fills (cyan, magenta, indigo).
 */
export function IsometricCubeIllustration(props: BoxProps) {
  return (
    <Box component="svg" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="gradTop1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="gradLeft1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="gradRight1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#be185d" />
        </linearGradient>

        <linearGradient id="gradTop2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
        <linearGradient id="gradLeft2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
        <linearGradient id="gradRight2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>

        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ambient background glow */}
      <circle cx="280" cy="120" r="70" fill="#ec4899" opacity="0.25" filter="url(#glowEffect)" />
      <circle cx="160" cy="90" r="60" fill="#38bdf8" opacity="0.2" filter="url(#glowEffect)" />

      {/* Primary Isometric Block 1 (Left Stair) */}
      <g transform="translate(110, 40)">
        {/* Top Face */}
        <polygon points="60,0 120,35 60,70 0,35" fill="url(#gradTop1)" />
        {/* Left Face */}
        <polygon points="0,35 60,70 60,140 0,105" fill="url(#gradLeft1)" />
        {/* Right Face */}
        <polygon points="60,70 120,35 120,105 60,140" fill="url(#gradRight1)" />
      </g>

      {/* Secondary Isometric Block 2 (Right/Stacked Stair) */}
      <g transform="translate(180, 80)">
        {/* Top Face */}
        <polygon points="50,0 100,29 50,58 0,29" fill="url(#gradTop2)" />
        {/* Left Face */}
        <polygon points="0,29 50,58 50,116 0,87" fill="url(#gradLeft2)" />
        {/* Right Face */}
        <polygon points="50,58 100,29 100,87 50,116" fill="url(#gradRight2)" />
      </g>

      {/* Base Geometric Step Block 3 */}
      <g transform="translate(240, 120)">
        <polygon points="40,0 80,23 40,46 0,23" fill="#60a5fa" opacity="0.9" />
        <polygon points="0,23 40,46 40,92 0,69" fill="#2563eb" opacity="0.9" />
        <polygon points="40,46 80,23 80,69 40,92" fill="#f43f5e" opacity="0.85" />
      </g>
    </Box>
  );
}

/**
 * Geometric icon badges as seen in the reference top pastel cards and task list.
 */
export function GeometricBadge({ type = "cube", size = 32 }: { type?: "cube" | "hexagon" | "star" | "diamond" | "rings"; size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "10px",
        bgcolor: "#111827",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {type === "cube" && (
          <>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </>
        )}
        {type === "hexagon" && (
          <>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </>
        )}
        {type === "star" && (
          <>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </>
        )}
        {type === "diamond" && (
          <>
            <rect x="3" y="3" width="18" height="18" rx="2" transform="rotate(45 12 12)" />
          </>
        )}
        {type === "rings" && (
          <>
            <circle cx="8" cy="12" r="5" />
            <circle cx="16" cy="12" r="5" />
          </>
        )}
      </svg>
    </Box>
  );
}
