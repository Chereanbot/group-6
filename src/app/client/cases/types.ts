export interface Case {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedLawyer?: {
    fullName: string;
    email: string;
    phone: string;
    lawyerProfile?: {
      specializations: Array<{
        specialization: {
          name: string;
        };
      }>;
    };
  };
  assignedCoordinator?: {
    fullName: string;
    email: string;
    phone: string;
    coordinator?: {
      type: string;
      office: {
        name: string;
        location: string;
      };
    };
  };
  client: {
    fullName: string;
    email: string;
    phone: string;
  };
  caseEvents: Array<{
    id: string;
    title: string;
    scheduledFor: string;
    status: string;
  }>;
  documents: Array<{
    id: string;
    title: string;
    path: string;
    uploadedAt: string;
    uploader: {
      fullName: string;
    };
  }>;
  activities: Array<{
    id: string;
    title: string;
    description: string;
    createdAt: string;
    user: {
      fullName: string;
    };
  }>;
} 