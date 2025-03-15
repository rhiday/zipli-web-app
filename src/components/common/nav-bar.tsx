import React from 'react';
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
  icon?: React.ReactNode;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4", className)}>
      <div className="flex justify-around">
        {items.map((item, index) => (
          <Link 
            key={index} 
            href={item.href} 
            className="flex flex-col items-center"
          >
            <div className={cn(
              "w-6 h-6 rounded-full mb-1",
              item.isActive ? "bg-black" : "bg-gray-400"
            )}>
              {item.icon}
            </div>
            <span className={cn(
              item.isActive ? "text-black font-medium" : "text-gray-500"
            )}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
} 