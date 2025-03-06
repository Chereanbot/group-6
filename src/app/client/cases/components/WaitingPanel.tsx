import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { translate } from "@/utils/translations";
import { Clock, CheckCircle2, Building2, Users } from "lucide-react";
import { motion } from "framer-motion";

interface WaitingPanelProps {
  case_: {
    id: string;
    title: string;
    status: string;
    submittedAt: string;
    targetOffice?: string;
    category?: string;
  };
  isAmharic: boolean;
}

export function WaitingPanel({ case_, isAmharic }: WaitingPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden backdrop-blur-sm bg-opacity-90 border-opacity-50">
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-0" />

        {/* Content */}
        <div className="relative z-10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">{case_.title}</CardTitle>
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1"
              >
                <Clock className="w-4 h-4" />
                {translate("Waiting for Approval", isAmharic)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Status indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {translate("Successfully Submitted", isAmharic)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(case_.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">
                      {translate("Target Office", isAmharic)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {case_.targetOffice || translate("Processing", isAmharic)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress indicators */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {translate("Your case is being reviewed by our coordinators", isAmharic)}
                  </p>
                </div>

                {/* Animated progress bar */}
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "60%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                </div>

                <p className="text-xs text-muted-foreground text-center mt-2">
                  {translate("We will notify you once your case is approved", isAmharic)}
                </p>
              </div>

              {/* Category badge */}
              {case_.category && (
                <Badge variant="outline" className="mt-2">
                  {translate(case_.category, isAmharic)}
                </Badge>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
} 