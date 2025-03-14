"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommunicationSettings from "@/components/lawyer/settings/CommunicationSettings";
import SecuritySettings from "@/components/lawyer/settings/SecuritySettings";
import BillingSettings from "@/components/lawyer/settings/BillingSettings";
import PreferencesSettings from "@/components/lawyer/settings/PreferencesSettings";
import CalendarSettings from "@/components/lawyer/settings/CalendarSettings";
import DocumentSettings from "@/components/lawyer/settings/DocumentSettings";
import NotificationSettings from "@/components/lawyer/settings/NotificationSettings";
import ProfileSettings from "@/components/lawyer/settings/ProfileSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <Card className="mt-6">
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="communication">
            <CommunicationSettings />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="billing">
            <BillingSettings />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesSettings />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarSettings />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentSettings />
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}