import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DonationCardProps {
  title?: string;
  date?: string;
  amount?: string;
  status?: 'pending' | 'completed' | 'cancelled';
  isEmpty?: boolean;
  className?: string;
}

export function DonationCard({ 
  title, 
  date, 
  amount, 
  status,
  isEmpty = false,
  className
}: DonationCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {isEmpty ? (
        <div className="bg-red-50 rounded-2xl p-6 h-48 flex items-center justify-center text-gray-500">
          <p>No active donations</p>
        </div>
      ) : (
        <>
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{title}</h3>
                <p className="text-sm text-gray-500">{date}</p>
              </div>
              {amount && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  {amount}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            {status && (
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  status === 'pending' ? "bg-yellow-500" : 
                  status === 'completed' ? "bg-green-500" : 
                  "bg-red-500"
                )} />
                <span className="text-sm text-gray-600 capitalize">{status}</span>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
} 