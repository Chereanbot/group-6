export interface LawyerProfile {
  id: number;
  name: string;
  role: string;
  image: string;
  education: {
    degree: string;
    university: string;
    year: string;
  }[];
  experience: {
    position: string;
    organization: string;
    duration: string;
    description: string;
  }[];
  specializations: {
    area: string;
    description: string;
    expertiseLevel: 'Expert' | 'Advanced' | 'Intermediate';
  }[];
  rates: {
    consultationFee: number;
    hourlyRate: number;
    retainerFee?: number;
  };
  languages: string[];
  barAssociation: string;
  licenseNumber: string;
  contactInfo: {
    email: string;
    phone: string;
    office: string;
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  availability: {
    days: string[];
    hours: string;
  };
  ratings: {
    overall: number;
    totalCases: number;
    successRate: number;
    clientReviews: number;
  };
}

export const lawyers: LawyerProfile[] = [
  {
    id: 1,
    name: "Dr. Abebe Kebede",
    role: "Senior Legal Advisor",
    image: "/images/lawyers/lawyer1.jpg",
    education: [
      {
        degree: "PhD in Law",
        university: "Addis Ababa University",
        year: "2010"
      },
      {
        degree: "LLM in Criminal Law",
        university: "Harvard Law School",
        year: "2005"
      }
    ],
    experience: [
      {
        position: "Senior Legal Advisor",
        organization: "Dilla University Legal Aid Service",
        duration: "2015-Present",
        description: "Leading the criminal law division and handling complex criminal cases"
      },
      {
        position: "Public Prosecutor",
        organization: "Federal Attorney General",
        duration: "2010-2015",
        description: "Prosecuted high-profile criminal cases and led investigation teams"
      }
    ],
    specializations: [
      {
        area: "Criminal Law",
        description: "Specializing in serious criminal offenses and appeals",
        expertiseLevel: "Expert"
      },
      {
        area: "Constitutional Law",
        description: "Focus on civil rights and constitutional matters",
        expertiseLevel: "Advanced"
      }
    ],
    rates: {
      consultationFee: 500,
      hourlyRate: 1500,
      retainerFee: 10000
    },
    languages: ["Amharic", "English", "Oromiffa"],
    barAssociation: "Ethiopian Bar Association",
    licenseNumber: "EBA-2005-1234",
    contactInfo: {
      email: "abebe.kebede@dulas.edu.et",
      phone: "+251 911 234 567",
      office: "Main Campus, Legal Aid Clinic, Room 205"
    },
    socialMedia: {
      linkedin: "https://linkedin.com/in/abekebede",
      twitter: "https://twitter.com/abekebede",
      website: "https://dulas.edu.et/lawyers/abekebede"
    },
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      hours: "9:00 AM - 5:00 PM"
    },
    ratings: {
      overall: 4.9,
      totalCases: 150,
      successRate: 92,
      clientReviews: 87
    }
  },
  {
    id: 2,
    name: "Mrs. Tigist Haile",
    role: "Family Law Specialist",
    image: "/images/lawyers/lawyer2.jpg",
    education: [
      {
        degree: "LLM in Family Law",
        university: "Harvard Law School",
        year: "2012"
      },
      {
        degree: "LLB",
        university: "Addis Ababa University",
        year: "2008"
      }
    ],
    experience: [
      {
        position: "Family Law Specialist",
        organization: "Dilla University Legal Aid Service",
        duration: "2016-Present",
        description: "Handling family disputes, divorce cases, and child custody matters"
      },
      {
        position: "Legal Consultant",
        organization: "Women's Rights Association",
        duration: "2012-2016",
        description: "Provided legal counsel for women's rights and family matters"
      }
    ],
    specializations: [
      {
        area: "Family Law",
        description: "Expert in divorce, custody, and family dispute resolution",
        expertiseLevel: "Expert"
      },
      {
        area: "Women's Rights",
        description: "Advocate for women's legal rights and gender equality",
        expertiseLevel: "Expert"
      }
    ],
    rates: {
      consultationFee: 400,
      hourlyRate: 1200,
      retainerFee: 8000
    },
    languages: ["Amharic", "English"],
    barAssociation: "Ethiopian Bar Association",
    licenseNumber: "EBA-2008-2345",
    contactInfo: {
      email: "tigist.haile@dulas.edu.et",
      phone: "+251 922 345 678",
      office: "Main Campus, Legal Aid Clinic, Room 206"
    },
    socialMedia: {
      linkedin: "https://linkedin.com/in/tigisthaile",
      twitter: "https://twitter.com/tigisthaile",
      website: "https://dulas.edu.et/lawyers/tigisthaile"
    },
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      hours: "9:00 AM - 4:00 PM"
    },
    ratings: {
      overall: 4.8,
      totalCases: 120,
      successRate: 89,
      clientReviews: 95
    }
  },
  {
    id: 3,
    name: "Mr. Dawit Tekle",
    role: "Corporate Law Expert",
    image: "/images/lawyers/lawyer3.jpg",
    education: [
      {
        degree: "LLM in Corporate Law",
        university: "Oxford University",
        year: "2015"
      },
      {
        degree: "LLB",
        university: "Addis Ababa University",
        year: "2011"
      }
    ],
    experience: [
      {
        position: "Corporate Law Expert",
        organization: "Dilla University Legal Aid Service",
        duration: "2017-Present",
        description: "Specializing in business law and corporate governance"
      },
      {
        position: "Legal Advisor",
        organization: "Ethiopian Chamber of Commerce",
        duration: "2015-2017",
        description: "Advised businesses on legal compliance and corporate matters"
      }
    ],
    specializations: [
      {
        area: "Corporate Law",
        description: "Expert in business formation and corporate governance",
        expertiseLevel: "Expert"
      },
      {
        area: "Commercial Law",
        description: "Specializing in commercial contracts and transactions",
        expertiseLevel: "Advanced"
      }
    ],
    rates: {
      consultationFee: 600,
      hourlyRate: 1800,
      retainerFee: 12000
    },
    languages: ["Amharic", "English", "French"],
    barAssociation: "Ethiopian Bar Association",
    licenseNumber: "EBA-2011-3456",
    contactInfo: {
      email: "dawit.tekle@dulas.edu.et",
      phone: "+251 933 456 789",
      office: "Main Campus, Legal Aid Clinic, Room 207"
    },
    socialMedia: {
      linkedin: "https://linkedin.com/in/dawittekle",
      twitter: "https://twitter.com/dawittekle",
      website: "https://dulas.edu.et/lawyers/dawittekle"
    },
    availability: {
      days: ["Tuesday", "Thursday", "Friday"],
      hours: "10:00 AM - 6:00 PM"
    },
    ratings: {
      overall: 4.7,
      totalCases: 85,
      successRate: 91,
      clientReviews: 78
    }
  },
  {
    id: 4,
    name: "Ms. Bethlehem Alemu",
    role: "Human Rights Advocate",
    image: "/images/lawyers/lawyer4.jpg",
    education: [
      {
        degree: "LLM in Human Rights Law",
        university: "Geneva University",
        year: "2014"
      },
      {
        degree: "LLB",
        university: "Mekelle University",
        year: "2010"
      }
    ],
    experience: [
      {
        position: "Human Rights Advocate",
        organization: "Dilla University Legal Aid Service",
        duration: "2018-Present",
        description: "Leading human rights cases and advocacy programs"
      },
      {
        position: "Legal Officer",
        organization: "Ethiopian Human Rights Commission",
        duration: "2014-2018",
        description: "Investigated human rights violations and provided legal assistance"
      }
    ],
    specializations: [
      {
        area: "Human Rights Law",
        description: "Specializing in civil rights and human rights advocacy",
        expertiseLevel: "Expert"
      },
      {
        area: "Public Interest Law",
        description: "Focus on public interest litigation and advocacy",
        expertiseLevel: "Advanced"
      }
    ],
    rates: {
      consultationFee: 300,
      hourlyRate: 1000
    },
    languages: ["Amharic", "English", "Tigrinya"],
    barAssociation: "Ethiopian Bar Association",
    licenseNumber: "EBA-2010-4567",
    contactInfo: {
      email: "bethlehem.alemu@dulas.edu.et",
      phone: "+251 944 567 890",
      office: "Main Campus, Legal Aid Clinic, Room 208"
    },
    socialMedia: {
      linkedin: "https://linkedin.com/in/bethlehema",
      twitter: "https://twitter.com/bethlehema",
      website: "https://dulas.edu.et/lawyers/bethlehemalemu"
    },
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Friday"],
      hours: "8:30 AM - 4:30 PM"
    },
    ratings: {
      overall: 4.9,
      totalCases: 110,
      successRate: 94,
      clientReviews: 89
    }
  }
];

// Add a function to fetch lawyer specializations
export function getLawyerSpecializations() {
  const specializations = new Set<string>();
  lawyers.forEach(lawyer => {
    lawyer.specializations.forEach(spec => {
      specializations.add(spec.area);
    });
  });
  return Array.from(specializations);
}

// Add a function to get experience levels
export function getLawyerExperienceLevels() {
  return [
    { label: "Junior (1-5 years)", value: "junior" },
    { label: "Mid-Level (5-10 years)", value: "mid" },
    { label: "Senior (10+ years)", value: "senior" },
    { label: "Expert (15+ years)", value: "expert" }
  ];
}

// Add a function to get rate ranges
export function getLawyerRateRanges() {
  return [
    { label: "500-1000 ETB/hr", value: "low" },
    { label: "1000-2000 ETB/hr", value: "medium" },
    { label: "2000-3000 ETB/hr", value: "high" },
    { label: "3000+ ETB/hr", value: "premium" }
  ];
} 