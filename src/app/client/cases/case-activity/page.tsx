"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClientCaseActivityList } from "@/components/client/cases/ClientCaseActivityList";
import { ClientCaseOverview } from "@/components/client/cases/ClientCaseOverview";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLanguage } from "@/providers/LanguageProvider";

export default function ClientCaseActivityPage() {
  const { t } = useLanguage();
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('caseActivity.title', 'My Case Activities')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('caseActivity.subtitle', 'Track your case progress, activities, and updates')}
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t('caseActivity.tabs.overview', 'Case Overview')}</TabsTrigger>
          <TabsTrigger value="activities">{t('caseActivity.tabs.activities', 'Activities')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>{t('caseActivity.overview.title', 'Case Overview')}</CardTitle>
              <CardDescription>
                {t('caseActivity.overview.description', 'Summary of your case status and progress')}
              </CardDescription>
            </CardHeader>
            <ClientCaseOverview />
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>{t('caseActivity.activities.title', 'Case Activities')}</CardTitle>
              <CardDescription>
                {t('caseActivity.activities.description', 'Recent updates and activities on your case')}
              </CardDescription>
            </CardHeader>
            <ClientCaseActivityList />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 