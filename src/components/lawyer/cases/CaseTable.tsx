import { Case, CaseStatus, Priority } from '@prisma/client';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface CaseTableProps {
  cases: Case[];
}

export default function CaseTable({ cases }: CaseTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Expected Resolution</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((case_) => (
            <TableRow key={case_.id}>
              <TableCell>
                <Link 
                  href={`/lawyer/cases/${case_.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {case_.title}
                </Link>
              </TableCell>
              <TableCell>{case_.client.fullName}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(case_.status)}>
                  {case_.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getPriorityVariant(case_.priority)}>
                  {case_.priority}
                </Badge>
              </TableCell>
              <TableCell>{case_.caseType}</TableCell>
              <TableCell>
                {case_.expectedResolutionDate ? 
                  new Date(case_.expectedResolutionDate).toLocaleDateString() : 
                  'Not set'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link 
                    href={`/lawyer/cases/${case_.id}/edit`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </Link>
                  <Link 
                    href={`/lawyer/cases/${case_.id}/documents`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Documents
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function getStatusVariant(status: CaseStatus) {
  switch (status) {
    case 'ACTIVE': return 'success';
    case 'PENDING': return 'warning';
    case 'RESOLVED': return 'default';
    case 'CANCELLED': return 'destructive';
    default: return 'default';
  }
}

function getPriorityVariant(priority: Priority) {
  switch (priority) {
    case 'URGENT': return 'destructive';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'default';
    case 'LOW': return 'secondary';
    default: return 'default';
  }
} 