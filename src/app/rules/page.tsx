"use client";

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  HiOutlineScale,
  HiOutlineShieldCheck,
  HiOutlineDocumentText,
  HiOutlineExclamationCircle,
  HiOutlineClipboardCheck,
  HiOutlineUserGroup,
  HiOutlineAcademicCap,
  HiOutlineOfficeBuilding,
  HiOutlineTranslate
} from 'react-icons/hi';

const RulesAndRegulations = () => {
  const [language, setLanguage] = useState<'en' | 'am'>('en');

  // Bilingual content
  const translations = {
    en: {
      title: "Rules and Regulations",
      subtitle: "Comprehensive Guidelines for Dilla University Legal Aid Services",
      contactInfo: "For detailed information or clarification about these rules and regulations, please contact the Legal Aid Office or visit during operating hours.",
      contactButton: "Contact Us"
    },
    am: {
      title: "ደንብና መመሪያ",
      subtitle: "የዲላ ዩኒቨርሲቲ የሕግ እገዛ አገልግሎቶች መመሪያ",
      contactInfo: "ስለ እነዚህ ደንቦችና መመሪያዎች ዝርዝር መረጃ ወይም ማብራሪያ ለማግኘት፣ ባክዎ የሕግ እገዛ ቢሮን ያግኙ ወይም በስራ ሰዓታት ይጎብኙ።",
      contactButton: "አግኙን"
    }
  };

  const chapters = {
    en: [
      {
        chapter: "Chapter 1",
        title: "General Provisions",
        icon: <HiOutlineAcademicCap className="w-6 h-6" />,
        sections: [
          {
            id: "1.1",
            title: "About Dilla University Legal Aid Center",
            content: [
              "Established under the Law School of Dilla University",
              "Operates as a non-profit legal service provider",
              "Serves both the university community and local residents",
              "Located within the main campus of Dilla University"
            ]
          },
          {
            id: "1.2",
            title: "Mission and Objectives",
            content: [
              "Provide free legal services to underprivileged communities",
              "Facilitate practical legal education for law students",
              "Promote access to justice and legal awareness",
              "Bridge the gap between legal education and practice"
            ]
          },
          {
            id: "1.3",
            title: "Scope of Services",
            content: [
              "Legal consultation and advice",
              "Document drafting and review",
              "Alternative dispute resolution",
              "Legal awareness and education programs"
            ]
          }
        ]
      },
      {
        chapter: "Chapter 2",
        title: "Eligibility and Access",
        icon: <HiOutlineClipboardCheck className="w-6 h-6" />,
        sections: [
          {
            id: "2.1",
            title: "Eligible Beneficiaries",
            content: [
              "Dilla University students and staff",
              "Local community members below poverty line",
              "Vulnerable groups including women and children",
              "Persons with disabilities"
            ]
          },
          {
            id: "2.2",
            title: "Income Thresholds",
            content: [
              "Annual income not exceeding specified limit",
              "Special considerations for large families",
              "Exceptions for compelling cases",
              "Regular review of financial criteria"
            ]
          },
          {
            id: "2.3",
            title: "Application Process",
            content: [
              "Submission of required documentation",
              "Initial screening interview",
              "Case assessment and acceptance",
              "Assignment to legal advisor"
            ]
          }
        ]
      },
      {
        chapter: "Chapter 3",
        title: "Service Delivery",
        icon: <HiOutlineScale className="w-6 h-6" />,
        sections: [
          {
            id: "3.1",
            title: "Types of Legal Services",
            content: [
              "Civil law matters",
              "Family law cases",
              "Labor disputes",
              "Administrative law issues"
            ]
          },
          {
            id: "3.2",
            title: "Service Standards",
            content: [
              "Professional and ethical conduct",
              "Timely response to clients",
              "Regular case updates",
              "Quality assurance measures"
            ]
          },
          {
            id: "3.3",
            title: "Operating Hours",
            content: [
              "Monday to Friday: 9:00 AM - 5:00 PM",
              "Emergency contact availability",
              "Appointment scheduling system",
              "Holiday closure notices"
            ]
          }
        ]
      },
      {
        chapter: "Chapter 4",
        title: "Client Responsibilities",
        icon: <HiOutlineUserGroup className="w-6 h-6" />,
        sections: [
          {
            id: "4.1",
            title: "Client Obligations",
            content: [
              "Truthful disclosure of information",
              "Regular communication with legal advisors",
              "Attendance at scheduled meetings",
              "Compliance with advice given"
            ]
          },
          {
            id: "4.2",
            title: "Documentation Requirements",
            content: [
              "Personal identification documents",
              "Income verification certificates",
              "Case-related documents",
              "Signed declarations and agreements"
            ]
          },
          {
            id: "4.3",
            title: "Code of Conduct",
            content: [
              "Respectful behavior towards staff",
              "Adherence to center policies",
              "Proper use of facilities",
              "Reporting of changes in circumstances"
            ]
          }
        ]
      },
      {
        chapter: "Chapter 5",
        title: "Confidentiality and Ethics",
        icon: <HiOutlineShieldCheck className="w-6 h-6" />,
        sections: [
          {
            id: "5.1",
            title: "Confidentiality Policy",
            content: [
              "Protection of client information",
              "Secure data storage protocols",
              "Information sharing restrictions",
              "Privacy breach procedures"
            ]
          },
          {
            id: "5.2",
            title: "Ethical Standards",
            content: [
              "Professional conduct requirements",
              "Conflict of interest policies",
              "Quality service commitment",
              "Accountability measures"
            ]
          },
          {
            id: "5.3",
            title: "Record Keeping",
            content: [
              "Case file maintenance",
              "Documentation procedures",
              "Archive policies",
              "Access control measures"
            ]
          }
        ]
      },
      {
        chapter: "Chapter 6",
        title: "Service Fees",
        icon: <HiOutlineDocumentText className="w-6 h-6" />,
        sections: [
          {
            id: "6.1",
            title: "Free Services",
            content: [
              "Legal consultation services",
              "Basic document preparation",
              "Initial case assessment",
              "Legal education programs"
            ]
          },
          {
            id: "6.2",
            title: "Additional Costs",
            content: [
              "Court filing fees",
              "Document certification costs",
              "Transportation expenses",
              "Copying and printing charges"
            ]
          },
          {
            id: "6.3",
            title: "Fee Adjustments",
            content: [
              "Special discounts for vulnerable groups",
              "Payment plan options",
              "Cost-sharing arrangements",
              "Fee explanation procedures"
            ]
          }
        ]
      },
      {
        chapter: "Chapter 7",
        title: "Grievance Handling",
        icon: <HiOutlineExclamationCircle className="w-6 h-6" />,
        sections: [
          {
            id: "7.1",
            title: "Complaint Submission",
            content: [
              "Complaint submission forms",
              "Complaint filing process",
              "Response time limits",
              "Complaint tracking system"
            ]
          },
          {
            id: "7.2",
            title: "Complaint Investigation",
            content: [
              "Investigation procedures",
              "Evidence collection",
              "Decision making",
              "Appeal rights"
            ]
          },
          {
            id: "7.3",
            title: "Corrective Measures",
            content: [
              "Service improvements",
              "Compensation procedures",
              "System adjustments",
              "Follow-up actions"
            ]
          }
        ]
      }
    ],
    am: [
      {
        chapter: "ምዕራፍ 1",
        title: "አጠቃላይ ድንጋጌዎች",
        icon: <HiOutlineAcademicCap className="w-6 h-6" />,
        sections: [
          {
            id: "1.1",
            title: "ስለ ዲላ ዩኒቨርሲቲ የሕግ እገዛ ማእከል",
            content: [
              "በዲላ ዩኒቨርሲቲ የሕግ ት/ቤት ስር የተቋቋመ",
              "ትርፋማ ያልሆነ የሕግ አገልግሎት ሰጪ ነው",
              "የዩኒቨርሲቲውን ማህበረሰብና የአካባቢውን ነዋሪዎች ያገለግላል",
              "በዲላ ዩኒቨርሲቲ ዋና ካምፓስ ውስጥ ይገኛል"
            ]
          },
          {
            id: "1.2",
            title: "ተልእኮና ዓላማዎች",
            content: [
              "ለተጎጂ ማህበረሰቦች ነጻ የሕግ አገልግሎት መስጠት",
              "ለሕግ ተማሪዎች የተግባር ሕግ ትምህርት ማስፋፋት",
              "ለፍትህ ተደራሽነትና የሕግ ግንዛቤ ማስፋፋት",
              "በሕግ ትምህርትና ተግባር መካከል ያለውን ክፍተት መድፈን"
            ]
          },
          {
            id: "1.3",
            title: "የአገልግሎት ወሰን",
            content: [
              "የሕግ ምክርና ድጋፍ",
              "ሰነዶችን ማዘጋጀትና መገምገም",
              "አማራጭ የግጭት አፈታት",
              "የሕግ ግንዛቤና ትምህርት ፕሮግራሞች"
            ]
          }
        ]
      },
      {
        chapter: "ምዕራፍ 2",
        title: "ብቁነትና ተደራሽነት",
        icon: <HiOutlineClipboardCheck className="w-6 h-6" />,
        sections: [
          {
            id: "2.1",
            title: "ብቁ ተጠቃሚዎች",
            content: [
              "የዲላ ዩኒቨርሲቲ ተማሪዎችና ሰራተኞች",
              "ከድህነት ወለል በታች ያሉ የአካባቢ ማህበረሰብ አባላት",
              "ሴቶችና ህጻናትን ጨምሮ ተጋላጭ ቡድኖች",
              "አካል ጉዳተኞች"
            ]
          },
          {
            id: "2.2",
            title: "የገቢ መስፈርቶች",
            content: [
              "የዓመት ገቢ ከተወሰነው መጠን ያልበለጠ",
              "ለትልቅ ቤተሰብ ልዩ ግምት የሚሰጥ",
              "አስገዳጅ ሁኔታዎች ላይ ልዩ ድንጋጌ",
              "የገቢ መስፈርቶች መደበኛ ግምገማ"
            ]
          },
          {
            id: "2.3",
            title: "የማመልከቻ ሂደት",
            content: [
              "አስፈላጊ ሰነዶችን ማቅረብ",
              "የመጀመሪያ ደረጃ ቃለ መጠይቅ",
              "የጉዳይ ግምገማና ተቀባይነት",
              "ለሕግ አማካሪ መመደብ"
            ]
          }
        ]
      },
      {
        chapter: "ምዕራፍ 3",
        title: "የአገልግሎት አሰጣጥ",
        icon: <HiOutlineScale className="w-6 h-6" />,
        sections: [
          {
            id: "3.1",
            title: "የሕግ አገልግሎት ዓይነቶች",
            content: [
              "የፍትሐብሔር ሕግ ጉዳዮች",
              "የቤተሰብ ሕግ ጉዳዮች",
              "የሰራተኛና አሰሪ ክርክሮች",
              "የአስተዳደር ሕግ ጉዳዮች"
            ]
          },
          {
            id: "3.2",
            title: "የአገልግሎት ደረጃዎች",
            content: [
              "ሙያዊና ሥነ-ምግባራዊ አሰራር",
              "ለደንበኞች ፈጣን ምላሽ መስጠት",
              "መደበኛ የጉዳይ ሁኔታ ማሳወቅ",
              "የጥራት ማረጋገጫ እርምጃዎች"
            ]
          },
          {
            id: "3.3",
            title: "የስራ ሰዓታት",
            content: [
              "ከሰኞ እስከ አርብ፡ 9:00 - 5:00",
              "የአስቸኳይ ጊዜ አገልግሎት",
              "የቀጠሮ አያያዝ ሥርዓት",
              "በበዓላት ቀናት የመዘጋት ማስታወቂያ"
            ]
          }
        ]
      },
      {
        chapter: "ምዕራፍ 4",
        title: "የደንበኛ ኃላፊነቶች",
        icon: <HiOutlineUserGroup className="w-6 h-6" />,
        sections: [
          {
            id: "4.1",
            title: "የደንበኛ ግዴታዎች",
            content: [
              "እውነተኛ መረጃ መስጠት",
              "ከሕግ አማካሪዎች ጋር መደበኛ ግንኙነት ማድረግ",
              "በተያዘው ቀጠሮ መገኘት",
              "የተሰጠውን ምክር መከተል"
            ]
          },
          {
            id: "4.2",
            title: "የሰነድ መስፈርቶች",
            content: [
              "የማንነት ማረጋገጫ ሰነዶች",
              "የገቢ ማረጋገጫ ሰነዶች",
              "ከጉዳዩ ጋር የተያያዙ ሰነዶች",
              "የተፈረጠውን ስምምነቶችና መግለጫዎች"
            ]
          },
          {
            id: "4.3",
            title: "የሥነ-ምግባር ደንብ",
            content: [
              "ለሰራተኞች አክብሮት ማሳየት",
              "የማእከሉን ፖሊሲዎች መከተል",
              "አገልግሎቶችን በአግባቡ መጠቀም",
              "በሁኔታ ለውጥ ጊዜ ማሳወቅ"
            ]
          }
        ]
      },
      {
        chapter: "ምዕራፍ 5",
        title: "ሚስጥር አጠባበቅና ሥነ-ምግባር",
        icon: <HiOutlineShieldCheck className="w-6 h-6" />,
        sections: [
          {
            id: "5.1",
            title: "የሚስጥር አጠባበቅ ፖሊሲ",
            content: [
              "የደንበኛ መረጃ ጥበቃ",
              "የመረጃ አያያዝ ፕሮቶኮሎች",
              "መረጃ የማጋራት ገደቦች",
              "የመረጃ ጥሰት አያያዝ"
            ]
          },
          {
            id: "5.2",
            title: "የሥነ-ምግባር ደረጃዎች",
            content: [
              "የሙያ ሥነ-ምግባር መስፈርቶች",
              "የጥቅም ግጭት ፖሊሲዎች",
              "የጥራት አገልግሎት ቁርጠኝነት",
              "የተጠያቂነት እርምጃዎች"
            ]
          },
          {
            id: "5.3",
            title: "የመዝገብ አያያዝ",
            content: [
              "የጉዳይ መዝገብ አጠባበቅ",
              "የሰነድ አያያዝ ሂደቶች",
              "የመዝገብ ማስቀመጫ ፖሊሲዎች",
              "የመዝገብ አጠቃቀም ቁጥጥር"
            ]
          }
        ]
      },
      {
        chapter: "ምዕራፍ 6",
        title: "የአገልግሎት ክፍያዎች",
        icon: <HiOutlineDocumentText className="w-6 h-6" />,
        sections: [
          {
            id: "6.1",
            title: "የነጻ አገልግሎቶች",
            content: [
              "የሕግ ምክር አገልግሎት",
              "መሰረታዊ ሰነድ ዝግጅት",
              "የመጀመሪያ ደረጃ ግምገማ",
              "የሕግ ትምህርት ፕሮግራሞች"
            ]
          },
          {
            id: "6.2",
            title: "ተጨማሪ ወጪዎች",
            content: [
              "የፍርድ ቤት ክፍያዎች",
              "የሰነድ ማረጋገጫ ወጪዎች",
              "የትራንስፖርት ወጪዎች",
              "የኮፒና ማተሚያ ክፍያዎች"
            ]
          },
          {
            id: "6.3",
            title: "የክፍያ ማስተካከያዎች",
            content: [
              "ለተጎጂዎች ልዩ ቅናሽ",
              "የክፍያ ማራዘሚያ እድሎች",
              "የወጪ መጋራት አማራጮች",
              "የክፍያ ማብራሪያ አሰጣጥ"
            ]
          }
        ]
      },
      {
        chapter: "ምዕራፍ 7",
        title: "ቅሬታ አያያዝ",
        icon: <HiOutlineExclamationCircle className="w-6 h-6" />,
        sections: [
          {
            id: "7.1",
            title: "የቅሬታ አቀራረብ",
            content: [
              "የቅሬታ ማቅረቢያ ቅጾች",
              "የቅሬታ አቀራረብ ሂደት",
              "የምላሽ አሰጣጥ ጊዜ ገደብ",
              "የቅሬታ መከታተያ ሥርዓት"
            ]
          },
          {
            id: "7.2",
            title: "የቅሬታ ምርመራ",
            content: [
              "የምርመራ ሂደቶች",
              "የማስረጃ ስብሰባ",
              "የውሳኔ አሰጣጥ",
              "የይግባኝ መብቶች"
            ]
          },
          {
            id: "7.3",
            title: "የእርምት እርምጃዎች",
            content: [
              "የአገልግሎት ማሻሻያዎች",
              "የካሳ አሰጣጥ",
              "የሥርዓት ማስተካከያዎች",
              "የድጋሚ ክትትል እርምጃዎች"
            ]
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Language Switcher */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
          className="flex items-center space-x-2 bg-white dark:bg-gray-800 
            px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <HiOutlineTranslate className="w-5 h-5 text-primary-600" />
          <span className="text-sm font-medium">
            {language === 'en' ? 'አማርኛ' : 'English'}
          </span>
        </button>
      </div>

      {/* Header Section */}
      <div className="bg-primary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-4">
              {translations[language].title}
            </h1>
            <p className="text-primary-100 max-w-2xl mx-auto">
              {translations[language].subtitle}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Chapters Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {chapters[language].map((chapter, chapterIndex) => (
          <motion.div
            key={chapter.chapter}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: chapterIndex * 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 
                rounded-lg flex items-center justify-center text-primary-600 mr-4">
                {chapter.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {chapter.chapter}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {chapter.title}
                </p>
              </div>
            </div>

            <div className="space-y-6 ml-16">
              {chapter.sections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6"
                >
                  <h3 className="text-xl font-semibold mb-4">
                    {section.id} - {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.content.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 bg-primary-50 dark:bg-gray-800/50 rounded-lg p-6 text-center"
        >
          <p className="text-gray-600 dark:text-gray-300">
            {translations[language].contactInfo}
          </p>
          <div className="mt-4">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2 
              bg-primary-600 text-white font-medium rounded-lg 
              hover:bg-primary-700 transition-colors"
            >
              {translations[language].contactButton}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RulesAndRegulations; 