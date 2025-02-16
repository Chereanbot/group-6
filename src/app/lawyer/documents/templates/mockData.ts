export const mockTemplates = [
  {
    id: "1",
    name: "Client Engagement Agreement",
    category: "Contracts",
    description: "Standard client engagement agreement template with customizable terms",
    format: "DOCX",
    lastModified: new Date("2024-02-15"),
    tags: ["contract", "engagement", "client"],
    usageCount: 45
  },
  {
    id: "2",
    name: "Motion to Dismiss Template",
    category: "Litigation",
    description: "General purpose motion to dismiss with standard legal arguments",
    format: "DOCX",
    lastModified: new Date("2024-02-10"),
    tags: ["motion", "litigation", "dismissal"],
    usageCount: 28
  },
  {
    id: "3",
    name: "Settlement Agreement",
    category: "Settlements",
    description: "Comprehensive settlement agreement template with optional clauses",
    format: "DOCX",
    lastModified: new Date("2024-02-01"),
    tags: ["settlement", "agreement", "resolution"],
    usageCount: 32
  },
  {
    id: "4",
    name: "Power of Attorney",
    category: "Estate Planning",
    description: "Standard power of attorney document with customizable powers",
    format: "DOCX",
    lastModified: new Date("2024-01-28"),
    tags: ["power of attorney", "estate", "authorization"],
    usageCount: 15
  }
];

export const categories = [
  "All",
  "Contracts",
  "Litigation",
  "Corporate",
  "Real Estate",
  "Employment",
  "Settlements",
  "Estate Planning",
  "Intellectual Property",
  "Family Law",
  "Criminal Defense",
  "Immigration"
];

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  format: string;
  lastModified: Date;
  tags: string[];
  usageCount: number;
}

export const templateStatuses = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" }
];

export const templateTypes = [
  { value: "AGREEMENT", label: "Agreement" },
  { value: "MOTION", label: "Motion" },
  { value: "LETTER", label: "Letter" },
  { value: "PLEADING", label: "Pleading" },
  { value: "FORM", label: "Form" }
]; 