"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download } from "lucide-react";

const billingSchema = z.object({
  paymentMethod: z.object({
    type: z.enum(['CREDIT_CARD', 'BANK_ACCOUNT']),
    cardNumber: z.string().optional(),
    expiryDate: z.string().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    isDefault: z.boolean(),
  }),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
    country: z.string(),
  }),
  billingPreferences: z.object({
    autoPayEnabled: z.boolean(),
    paymentDueReminder: z.boolean(),
    minimumBalance: z.number(),
    invoiceDelivery: z.enum(['EMAIL', 'MAIL', 'BOTH']),
  }),
});

type BillingSettingsValues = z.infer<typeof billingSchema>;

export default function BillingSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  const form = useForm<BillingSettingsValues>({
    resolver: zodResolver(billingSchema),
    defaultValues: {
      paymentMethod: {
        type: 'CREDIT_CARD',
        isDefault: true,
      },
      billingAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      },
      billingPreferences: {
        autoPayEnabled: true,
        paymentDueReminder: true,
        minimumBalance: 0,
        invoiceDelivery: 'EMAIL',
      },
    },
  });

  useEffect(() => {
    loadBillingSettings();
  }, []);

  const loadBillingSettings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/billing");
      if (!response.ok) throw new Error("Failed to load billing settings");
      
      const data = await response.json();
      setInvoices(data.invoices);
      form.reset({
        paymentMethod: data.billingProfile.paymentMethods[0] || form.getValues().paymentMethod,
        billingAddress: data.billingProfile.billingAddress || form.getValues().billingAddress,
        billingPreferences: {
          autoPayEnabled: data.billingProfile.autoPayEnabled,
          paymentDueReminder: data.billingProfile.paymentDueReminder,
          minimumBalance: data.billingProfile.minimumBalance,
          invoiceDelivery: data.billingProfile.invoiceDelivery,
        },
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load billing settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: BillingSettingsValues) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/lawyer/settings/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      toast({
        title: "Success",
        description: "Billing settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update billing settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const savedCards = [
    {
      id: 1,
      type: "Visa",
      last4: "4242",
      expiry: "12/24",
      isDefault: true,
    },
    {
      id: 2,
      type: "Mastercard",
      last4: "8888",
      expiry: "09/25",
      isDefault: false,
    },
  ];

  const billingHistory = [
    {
      id: "INV-001",
      date: "2024-03-15",
      amount: "$299.99",
      status: "Paid",
      description: "Premium Plan - Monthly",
    },
    {
      id: "INV-002",
      date: "2024-02-15",
      amount: "$299.99",
      status: "Paid",
      description: "Premium Plan - Monthly",
    },
    {
      id: "INV-003",
      date: "2024-01-15",
      amount: "$299.99",
      status: "Paid",
      description: "Premium Plan - Monthly",
    },
  ];

  return (
    <CardContent className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment Method</h3>
            <FormField
              control={form.control}
              name="paymentMethod.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="BANK_ACCOUNT">Bank Account</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            {form.watch("paymentMethod.type") === "CREDIT_CARD" && (
              <>
                <FormField
                  control={form.control}
                  name="paymentMethod.cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="**** **** **** ****" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod.expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="MM/YY" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            {form.watch("paymentMethod.type") === "BANK_ACCOUNT" && (
              <>
                <FormField
                  control={form.control}
                  name="paymentMethod.accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentMethod.routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>

          <Separator />

          {/* Billing Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Billing Address</h3>
            <FormField
              control={form.control}
              name="billingAddress.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billingAddress.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingAddress.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billingAddress.zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billingAddress.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Billing Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Billing Preferences</h3>
            <FormField
              control={form.control}
              name="billingPreferences.autoPayEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Auto-Pay</FormLabel>
                    <FormDescription>
                      Automatically pay invoices when due
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingPreferences.paymentDueReminder"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <div>
                    <FormLabel>Payment Reminders</FormLabel>
                    <FormDescription>
                      Receive reminders for upcoming payments
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingPreferences.minimumBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Balance Alert</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Get notified when balance falls below this amount
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="billingPreferences.invoiceDelivery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invoice Delivery Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select delivery method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EMAIL">Email</SelectItem>
                      <SelectItem value="MAIL">Mail</SelectItem>
                      <SelectItem value="BOTH">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Recent Invoices */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Invoices</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice, index) => (
                  <TableRow key={index}>
                    <TableCell>{invoice.number}</TableCell>
                    <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{invoice.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>

      <Separator className="my-8" />

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Saved Cards</h3>
          <p className="text-sm text-muted-foreground">
            Manage your saved cards
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Saved Cards</h4>
          <div className="grid gap-4">
            {savedCards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center space-x-4">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {card.type} ending in {card.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {card.expiry}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {card.isDefault && (
                    <Badge variant="outline">Default</Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Billing History</h3>
          <p className="text-sm text-muted-foreground">
            View and download your billing history
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billingHistory.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.id}</TableCell>
                <TableCell>{invoice.date}</TableCell>
                <TableCell>{invoice.amount}</TableCell>
                <TableCell>
                  <Badge variant="outline">{invoice.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
} 