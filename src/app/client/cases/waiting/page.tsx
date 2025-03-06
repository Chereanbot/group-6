"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WaitingPanel } from "../components/WaitingPanel";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { translate } from "@/utils/translations";
import { useLanguage } from "@/hooks/useLanguage";
import { Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";

interface WaitingCase {
  id: string;
  title: string;
  status: string;
  submittedAt: string;
  targetOffice?: string;
  category?: string;
}

export default function WaitingCasesPage() {
  const [cases, setCases] = useState<WaitingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAmharic } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const fetchWaitingCases = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/cases/waiting");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch waiting cases");
        }

        const data = await response.json();
        setCases(data);
        setError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to fetch waiting cases";
        setError(message);
        toast({
          variant: "destructive",
          title: translate("Error", isAmharic),
          description: translate(message, isAmharic),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWaitingCases();
  }, [isAmharic, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{translate("Error", isAmharic)}</AlertTitle>
          <AlertDescription>
            {translate(error, isAmharic)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{translate("No Waiting Cases", isAmharic)}</AlertTitle>
          <AlertDescription>
            {translate("You don't have any cases waiting for approval at the moment.", isAmharic)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-2xl font-semibold">
            {translate("Waiting Cases", isAmharic)}
          </h1>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{translate("Cases Under Review", isAmharic)}</AlertTitle>
          <AlertDescription>
            {translate(
              "Your cases are being reviewed by our coordinators. We will notify you once they are approved.",
              isAmharic
            )}
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cases.map((case_, index) => (
          <motion.div
            key={case_.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <WaitingPanel case_={case_} isAmharic={isAmharic} />
          </motion.div>
        ))}
      </div>
    </div>
  );
} 