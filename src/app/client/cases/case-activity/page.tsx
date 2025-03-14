"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientCaseActivityList } from "@/components/client/cases/ClientCaseActivityList";
import { ClientCaseOverview } from "@/components/client/cases/ClientCaseOverview";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ClientCaseActivityPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Case Activities</h1>
        <p className="text-muted-foreground mt-2">
          Track your case progress, activities, and updates
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Case Overview</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Case Overview</CardTitle>
              <CardDescription>
                Summary of your case status and progress
              </CardDescription>
            </CardHeader>
            <ClientCaseOverview />
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>Case Activities</CardTitle>
              <CardDescription>
                Recent updates and activities on your case
              </CardDescription>
            </CardHeader>
            <ClientCaseActivityList />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 