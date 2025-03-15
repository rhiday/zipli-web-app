import React from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ActionButtonProps extends React.ComponentProps<"button"> {
  href?: string;
  fixed?: boolean;
  position?: 'bottom-right' | 'bottom-center';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ActionButton({ 
  children, 
  className = '', 
  href, 
  fixed = false,
  position = 'bottom-right',
  variant = 'default',
  size = 'default',
  ...props 
}: ActionButtonProps) {
  
  const positionClasses = {
    'bottom-right': 'right-6 bottom-24',
    'bottom-center': 'left-1/2 transform -translate-x-1/2 bottom-24'
  };
  
  const buttonContent = (
    <Button 
      className={cn(
        "shadow-md",
        fixed && "fixed",
        fixed && positionClasses[position],
        className
      )}
      variant={variant}
      size={size}
      {...props}
    >
      {children}
    </Button>
  );
  
  if (href) {
    return <Link href={href}>{buttonContent}</Link>;
  }
  
  return buttonContent;
} 