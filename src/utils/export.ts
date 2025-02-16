import { ServiceRequest } from '@/types/service.types';

export function convertToCSV(data: ServiceRequest[]): string {
  const headers = [
    'ID',
    'Client Name',
    'Client Email',
    'Service Type',
    'Package',
    'Price',
    'Status',
    'Assigned Lawyer',
    'Created At'
  ];

  const rows = data.map(request => [
    request.id,
    request.client.fullName,
    request.client.email,
    request.serviceType,
    request.package.name,
    request.package.price,
    request.status,
    request.assignedLawyer?.fullName || 'Unassigned',
    new Date(request.createdAt).toLocaleString()
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) { // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
} 