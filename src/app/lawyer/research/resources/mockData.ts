export interface ResearchResource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'link' | 'note';
  url?: string;
  createdAt: string;
  updatedAt: string;
}

export const mockResources: ResearchResource[] = [
  {
    id: '1',
    title: 'Legal Research Guide',
    description: 'Comprehensive guide for legal research methods',
    type: 'document',
    url: '/documents/legal-research-guide.pdf',
    createdAt: '2024-03-14T10:00:00Z',
    updatedAt: '2024-03-14T10:00:00Z'
  },
  {
    id: '2',
    title: 'Case Law Database',
    description: 'Link to the main case law database',
    type: 'link',
    url: 'https://caselaw.example.com',
    createdAt: '2024-03-14T10:01:00Z',
    updatedAt: '2024-03-14T10:01:00Z'
  },
  {
    id: '3',
    title: 'Research Notes',
    description: 'Important notes about recent legal precedents',
    type: 'note',
    createdAt: '2024-03-14T10:02:00Z',
    updatedAt: '2024-03-14T10:02:00Z'
  }
]; 