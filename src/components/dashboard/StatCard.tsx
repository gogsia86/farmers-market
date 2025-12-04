"use client";

import Link from "next/link";

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  link: string;
  color: "blue" | "green" | "red" | "yellow";
}

export function StatCard({ title, value, icon, link, color }: StatCardProps) {
  const colorClasses = {
    blue: "stat-card-blue",
    green: "stat-card-green",
    red: "stat-card-red",
    yellow: "stat-card-yellow",
  };

  return (
    <Link href={link} className={colorClasses[color]}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl" role="img" aria-label={title}>
          {icon}
        </span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <h3 className="font-medium text-base">{title}</h3>
    </Link>
  );
}
