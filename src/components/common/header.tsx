import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  showAvatar?: boolean;
}

export function Header({ title, showAvatar = true }: HeaderProps) {
  return (
    <header className="flex justify-between items-center p-6">
      <h1 className="text-4xl font-bold">{title}</h1>
      {showAvatar && (
        <Avatar>
          <AvatarImage src="/avatar-placeholder.png" alt="User" />
          <AvatarFallback className="bg-gray-400">U</AvatarFallback>
        </Avatar>
      )}
    </header>
  );
} 