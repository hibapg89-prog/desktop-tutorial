import React from "react";
import { FAMILY_MAP } from "@/utils/badgeDefinitions";

// ─── Icon paths (rendered inside 64×64 viewBox, centred at 32,32) ───────────

const ICON_PATHS = {
  // Foundations
  butterfly: (
    <g transform="translate(32,31)" fill="currentColor">
      <path d="M0 0C0 0-8-11-14-8C-18-5-16 2-10 4C-5 6 0 0 0 0ZM0 0C0 0 8-11 14-8C18-5 16 2 10 4C5 6 0 0 0 0Z"/>
      <path d="M0 0L0 9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </g>
  ),
  lotus: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M0-13C0-13-4-7-4-3C-4 1-2 5 0 8C2 5 4 1 4-3C4-7 0-13 0-13Z"/>
      <path d="M-7-5C-7-5-10-2-9 2C-8 5-4 7 0 8C-3 6-6 3-6 0C-6-2-7-5-7-5Z"/>
      <path d="M7-5C7-5 10-2 9 2C8 5 4 7 0 8C3 6 6 3 6 0C6-2 7-5 7-5Z"/>
      <circle cx="0" cy="-4" r="2"/>
    </g>
  ),
  drop: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M0-14L-8-2C-8-2-10 2-10 5C-10 10-5.5 14 0 14C5.5 14 10 10 10 5C10 2 8-2 8-2L0-14Z"/>
    </g>
  ),
  sunrise: (
    <g transform="translate(32,32)" fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M-11 4A11 11 0 0 1 11 4" strokeWidth="3"/>
      <line x1="0" y1="-5" x2="0" y2="-13" strokeWidth="2.5"/>
      <line x1="-7.5" y1="-2" x2="-12" y2="-6" strokeWidth="2"/>
      <line x1="7.5" y1="-2" x2="12" y2="-6" strokeWidth="2"/>
      <line x1="-13" y1="4" x2="-16" y2="4" strokeWidth="2"/>
      <line x1="13" y1="4" x2="16" y2="4" strokeWidth="2"/>
    </g>
  ),

  // Self-Connection
  mirror: (
    <g transform="translate(32,32)" fill="none" stroke="currentColor">
      <circle cx="0" cy="-6" r="8" strokeWidth="2.5"/>
      <circle cx="0" cy="-6" r="5" strokeWidth="1"/>
      <line x1="0" y1="2" x2="0" y2="11" strokeWidth="3" strokeLinecap="round"/>
      <line x1="-3" y1="11" x2="3" y2="11" strokeWidth="3" strokeLinecap="round"/>
    </g>
  ),
  sunburst: (
    <g transform="translate(32,32)" fill="currentColor">
      <circle cx="0" cy="0" r="5"/>
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="0" y1="-9" x2="0" y2="-13"/>
        <line x1="0" y1="9" x2="0" y2="13"/>
        <line x1="-9" y1="0" x2="-13" y2="0"/>
        <line x1="9" y1="0" x2="13" y2="0"/>
        <line x1="-6.4" y1="-6.4" x2="-8.8" y2="-8.8"/>
        <line x1="6.4" y1="6.4" x2="8.8" y2="8.8"/>
        <line x1="6.4" y1="-6.4" x2="8.8" y2="-8.8"/>
        <line x1="-6.4" y1="6.4" x2="-8.8" y2="8.8"/>
      </g>
    </g>
  ),
  chalice: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M-7-11L7-11L5 2L-5 2L-7-11Z"/>
      <path d="M-5 2L5 2L3.5 7Q0 11-3.5 7L-5 2Z"/>
      <rect x="-1.5" y="11" width="3" height="5" rx="1"/>
      <rect x="-5" y="16" width="10" height="2.5" rx="1"/>
    </g>
  ),
  botanical: (
    <g transform="translate(32,32)" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M0 11V-3"/>
      <path d="M0-1C0-1-7-3-9-8C-5-10 0-3 0-3Z" fill="currentColor"/>
      <path d="M0-5C0-5 7-7 9-12C5-14 0-7 0-7Z" fill="currentColor"/>
    </g>
  ),

  // Rituals
  olive: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M-10 10C-5 4 2-2 10-10" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="-5" cy="4" rx="4" ry="2.5" transform="rotate(-40 -5 4)"/>
      <ellipse cx="2" cy="-1" rx="4" ry="2.5" transform="rotate(-50 2 -1)"/>
      <ellipse cx="8" cy="-7" rx="4" ry="2.5" transform="rotate(-60 8 -7)"/>
    </g>
  ),
  sprout: (
    <g transform="translate(32,32)" fill="currentColor">
      <line x1="0" y1="13" x2="0" y2="-1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M0-1C0-1-9-5-9-12C-5-16 0-11 0-6C0-11 5-16 9-12C9-5 0-1 0-1Z"/>
    </g>
  ),
  flame: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M0-14C0-14-6-7-6-2C-6-2-8-5-8-8C-8-8-11-3-11 1C-11 7.6-6 13 0 13C6 13 11 7.6 11 1C11-4 5-10 0-14Z"/>
    </g>
  ),
  ring: (
    <g transform="translate(32,32)" fill="none" stroke="currentColor">
      <circle cx="0" cy="0" r="11" strokeWidth="3.5"/>
      <circle cx="0" cy="0" r="7" strokeWidth="1"/>
    </g>
  ),

  // Experience
  star: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M0-13L2.5-4.5L11-4.5L4.5 0.5L7 9L0 4.5L-7 9L-4.5 0.5L-11-4.5L-2.5-4.5L0-13Z"/>
    </g>
  ),

  leaf: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M0 13C0 13-11 5-11-4C-11-11-5-15 0-15C5-15 11-11 11-4C11 5 0 13 0 13Z"/>
      <line x1="0" y1="13" x2="0" y2="-7" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" fill="none"/>
    </g>
  ),
  branch: (
    <g transform="translate(32,32)" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="0" y1="13" x2="0" y2="-3"/>
      <path d="M0-3C0-3-9-8-11-14" strokeWidth="2"/>
      <path d="M0-3C0-3 9-8 11-14" strokeWidth="2"/>
      <path d="M-7 2C-7 2-4 0-2 2" strokeWidth="2"/>
    </g>
  ),
  lightning: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M4-14L-4 2L2 2L-4 14L12-2L5-2L11-14L4-14Z"/>
    </g>
  ),

  // Influence
  crown: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M-12 8L-10-7L-4 1L0-12L4 1L10-7L12 8L-12 8Z"/>
      <rect x="-12" y="8" width="24" height="4" rx="1"/>
    </g>
  ),
  crown_ornate: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M-12 8L-10-7L-4 0L0-13L4 0L10-7L12 8L-12 8Z"/>
      <rect x="-12" y="8" width="24" height="5" rx="1"/>
      <circle cx="-10" cy="-8" r="2.5"/>
      <circle cx="0" cy="-14" r="2.5"/>
      <circle cx="10" cy="-8" r="2.5"/>
    </g>
  ),
  fleur: (
    <g transform="translate(32,32)" fill="currentColor">
      <path d="M0-14C0-14-3.5-8-3.5-4C-3.5-1-1 1 0 2C1 1 3.5-1 3.5-4C3.5-8 0-14 0-14Z"/>
      <path d="M0 2C0 2-8 0-10 4C-11 7-8 10-5 9C-2 8 0 6 0 6"/>
      <path d="M0 2C0 2 8 0 10 4C11 7 8 10 5 9C2 8 0 6 0 6"/>
      <line x1="-3" y1="6" x2="3" y2="6" stroke="currentColor" strokeWidth="2" fill="none"/>
      <line x1="0" y1="6" x2="0" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <line x1="-3" y1="14" x2="3" y2="14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </g>
  ),
  medallion: (
    <g transform="translate(32,32)" fill="currentColor">
      <circle cx="0" cy="0" r="5"/>
      <ellipse cx="0" cy="-9" rx="2.5" ry="4.5"/>
      <ellipse cx="6.4" cy="-6.4" rx="2.5" ry="4.5" transform="rotate(45 6.4 -6.4)"/>
      <ellipse cx="9" cy="0" rx="2.5" ry="4.5" transform="rotate(90 9 0)"/>
      <ellipse cx="6.4" cy="6.4" rx="2.5" ry="4.5" transform="rotate(135 6.4 6.4)"/>
      <ellipse cx="0" cy="9" rx="2.5" ry="4.5" transform="rotate(180 0 9)"/>
      <ellipse cx="-6.4" cy="6.4" rx="2.5" ry="4.5" transform="rotate(225 -6.4 6.4)"/>
      <ellipse cx="-9" cy="0" rx="2.5" ry="4.5" transform="rotate(270 -9 0)"/>
      <ellipse cx="-6.4" cy="-6.4" rx="2.5" ry="4.5" transform="rotate(315 -6.4 -6.4)"/>
    </g>
  ),
};

