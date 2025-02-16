"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface MessagesErrorBoundaryProps {
  error: string;
  onRetry: () => void;
  onClear: () => void;
}

export function MessagesErrorBoundary({ error, onRetry, onClear }: MessagesErrorBoundaryProps) {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="mt-2">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Error Loading Messages</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                >
                  Clear Error
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
} 