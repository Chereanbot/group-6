import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { translate } from '@/utils/translations';
import {
  Calendar,
  FileText,
  MessageSquare,
  User,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Download,
  ExternalLink,
  History,
  CalendarDays,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Case } from '../types';

interface CaseDetailsDialogProps {
  case_: Case | null;
  isOpen: boolean;
  onClose: () => void;
  isAmharic: boolean;
}

export function CaseDetailsDialog({
  case_,
  isOpen,
  onClose,
  isAmharic,
}: CaseDetailsDialogProps) {
  if (!case_) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'CLOSED':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'PPp');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const renderTimeline = () => {
    type ActivityItem = {
      id: string;
      title: string;
      description: string;
      createdAt: string;
      user: { fullName: string };
    };

    type EventItem = {
      id: string;
      title: string;
      scheduledFor: string;
      status: string;
    };

    type DocumentItem = {
      id: string;
      title: string;
      path: string;
      uploadedAt: string;
      uploader: { fullName: string };
      description?: string;
    };

    type TimelineItem = {
      type: 'activity';
      date: Date;
      data: ActivityItem;
    } | {
      type: 'event';
      date: Date;
      data: EventItem;
    } | {
      type: 'document';
      date: Date;
      data: DocumentItem;
    };

    const createTimelineDate = (dateString: string): Date => {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? new Date() : date;
    };

    const timelineItems: TimelineItem[] = [
      ...(case_.activities || []).map(activity => ({
        type: 'activity' as const,
        date: createTimelineDate(activity.createdAt),
        data: activity as ActivityItem,
      })),
      ...(case_.caseEvents || []).map(event => ({
        type: 'event' as const,
        date: createTimelineDate(event.scheduledFor),
        data: event as EventItem,
      })),
      ...(case_.documents || []).map(doc => ({
        type: 'document' as const,
        date: createTimelineDate(doc.uploadedAt),
        data: doc as DocumentItem,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    return (
      <div className="space-y-4">
        {timelineItems.map((item, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="mt-1">
              {item.type === 'activity' && <MessageSquare className="w-4 h-4 text-blue-500" />}
              {item.type === 'event' && <Calendar className="w-4 h-4 text-green-500" />}
              {item.type === 'document' && <FileText className="w-4 h-4 text-orange-500" />}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.data.title}</p>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(item.date.toISOString())}
                </span>
              </div>
              {item.type === 'activity' && (
                <p className="text-sm text-muted-foreground">{item.data.user.fullName}</p>
              )}
              {item.type === 'event' && (
                <Badge variant="outline">{translate(item.data.status, isAmharic)}</Badge>
              )}
              {item.type === 'document' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.data.path, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {translate('View', isAmharic)}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(item.data.path, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {translate('Download', isAmharic)}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{case_.title}</DialogTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{translate('Quick Actions', isAmharic)}</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Calendar className="w-4 h-4 mr-2" />
                  {translate('Schedule Appointment', isAmharic)}
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  {translate('Upload Document', isAmharic)}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <XCircle className="w-4 h-4 mr-2" />
                  {translate('Close Case', isAmharic)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className="flex items-center gap-2 px-4 py-1"
            >
              {getStatusIcon(case_.status)}
              {translate(case_.status, isAmharic)}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-2 px-4 py-1"
            >
              <AlertTriangle className="w-4 h-4" />
              {translate(case_.priority, isAmharic)}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-2 px-4 py-1"
            >
              <History className="w-4 h-4" />
              {translate('Created', isAmharic)}: {formatDate(case_.createdAt)}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="timeline" className="mt-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="timeline">
              <History className="w-4 h-4 mr-2" />
              {translate('Timeline', isAmharic)}
            </TabsTrigger>
            <TabsTrigger value="details">
              <FileText className="w-4 h-4 mr-2" />
              {translate('Details', isAmharic)}
            </TabsTrigger>
            <TabsTrigger value="staff">
              <User className="w-4 h-4 mr-2" />
              {translate('Staff', isAmharic)}
            </TabsTrigger>
            <TabsTrigger value="appointments">
              <CalendarDays className="w-4 h-4 mr-2" />
              {translate('Appointments', isAmharic)}
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="w-4 h-4 mr-2" />
              {translate('Documents', isAmharic)}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4 pr-4">
            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  {renderTimeline()}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value="details" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">{translate('Description', isAmharic)}</h3>
                      <p className="text-sm text-muted-foreground">{case_.description || translate('No description available', isAmharic)}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">{translate('Category Details', isAmharic)}</h3>
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">{translate('Category', isAmharic)}:</span>{' '}
                          {translate(case_.category || 'Not specified', isAmharic)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">{translate('Status', isAmharic)}:</span>{' '}
                          {translate(case_.status || 'Not specified', isAmharic)}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">{translate('Priority', isAmharic)}:</span>{' '}
                          {translate(case_.priority || 'Not specified', isAmharic)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Lawyer */}
                    <div className="space-y-2">
                      <h3 className="font-medium">{translate('Assigned Lawyer', isAmharic)}</h3>
                      {case_.assignedLawyer ? (
                        <div className="p-4 rounded-lg border">
                          <p className="font-medium">{case_.assignedLawyer.fullName}</p>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {case_.assignedLawyer.email && (
                              <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {case_.assignedLawyer.email}
                              </p>
                            )}
                            {case_.assignedLawyer.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                {case_.assignedLawyer.phone}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {case_.assignedLawyer.lawyerProfile?.specializations?.map((spec) => (
                              <Badge
                                key={spec.specialization.name}
                                variant="secondary"
                                className="text-xs"
                              >
                                {translate(spec.specialization.name, isAmharic)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {translate('No lawyer assigned', isAmharic)}
                        </p>
                      )}
                    </div>

                    {/* Client */}
                    <div className="space-y-2">
                      <h3 className="font-medium">{translate('Client', isAmharic)}</h3>
                      <div className="p-4 rounded-lg border">
                        {case_.client ? (
                          <>
                            <p className="font-medium">{case_.client.fullName}</p>
                            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                              {case_.client.email && (
                                <p className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  {case_.client.email}
                                </p>
                              )}
                              {case_.client.phone && (
                                <p className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  {case_.client.phone}
                                </p>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            {translate('Client information not available', isAmharic)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  {(case_.caseEvents || []).length > 0 ? (
                    <div className="space-y-4">
                      {case_.caseEvents.map((event) => (
                        <div key={event.id} className="p-4 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{event.title}</p>
                            <Badge variant="outline">
                              {translate(event.status || 'Not specified', isAmharic)}
                            </Badge>
                          </div>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(event.scheduledFor)}
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {formatDateTime(event.scheduledFor)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {translate('No appointments scheduled', isAmharic)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  {(case_.documents || []).length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {case_.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-lg border space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(doc.uploadedAt)}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {doc.path && (
                                  <>
                                    <DropdownMenuItem onClick={() => window.open(doc.path, '_blank')}>
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      {translate('View', isAmharic)}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => window.open(doc.path, '_blank')}>
                                      <Download className="w-4 h-4 mr-2" />
                                      {translate('Download', isAmharic)}
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {'description' in doc && doc.description && (
                            <p className="text-sm text-muted-foreground">{doc.description as string}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {translate('No documents available', isAmharic)}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            {translate('Close', isAmharic)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 