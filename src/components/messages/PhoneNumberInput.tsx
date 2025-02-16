"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneNumberInputProps {
  onPhoneNumberChange: (phoneNumber: string) => void;
  error?: string;
  className?: string;
}

export function PhoneNumberInput({ 
  onPhoneNumberChange, 
  error,
  className 
}: PhoneNumberInputProps) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers, +, spaces, and dashes
    if (/^[\d\s+-]*$/.test(value)) {
      const cleanValue = value.replace(/[^\d+]/g, ''); // Only keep digits and +
      setPhoneNumber(value);
      onPhoneNumberChange(cleanValue);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="phone-number">Phone Number</Label>
      <div className="relative">
        <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="phone-number"
          type="tel"
          placeholder="+1234567890"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          className={cn(
            "pl-8",
            error && "border-destructive"
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
} 