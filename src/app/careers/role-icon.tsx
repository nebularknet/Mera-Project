"use client";

import {
  FaShieldAlt,
  FaPaintBrush,
  FaPenNib,
  FaChartLine,
  FaBriefcase,
} from "react-icons/fa";

/**
 * Renders a role-appropriate icon. Kept in a client component because
 * react-icons + React 19 RC throws when rendered directly in a Server
 * Component (the rest of the site uses react-icons inside client boundaries).
 */
export function RoleIcon({ title }: { title: string }) {
  const t = title.toLowerCase();
  if (t.includes("cyber") || t.includes("security")) return <FaShieldAlt />;
  if (t.includes("ui") || t.includes("ux")) return <FaPenNib />;
  if (t.includes("graphic") || t.includes("design")) return <FaPaintBrush />;
  if (t.includes("business") || t.includes("develop") || t.includes("sales"))
    return <FaChartLine />;
  return <FaBriefcase />;
}
