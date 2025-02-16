export interface Education {
  degree: string;
  institution: string;
  year: number;
}

export interface Specialization {
  id: string;
  facultyName: string;
  title: string;
  department: string;
  specialization: string;
  description: string;
  yearsOfExperience: number;
  casesHandled: number;
  successRate: number;
  expertise: string[];
  currentCases: number;
  education: Education[];
} 