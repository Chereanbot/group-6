export const defaultTemplates = {
  CASE: [
    {
      name: "Criminal Defense Template",
      type: "CASE",
      content: {
        sections: [
          {
            title: "Client Information",
            fields: [
              "Full Name",
              "Date of Birth",
              "National ID",
              "Contact Number",
              "Address"
            ]
          },
          {
            title: "Case Details",
            fields: [
              "Case Number",
              "Charge Type",
              "Arrest Date",
              "Police Station",
              "Investigating Officer",
              "Court Details"
            ]
          },
          {
            title: "Evidence Details",
            fields: [
              "Physical Evidence",
              "Witness Names",
              "Police Reports",
              "Medical Reports",
              "Additional Documents"
            ]
          },
          {
            title: "Legal Strategy",
            fields: [
              "Defense Strategy",
              "Key Arguments",
              "Potential Challenges",
              "Timeline",
              "Next Steps"
            ]
          }
        ]
      },
      isDefault: true,
      createdBy: "",
      officeId: ""
    },
    {
      name: "Family Law Case Template",
      type: "CASE",
      content: {
        sections: [
          {
            title: "Family Details",
            fields: [
              "Petitioner Name",
              "Respondent Name",
              "Marriage Date",
              "Separation Date",
              "Children Details"
            ]
          },
          {
            title: "Property Information",
            fields: [
              "Joint Properties",
              "Individual Assets",
              "Debts and Liabilities",
              "Income Sources",
              "Monthly Expenses"
            ]
          },
          {
            title: "Child Custody",
            fields: [
              "Current Arrangement",
              "Proposed Custody Plan",
              "Child Support Details",
              "Visitation Schedule",
              "Special Considerations"
            ]
          }
        ]
      },
      isDefault: true,
      createdBy: "",
      officeId: ""
    },
    {
      name: "Labor Dispute Template",
      type: "CASE",
      content: {
        sections: [
          {
            title: "Employee Information",
            fields: [
              "Employee Name",
              "Employee ID",
              "Position/Title",
              "Department",
              "Employment Start Date",
              "Employment End Date",
              "Salary/Wage Details"
            ]
          },
          {
            title: "Employer Information",
            fields: [
              "Company Name",
              "Company Registration",
              "Industry Type",
              "HR Contact Person",
              "Company Address"
            ]
          },
          {
            title: "Dispute Details",
            fields: [
              "Dispute Type",
              "Date of Incident",
              "Description of Issue",
              "Prior Complaints",
              "Witnesses",
              "Supporting Documents"
            ]
          },
          {
            title: "Resolution Attempts",
            fields: [
              "Internal Measures Taken",
              "Mediation Attempts",
              "Union Involvement",
              "Proposed Solutions"
            ]
          }
        ]
      },
      isDefault: true,
      createdBy: "",
      officeId: ""
    },
    {
      name: "Property Dispute Template",
      type: "CASE",
      content: {
        sections: [
          {
            title: "Property Details",
            fields: [
              "Property Address",
              "Property Type",
              "Registration Number",
              "Size/Area",
              "Current Market Value"
            ]
          },
          {
            title: "Ownership Information",
            fields: [
              "Current Owner",
              "Previous Owners",
              "Purchase Date",
              "Title Deed Number",
              "Mortgage Details"
            ]
          },
          {
            title: "Dispute Information",
            fields: [
              "Nature of Dispute",
              "Opposing Parties",
              "Disputed Area/Rights",
              "Date Dispute Arose",
              "Previous Settlement Attempts"
            ]
          }
        ]
      },
      isDefault: false,
      createdBy: "",
      officeId: ""
    }
  ],
  CLIENT: [
    {
      name: "Individual Client Profile",
      type: "CLIENT",
      content: {
        sections: [
          {
            title: "Personal Information",
            fields: [
              "Full Name",
              "Date of Birth",
              "Gender",
              "National ID",
              "Marital Status",
              "Occupation"
            ]
          },
          {
            title: "Contact Information",
            fields: [
              "Primary Phone",
              "Secondary Phone",
              "Email",
              "Current Address",
              "Permanent Address",
              "Emergency Contact"
            ]
          },
          {
            title: "Financial Information",
            fields: [
              "Monthly Income",
              "Employment Status",
              "Employer Details",
              "Bank Account Info",
              "Assets Overview",
              "Liabilities"
            ]
          }
        ]
      },
      isDefault: true,
      createdBy: "",
      officeId: ""
    }
  ],
  DOCUMENT: [
    {
      name: "Legal Notice Template",
      type: "DOCUMENT",
      content: {
        sections: [
          {
            title: "Header Information",
            fields: [
              "Notice Date",
              "Reference Number",
              "Sender Details",
              "Recipient Details"
            ]
          },
          {
            title: "Notice Content",
            fields: [
              "Subject Line",
              "Legal Basis",
              "Factual Background",
              "Demands/Requests",
              "Timeline for Response"
            ]
          },
          {
            title: "Closing",
            fields: [
              "Consequences of Non-compliance",
              "Contact Information",
              "Signature Block",
              "CC Recipients"
            ]
          }
        ]
      },
      isDefault: true,
      createdBy: "",
      officeId: ""
    },
    {
      name: "Court Petition Template",
      type: "DOCUMENT",
      content: {
        sections: [
          {
            title: "Court Information",
            fields: [
              "Court Name",
              "Division/Chamber",
              "Case Number",
              "Filing Date"
            ]
          },
          {
            title: "Petitioner Details",
            fields: [
              "Petitioner Name",
              "Legal Status",
              "Address for Service",
              "Contact Information"
            ]
          },
          {
            title: "Petition Content",
            fields: [
              "Prayer/Relief Sought",
              "Legal Grounds",
              "Facts of the Case",
              "Supporting Evidence",
              "Legal Arguments"
            ]
          }
        ]
      },
      isDefault: true,
      createdBy: "",
      officeId: ""
    },
    {
      name: "Settlement Agreement",
      type: "DOCUMENT",
      content: {
        sections: [
          {
            title: "Party Information",
            fields: [
              "First Party Details",
              "Second Party Details",
              "Legal Representatives",
              "Witnesses"
            ]
          },
          {
            title: "Settlement Terms",
            fields: [
              "Agreement Date",
              "Settlement Amount",
              "Payment Terms",
              "Conditions",
              "Timeline"
            ]
          },
          {
            title: "Legal Provisions",
            fields: [
              "Governing Law",
              "Jurisdiction",
              "Confidentiality Terms",
              "Breach Consequences",
              "Amendment Process"
            ]
          }
        ]
      },
      isDefault: false,
      createdBy: "",
      officeId: ""
    }
  ],
  REPORT: [
    {
      name: "Case Progress Report",
      type: "REPORT",
      content: {
        sections: [
          {
            title: "Case Overview",
            fields: [
              "Case Number",
              "Client Name",
              "Case Type",
              "Start Date",
              "Current Status"
            ]
          },
          {
            title: "Progress Details",
            fields: [
              "Actions Completed",
              "Pending Actions",
              "Challenges Faced",
              "Solutions Implemented",
              "Next Steps"
            ]
          },
          {
            title: "Timeline",
            fields: [
              "Important Dates",
              "Court Appearances",
              "Filing Deadlines",
              "Client Meetings",
              "Upcoming Events"
            ]
          },
          {
            title: "Resource Allocation",
            fields: [
              "Assigned Staff",
              "Hours Spent",
              "Expenses Incurred",
              "Additional Resources Needed"
            ]
          }
        ]
      },
      isDefault: true,
      createdBy: "",
      officeId: ""
    },
    {
      name: "Monthly Performance Report",
      type: "REPORT",
      content: {
        sections: [
          {
            title: "Case Statistics",
            fields: [
              "New Cases",
              "Resolved Cases",
              "Pending Cases",
              "Success Rate",
              "Average Resolution Time"
            ]
          },
          {
            title: "Financial Metrics",
            fields: [
              "Revenue Generated",
              "Expenses",
              "Outstanding Payments",
              "Cost per Case",
              "Budget Utilization"
            ]
          },
          {
            title: "Client Satisfaction",
            fields: [
              "Feedback Scores",
              "Complaints Received",
              "Resolution Rate",
              "Improvement Areas",
              "Client Testimonials"
            ]
          }
        ]
      },
      isDefault: true,
      createdBy: "",
      officeId: ""
    }
  ]
}; 