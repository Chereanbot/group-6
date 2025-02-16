"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Settings2, 
  AlertCircle,
  Download,
  FileText,
  Building2,
  Users,
  HardDrive,
  Activity,
  Bell,
  Mail,
  Calendar,
  CreditCard as CardIcon,
  CheckCircle2,
  ArrowUpRight
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function BillingSettingsPage() {
  const [autoRenew, setAutoRenew] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [invoiceNotifications, setInvoiceNotifications] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing Settings</h1>
          <p className="text-muted-foreground">Manage your billing preferences and payment methods</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export History
          </Button>
          <Button>
            <DollarSign className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                <p className="text-2xl font-bold">Professional</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">18/25</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <HardDrive className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold">45.2 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Usage</p>
                <p className="text-2xl font-bold">87.4%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription plan and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Professional Plan</p>
                    <p className="text-sm text-muted-foreground">Billed annually</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Billing period</span>
                    <span>Jan 1, 2024 - Dec 31, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Next billing date</span>
                    <span>Jan 1, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Amount due</span>
                    <span className="font-semibold">$299.00</span>
                  </div>
                </div>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Early renewal discount available</AlertTitle>
                  <AlertDescription>
                    Renew now and get 10% off your next billing cycle.
                  </AlertDescription>
                </Alert>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1">
                    Change Plan
                  </Button>
                  <Button className="flex-1">
                    Renew Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Overview</CardTitle>
                <CardDescription>Current billing period usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Storage used</span>
                      <span>45.2 GB / 100 GB</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>API calls</span>
                      <span>87,429 / 100,000</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Users</span>
                      <span>18 / 25</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </div>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Approaching limit</AlertTitle>
                  <AlertDescription>
                    You're at 87% of your API calls limit. Consider upgrading your plan to avoid service interruption.
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View Detailed Usage
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Additional Overview Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest billing and usage events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { icon: CardIcon, title: "Payment processed", desc: "Monthly subscription - $299.00", date: "Today" },
                    { icon: Users, title: "New user added", desc: "License count: 18/25", date: "Yesterday" },
                    { icon: AlertCircle, title: "Usage alert", desc: "API calls approaching limit", date: "2 days ago" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-full">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Comparison</CardTitle>
                <CardDescription>Compare with other available plans</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Enterprise", price: "$599/mo", feature: "Unlimited everything", recommended: true },
                    { name: "Professional", price: "$299/mo", feature: "Current plan", current: true },
                    { name: "Starter", price: "$99/mo", feature: "Basic features" },
                  ].map((plan, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{plan.name}</p>
                        <p className="text-sm text-muted-foreground">{plan.feature}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{plan.price}</span>
                        {plan.current && <Badge>Current</Badge>}
                        {plan.recommended && (
                          <Badge variant="secondary">Recommended</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-full">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/24</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>Default</Badge>
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-full">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 8888</p>
                      <p className="text-sm text-muted-foreground">Expires 08/25</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm">Set as Default</Button>
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <CardIcon className="mr-2 h-4 w-4" />
                  Add New Card
                </Button>
                <Button variant="outline" className="w-full">
                  <Building2 className="mr-2 h-4 w-4" />
                  Add Bank Account
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Address</CardTitle>
              <CardDescription>Address used for billing and tax purposes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input placeholder="Your company name" />
                </div>
                <div className="space-y-2">
                  <Label>Tax ID/VAT Number</Label>
                  <Input placeholder="Tax ID or VAT number" />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 1</Label>
                  <Input placeholder="Street address" />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input placeholder="Apt, Suite, etc." />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Input placeholder="State or Province" />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input placeholder="Postal code" />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input placeholder="Country" />
                </div>
              </div>
              <Button>Save Address</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing-history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View your past invoices and payments</CardDescription>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Export All
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { status: "Paid", amount: 299.00, date: "Dec 1, 2023" },
                  { status: "Paid", amount: 299.00, date: "Nov 1, 2023" },
                  { status: "Paid", amount: 299.00, date: "Oct 1, 2023" },
                  { status: "Paid", amount: 299.00, date: "Sep 1, 2023" },
                ].map((invoice, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Receipt className="h-6 w-6 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Invoice #{2024001 + i}</p>
                        <p className="text-sm text-muted-foreground">{invoice.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {invoice.status}
                      </Badge>
                      <span className="font-medium">${invoice.amount.toFixed(2)}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>Overview of your payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold">$3,588.00</p>
                    <p className="text-sm text-muted-foreground">Last 12 months</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Monthly</p>
                    <p className="text-2xl font-bold">$299.00</p>
                    <p className="text-sm text-muted-foreground">Per month</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Next Payment</p>
                    <p className="text-2xl font-bold">$299.00</p>
                    <p className="text-sm text-muted-foreground">Due Jan 1, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Preferences</CardTitle>
              <CardDescription>Customize your billing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-renew subscription</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically renew your subscription when it expires
                  </p>
                </div>
                <Switch
                  checked={autoRenew}
                  onCheckedChange={setAutoRenew}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Preferences</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive general email notifications for billing events
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Invoice notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new invoices are generated
                      </p>
                    </div>
                    <Switch
                      checked={invoiceNotifications}
                      onCheckedChange={setInvoiceNotifications}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders before payment due dates
                      </p>
                    </div>
                    <Switch
                      checked={paymentReminders}
                      onCheckedChange={setPaymentReminders}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Contact Information</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Billing email</Label>
                    <Input type="email" placeholder="billing@company.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Billing phone</Label>
                    <Input type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                </div>
              </div>
              <Button>Save Preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Customize your invoice preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Invoice Currency</Label>
                    <Input placeholder="USD" />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Input placeholder="Net 30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Additional Invoice Notes</Label>
                  <Input placeholder="Enter any additional information to include on invoices" />
                </div>
              </div>
              <Button>Save Invoice Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>Detailed view of your resource consumption</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Storage Usage</span>
                    <span>45.2 GB / 100 GB</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    You have used 45% of your storage quota
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">API Calls</span>
                    <span>87,429 / 100,000</span>
                  </div>
                  <Progress value={87} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    You have used 87% of your API calls quota
                  </p>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">User Licenses</span>
                    <span>18 / 25</span>
                  </div>
                  <Progress value={72} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    You have used 72% of your user licenses
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Resource usage over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Storage Growth", rate: "+2.3 GB", period: "per month" },
                    { name: "API Usage", rate: "+5.7%", period: "month over month" },
                    { name: "User Growth", rate: "+2 users", period: "last 30 days" },
                  ].map((trend, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{trend.name}</p>
                        <p className="text-sm text-muted-foreground">{trend.period}</p>
                      </div>
                      <Badge variant="secondary">{trend.rate}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage Alerts</CardTitle>
                <CardDescription>Configure resource usage notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Storage alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when storage exceeds 80%
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>API usage alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when API calls exceed 90%
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>License alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when approaching license limit
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 