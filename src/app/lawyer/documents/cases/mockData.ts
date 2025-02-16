export const mockCases = [
  {
    id: "1",
    caseNumber: "2024-001",
    title: "Smith vs. Johnson",
    clientName: "John Smith",
    status: "ACTIVE",
    priority: "HIGH",
    dueDate: new Date("2024-04-15"),
    practiceArea: "Civil Litigation",
    nextHearing: new Date("2024-03-20"),
    assignedTeam: ["Sarah Wilson", "Mike Thompson"],
    description: "Contract dispute over construction project delays",
    documents: [
      {
        id: "d1",
        name: "Complaint.pdf",
        type: "PDF",
        size: 1024576,
        uploadedAt: new Date("2024-02-15")
      },
      {
        id: "d2",
        name: "Evidence-A.docx",
        type: "DOCX",
        size: 2048576,
        uploadedAt: new Date("2024-02-16")
      }
    ]
  },
  {
    id: "2",
    caseNumber: "2024-002",
    title: "Estate of Williams",
    clientName: "Mary Williams",
    status: "PENDING",
    priority: "MEDIUM",
    dueDate: new Date("2024-05-20"),
    practiceArea: "Estate Planning",
    nextHearing: new Date("2024-04-10"),
    assignedTeam: ["Robert Brown"],
    description: "Probate proceedings for estate distribution",
    documents: [
      {
        id: "d3",
        name: "Will.pdf",
        type: "PDF",
        size: 512000,
        uploadedAt: new Date("2024-02-10")
      }
    ]
  },
  {
    id: "3",
    caseNumber: "2024-003",
    title: "Tech Corp vs. Innovation Inc",
    clientName: "Tech Corp",
    status: "ACTIVE",
    priority: "HIGH",
    dueDate: new Date("2024-06-30"),
    practiceArea: "Intellectual Property",
    nextHearing: new Date("2024-03-25"),
    assignedTeam: ["Sarah Wilson", "James Lee", "Anna Martinez"],
    description: "Patent infringement case regarding mobile technology",
    documents: [
      {
        id: "d4",
        name: "Patent-Documentation.pdf",
        type: "PDF",
        size: 5242880,
        uploadedAt: new Date("2024-02-01")
      },
      {
        id: "d5",
        name: "Technical-Analysis.xlsx",
        type: "XLSX",
        size: 1048576,
        uploadedAt: new Date("2024-02-05")
      }
    ]
  }
];

export const practiceAreas = [
  "Civil Litigation",
  "Criminal Defense",
  "Estate Planning",
  "Corporate Law",
  "Intellectual Property",
  "Family Law",
  "Real Estate",
  "Employment Law",
  "Immigration",
  "Tax Law"
];

export const caseStatuses = [
  { value: "ACTIVE", label: "Active" },
  { value: "PENDING", label: "Pending" },
  { value: "CLOSED", label: "Closed" },
  { value: "ON_HOLD", label: "On Hold" }
];

export const priorities = [
  { value: "HIGH", label: "High", color: "destructive" },
  { value: "MEDIUM", label: "Medium", color: "default" },
  { value: "LOW", label: "Low", color: "secondary" }
]; 