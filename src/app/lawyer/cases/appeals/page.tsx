"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppealsList } from "@/components/lawyer/cases/AppealsList";
import { CreateAppeal } from "@/components/lawyer/cases/CreateAppeal";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AppealsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Case Appeals</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track case appeals, hearings, and documents
        </p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Appeals List</TabsTrigger>
          <TabsTrigger value="create">File New Appeal</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Appeals List</CardTitle>
              <CardDescription>
                View and manage all case appeals
              </CardDescription>
            </CardHeader>
            <AppealsList />
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>File New Appeal</CardTitle>
              <CardDescription>
                Create a new appeal for an existing case
              </CardDescription>
            </CardHeader>
            <CreateAppeal />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 