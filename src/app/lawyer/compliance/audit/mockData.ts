import { addDays, subDays } from "date-fns";
import { AuditRecord } from "./interfaces";

export const mockUsers = [
  { id: "1", name: "Abebe Bekele", role: "Compliance Officer" },
  { id: "2", name: "Tigist Haile", role: "Legal Auditor" },
  { id: "3", name: "Mekonnen Tadesse", role: "Senior Partner" },
  { id: "4", name: "Bethlehem Alemu", role: "Compliance Analyst" },
];

export const mockAudits: AuditRecord[] = [
  {
    id: "1",
    type: "INTERNAL",
    status: "IN_PROGRESS",
    priority: "HIGH",
    category: "CLIENT_CONFIDENTIALITY",
    description: "Annual review of client data protection measures and confidentiality protocols",
    findings: "Several outdated access protocols identified",
    recommendations: "Update access control systems and implement new security measures",
    dueDate: addDays(new Date(), 15),
    assignedTo: {
      id: "1",
      name: "Abebe Bekele",
      role: "Compliance Officer"
    },
    documents: [
      {
        id: "d1",
        name: "Data Protection Report.pdf",
        type: "application/pdf",
        url: "/documents/report.pdf",
        size: 2500000,
        uploadedAt: new Date(),
        uploadedBy: {
          id: "1",
          name: "Abebe Bekele"
        }
      }
    ],
    comments: [
      {
        id: "c1",
        content: "Initial assessment completed",
        createdAt: subDays(new Date(), 5),
        user: {
          id: "1",
          name: "Abebe Bekele",
          role: "Compliance Officer"
        }
      }
    ],
    createdAt: subDays(new Date(), 10),
    updatedAt: new Date(),
    metadata: {
      riskLevel: "HIGH",
      impact: "SEVERE",
      scope: ["Data Protection", "Security"],
      complianceFrameworks: ["GDPR", "CCPA"]
    }
  },
  {
    id: "2",
    type: "REGULATORY",
    status: "PENDING",
    priority: "CRITICAL",
    category: "FINANCIAL_COMPLIANCE",
    description: "Quarterly financial compliance review and audit of trust accounts",
    dueDate: addDays(new Date(), 30),
    assignedTo: {
      id: "2",
      name: "Tigist Haile",
      role: "Legal Auditor"
    },
    documents: [],
    comments: [],
    createdAt: subDays(new Date(), 2),
    updatedAt: new Date(),
    metadata: {
      riskLevel: "MEDIUM",
      impact: "MODERATE",
      scope: ["Financial", "Trust Accounts"],
      complianceFrameworks: ["ABA Guidelines"]
    }
  },
  {
    id: "3",
    type: "EXTERNAL",
    status: "COMPLETED",
    priority: "MEDIUM",
    category: "DOCUMENT_RETENTION",
    description: "External audit of document retention policies and procedures",
    findings: "All procedures compliant with current regulations",
    recommendations: "Consider implementing automated archival system",
    dueDate: subDays(new Date(), 5),
    completedDate: subDays(new Date(), 1),
    assignedTo: {
      id: "3",
      name: "Mekonnen Tadesse",
      role: "Senior Partner"
    },
    documents: [
      {
        id: "d2",
        name: "Audit Results.docx",
        type: "application/docx",
        url: "/documents/audit.docx",
        size: 1500000,
        uploadedAt: subDays(new Date(), 1),
        uploadedBy: {
          id: "3",
          name: "Mekonnen Tadesse"
        }
      }
    ],
    comments: [],
    createdAt: subDays(new Date(), 30),
    updatedAt: subDays(new Date(), 1),
    metadata: {
      riskLevel: "LOW",
      impact: "MINOR",
      scope: ["Document Management"],
      complianceFrameworks: ["State Bar Guidelines"]
    }
  }
];