// ─── Shape renderers (64×64 viewBox) ─────────────────────────────────────────

function OvalShape({ fill, stroke, strokeWidth }) {
  return <ellipse cx="32" cy="32" rx="25" ry="28.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
}
function CircleShape({ fill, stroke, strokeWidth }) {
  return <circle cx="32" cy="32" r="26.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
}
function ShieldShape({ fill, stroke, strokeWidth }) {
  const d = "M32 5L55 16V36C55 49 43 59 32 62C21 59 9 49 9 36V16L32 5Z";
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
}
function HexShape({ fill, stroke, strokeWidth }) {
  const d = "M32 5L55 18.5V45.5L32 59L9 45.5V18.5L32 5Z";
  return <path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />;
}
function MedallionShape({ fill, stroke, strokeWidth }) {
  return (
    <g>
      <circle cx="32" cy="32" r="26.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      <circle cx="32" cy="32" r="21" fill="none" stroke={stroke} strokeWidth={0.8} strokeDasharray="2.5 2.5" opacity="0.6" />
    </g>
  );
}

const SHAPE_COMPONENTS = {
  oval: OvalShape,
  circle: CircleShape,
  shield: ShieldShape,
  hexagon: HexShape,
  medallion: MedallionShape,
};

// ─── BadgePin ────────────────────────────────────────────────────────────────

