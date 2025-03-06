"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Check, X, RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface NotificationTemplateProps {
  phone: string;
  message: string;
  onResend?: () => Promise<void>;
  status?: 'sent' | 'failed' | 'sending';
  timestamp?: Date;
}

export function NotificationTemplate({
  phone,
  message,
  onResend,
  status = 'sent',
  timestamp = new Date(),
}: NotificationTemplateProps) {
  const [isResending, setIsResending] = useState(false);

  const handleResend = async () => {
    if (!onResend) return;
    
    try {
      setIsResending(true);
      await onResend();
      toast({
        title: "Success",
        description: "Notification resent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend notification",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'sent':
        return (
          <Badge className="bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Sent
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'sending':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Sending
          </Badge>
        );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{phone}</span>
            </div>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{message}</p>
          <div className="mt-2 text-xs text-gray-400">
            {timestamp.toLocaleString()}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notification Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Recipient</h4>
            <p className="text-sm text-gray-600">{phone}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Message</h4>
            <div className="bg-gray-50 p-4 rounded-md">
              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
                {message}
              </pre>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Status</h4>
            {getStatusBadge()}
          </div>
          <div>
            <h4 className="text-sm font-medium mb-1">Sent at</h4>
            <p className="text-sm text-gray-600">
              {timestamp.toLocaleString()}
            </p>
          </div>
          {status === 'failed' && onResend && (
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={handleResend}
                disabled={isResending}
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 