"use client";

import { useState } from "react";
import { Mail, Phone, Users, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ContactSelector } from "./ContactSelector";
import { PhoneNumberInput } from "./PhoneNumberInput";

type SendMethod = "phone" | "email" | "contact" | "web";

interface SendMethodSelectorProps {
  onRecipientChange: (recipient: {
    type: SendMethod;
    value: string;
  }) => void;
  className?: string;
}

export function SendMethodSelector({ onRecipientChange, className }: SendMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<SendMethod>("contact");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleMethodChange = (method: SendMethod) => {
    setSelectedMethod(method);
    // Clear previous values
    setPhoneNumber("");
    setEmail("");
    setPhoneError(null);
    setEmailError(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex space-x-2">
        <Button
          variant={selectedMethod === "contact" ? "default" : "outline"}
          size="sm"
          onClick={() => handleMethodChange("contact")}
        >
          <Users className="h-4 w-4 mr-2" />
          Select Contact
        </Button>
        <Button
          variant={selectedMethod === "phone" ? "default" : "outline"}
          size="sm"
          onClick={() => handleMethodChange("phone")}
        >
          <Phone className="h-4 w-4 mr-2" />
          Phone
        </Button>
        <Button
          variant={selectedMethod === "email" ? "default" : "outline"}
          size="sm"
          onClick={() => handleMethodChange("email")}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button
          variant={selectedMethod === "web" ? "default" : "outline"}
          size="sm"
          onClick={() => handleMethodChange("web")}
        >
          <Bell className="h-4 w-4 mr-2" />
          Web Push
        </Button>
      </div>

      <div className="space-y-4">
        {selectedMethod === "phone" && (
          <PhoneNumberInput
            onPhoneNumberChange={(number) => {
              setPhoneNumber(number);
              // Only update recipient if number is valid
              const phoneRegex = /^\+?\d{10,}$/;
              if (phoneRegex.test(number)) {
                setPhoneError(null);
                onRecipientChange({ type: "phone", value: number });
              } else {
                setPhoneError(
                  !number 
                    ? "Phone number is required" 
                    : "Please enter a valid phone number (min. 10 digits)"
                );
              }
            }}
            error={phoneError}
          />
        )}

        {selectedMethod === "email" && (
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (validateEmail(e.target.value)) {
                  onRecipientChange({ type: "email", value: e.target.value });
                }
              }}
              className={cn(emailError && "border-red-500")}
            />
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>
        )}

        {selectedMethod === "contact" && (
          <ContactSelector
            onSelect={(contact) => {
              onRecipientChange({ 
                type: "contact", 
                value: contact.id 
              });
            }}
          />
        )}

        {selectedMethod === "web" && (
          <ContactSelector
            onSelect={(contact) => {
              onRecipientChange({ 
                type: "web", 
                value: contact.id 
              });
            }}
          />
        )}
      </div>
    </div>
  );
} 