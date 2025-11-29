"use client";

import Link from "next/link";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  link: string;
  color?: "green" | "red" | "yellow" | "blue";
}

export function QuickActionCard({
  title,
  description,
  icon,
  link,
  color = "green",
}: QuickActionCardProps) {
  const colorClasses = {
    green: "hover:border-green-500",
    red: "hover:border-red-500",
    yellow: "hover:border-yellow-500",
    blue: "hover:border-blue-500",
  };

  return (
    <Link href={link} className={`action-card ${colorClasses[color]}`}>
      <span className="text-4xl block mb-3" role="img" aria-label={title}>
        {icon}
      </span>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