export default function BadgePin({ badge, earned = false, size = "md", onClick, rotation = 0, showLabel = false }) {
  const family = FAMILY_MAP[badge.family];
  if (!family) return null;

  const Shape = SHAPE_COMPONENTS[family.shape] || CircleShape;
  const icon = ICON_PATHS[badge.icon];

  const bg = earned ? family.earnedBg : family.unearnedBg;
  const iconColor = earned ? family.earnedIcon : family.unearnedIcon;
  const borderColor = earned ? family.earnedBorder : family.unearnedBorder;
  const borderWidth = earned ? 2.5 : 1.5;

  const sizes = { nano: 18, xs: 44, sm: 56, md: 72, lg: 96, xl: 120 };
  const sz = sizes[size] || sizes.md;
  const isNano = sz <= 22;

  // Outer glow ring for earned
  const OuterShape = SHAPE_COMPONENTS[family.shape] || CircleShape;

  return (
    <div
      className={`flex flex-col items-center gap-1.5 ${onClick ? "cursor-pointer group" : ""}`}
      onClick={onClick}
    >
      <div
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 0.25s ease, filter 0.25s ease",
          filter: earned ? "none" : "brightness(0.75) saturate(0.7)",
        }}
        className={onClick ? "group-hover:scale-105 group-hover:brightness-110 transition-all duration-200" : ""}
      >
        <svg
          viewBox="0 0 64 64"
          width={sz}
          height={sz}
          style={{ display: "block", overflow: "visible" }}
        >
          {!isNano && (
            <defs>
              {!earned && (
                <filter id={`wax-${badge.key}`} x="-5%" y="-5%" width="110%" height="110%">
                  <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" result="noise" />
                  <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
                  <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blended" />
                  <feComposite in="blended" in2="SourceGraphic" operator="in" />
                </filter>
              )}
              {earned && (
                <filter id={`glow-${badge.key}`} x="-15%" y="-15%" width="130%" height="130%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              )}
            </defs>
          )}

          {/* Earned outer glow ring — skip for nano */}
          {earned && !isNano && (
            <g opacity="0.4" filter={`url(#glow-${badge.key})`}>
              <OuterShape fill="none" stroke={borderColor} strokeWidth={1} />
            </g>
          )}

          {/* Badge fill */}
          <g filter={!earned && !isNano ? `url(#wax-${badge.key})` : undefined}>
            <Shape fill={bg} stroke="none" strokeWidth={0} />
          </g>

          {/* Border */}
          <Shape fill="none" stroke={borderColor} strokeWidth={isNano ? 3 : borderWidth} />

          {/* Icon */}
          <g color={iconColor} opacity={earned ? 1 : 0.55}>
            {icon}
          </g>
        </svg>
      </div>

      {showLabel && (
        <span
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            color: earned ? "var(--color-text-primary)" : "#8a9e92",
            fontSize: sz < 65 ? "9px" : "11px",
            letterSpacing: "0.04em",
            textAlign: "center",
            maxWidth: sz + 8,
            lineHeight: 1.2,
          }}
        >
          {badge.label}
        </span>
      )}
    </div>
  );
}
