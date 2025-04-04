import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  FileText,
  Calendar,
  Building2,
  Scale,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PauseCircle,
  ArrowRight,
  UserPlus,
  FileUp,
  CalendarPlus,
  UserMinus,
  FileDown,
  CalendarX,
  ClipboardMinus,
} from 'lucide-react';

interface HistoryEntry {
  id: string;
  action: string;
  actionLabel?: string;
  changeDetails?: string;
  changedAt: string;
  formattedDate?: string;
  client?: { id: string; fullName: string; email: string; status?: string; };
  case?: { id: string; title: string; status: string; };
  lawyer?: { id: string; fullName: string; email: string; };
  office?: { id: string; name: string; };
  document?: { id: string; title: string; type: string; };
  appointment?: { id: string; startTime: string; };
  serviceRequest?: { id: string; title: string; status: string; };
  previousValue?: any;
  newValue?: any;
  context?: any;
  metadata?: any;
}

interface HistoryEntryCardProps {
  entry: HistoryEntry;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 hover:bg-red-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'pending':
      return <PauseCircle className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'cancelled':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getActionIcon = (action: string) => {
  const isAddition = action.includes('CREATED') || action.includes('ASSIGNED');
  const isRemoval = action.includes('REMOVED') || action.includes('DELETED');

  switch (true) {
    case action.includes('CLIENT'):
      return isAddition ? <UserPlus className="h-5 w-5" /> : isRemoval ? <UserMinus className="h-5 w-5" /> : <User className="h-5 w-5" />;
    case action.includes('DOCUMENT'):
      return isAddition ? <FileUp className="h-5 w-5" /> : isRemoval ? <FileDown className="h-5 w-5" /> : <FileText className="h-5 w-5" />;
    case action.includes('APPOINTMENT'):
      return isAddition ? <CalendarPlus className="h-5 w-5" /> : isRemoval ? <CalendarX className="h-5 w-5" /> : <Calendar className="h-5 w-5" />;
    case action.includes('OFFICE'):
      return isAddition ? <Building2 className="h-5 w-5" /> : isRemoval ? <Building2 className="h-5 w-5" /> : <Building2 className="h-5 w-5" />;
    case action.includes('CASE'):
      return isAddition ? <Scale className="h-5 w-5" /> : isRemoval ? <Scale className="h-5 w-5" /> : <Scale className="h-5 w-5" />;
    case action.includes('SERVICE'):
      return isAddition ? <ClipboardList className="h-5 w-5" /> : isRemoval ? <ClipboardMinus className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />;
    default:
      return <ArrowRight className="h-5 w-5" />;
  }
};

export function HistoryEntryCard({ entry }: HistoryEntryCardProps) {
  const getEntityInfo = () => {
    if (entry.client) {
      return {
        title: entry.client.fullName,
        subtitle: entry.client.email,
        status: entry.client.status,
      };
    }
    if (entry.case) {
      return {
        title: entry.case.title,
        subtitle: `Case ID: ${entry.case.id}`,
        status: entry.case.status,
      };
    }
    if (entry.document) {
      return {
        title: entry.document.title,
        subtitle: `${entry.document.type} Document`,
        status: entry.document.type,
      };
    }
    if (entry.appointment) {
      return {
        title: 'Appointment',
        subtitle: format(new Date(entry.appointment.startTime), 'PPpp'),
        status: 'scheduled',
      };
    }
    if (entry.serviceRequest) {
      return {
        title: entry.serviceRequest.title,
        subtitle: `Request ID: ${entry.serviceRequest.id}`,
        status: entry.serviceRequest.status,
      };
    }
    return null;
  };

  const entityInfo = getEntityInfo();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 rounded-full bg-primary/10 text-primary">
            {getActionIcon(entry.action)}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{entry.actionLabel}</h3>
                {entityInfo?.status && (
                  <Badge variant="secondary" className={getStatusColor(entityInfo.status)}>
                    {getStatusIcon(entityInfo.status)}
                    <span className="ml-1">{entityInfo.status}</span>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{entry.formattedDate}</span>
              </div>
            </div>
            {entityInfo && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">{entityInfo.title}</p>
                <p>{entityInfo.subtitle}</p>
              </div>
            )}
            {entry.changeDetails && (
              <p className="text-sm text-muted-foreground mt-2">{entry.changeDetails}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 