"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseActivityList } from "@/components/lawyer/cases/CaseActivityList";
import { CreateCaseActivity } from "@/components/lawyer/cases/CreateCaseActivity";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CaseActivityPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Case Activities</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all case-related activities, meetings, and updates
        </p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Activity List</TabsTrigger>
          <TabsTrigger value="create">Create Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Activity List</CardTitle>
              <CardDescription>
                View and manage all case activities
              </CardDescription>
            </CardHeader>
            <CaseActivityList />
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Activity</CardTitle>
              <CardDescription>
                Add a new activity to track case progress
              </CardDescription>
            </CardHeader>
            <CreateCaseActivity />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 