// Translation map for English to Amharic
const englishToAmharic: { [key: string]: string } = {
    // Auth messages
    "Unauthorized": "ያልተፈቀደ",
    "Profile not found": "መገለጫ አልተገኘም",
    "Failed to fetch profile": "መገለጫን ማግኘት አልተሳካም",
    "Failed to update profile": "መገለጫን ማዘመን አልተሳካም",
    
    // Profile fields
    "Full Name": "ሙሉ ስም",
    "Phone": "ስልክ",
    "Email": "ኢሜይል",
    "Age": "እድሜ",
    "Gender": "ጾታ",
    "Health Status": "የጤና ሁኔታ",
    "Number of Family": "የቤተሰብ ብዛት",
    
    // Location fields
    "Region": "ክልል",
    "Zone": "ዞን",
    "Wereda": "ወረዳ",
    "Kebele": "ቀበሌ",
    "House Number": "የቤት ቁጥር",
    
    // Case fields
    "Case Type": "የጉዳይ አይነት",
    "Case Category": "የጉዳይ ምድብ",
    "Case Description": "የጉዳይ መግለጫ",
    "Priority": "ቅድሚያ",
    
    // Status messages
    "Active": "ንቁ",
    "Inactive": "ያልተንቀሳቀሰ",
    "Pending": "በመጠባበቅ ላይ",
    "Completed": "የተጠናቀቀ",
    "Cancelled": "የተሰረዘ",
    
    // Common actions
    "Save": "አስቀምጥ",
    "Update": "አዘምን",
    "Delete": "ሰርዝ",
    "Cancel": "ሰርዝ",
    "Submit": "አስገባ",
    "Edit Profile": "መገለጫ አስተካክል",
    "Save Changes": "ለውጦችን አስቀምጥ",
    "Saving...": "በማስቀመጥ ላይ...",
    
    // Common messages
    "Success": "ተሳክቷል",
    "Error": "ስህተት",
    "Loading": "በመጫን ላይ",
    "Please wait": "እባክዎ ይጠብቁ",
    "No data found": "ምንም መረጃ አልተገኘም",
    "Profile updated successfully": "መገለጫው በተሳካ ሁኔታ ተዘምኗል",
    
    // Form placeholders
    "Enter phone number": "ስልክ ቁጥር ያስገቡ",
    "Select health status": "የጤና ሁኔታ ይምረጡ",
    "Enter house number": "የቤት ቁጥር ያስገቡ",
    "Enter additional notes": "ተጨማሪ ማስታወሻዎችን ያስገቡ",
    
    // Health status options
    "HEALTHY": "ጤናማ",
    "DISABLED": "አካል ጉዳተኛ",
    "CHRONIC_ILLNESS": "ቋሚ ህመም",
    "OTHER": "ሌላ",
    
    // Gender options
    "MALE": "ወንድ",
    "FEMALE": "ሴት",
    
    // Time-related
    "Today": "ዛሬ",
    "Yesterday": "ትላንት",
    "Tomorrow": "ነገ",
    "This week": "በዚህ ሳምንት",
    "This month": "በዚህ ወር",
    "This year": "በዚህ ዓመት",
    
    // Navigation
    "Home": "መነሻ",
    "Profile": "መገለጫ",
    "Settings": "ቅንብሮች",
    "Logout": "ውጣ",
    "Back": "ተመለስ",
    "Next": "ቀጣይ",
    "Previous": "ቀዳሚ",
    
    // Section titles
    "Personal Information": "የግል መረጃ",
    "Location Information": "የአድራሻ መረጃ",
    "Case Information": "የጉዳይ መረጃ",
    "Additional Information": "ተጨማሪ መረጃ",
  
    // Office Information
    "Office Information": "የቢሮ መረጃ",
    "Office Details": "የቢሮ ዝርዝሮች",
    "Name": "ስም",
    "Location": "አድራሻ",
    "Contact": "አድራሻ",
    "Assigned Staff": "የተመደቡ ሰራተኞች",
    "Coordinators": "አስተባባሪዎች",
    "Lawyers": "ጠበቆች",
    "Specializations": "ስፔሻላይዜሽኖች",
  
    // Cases Information
    "Cases Information": "የጉዳዮች መረጃ",
    "No cases found": "ምንም ጉዳዮች አልተገኙም",
    "Created": "የተፈጠረበት",
    "Updated": "የተupdated",
    "Category": "ምድብ",
    "HIGH": "ከፍተኛ",
    "MEDIUM": "መካከለኛ",
    "LOW": "ዝቅተኛ",
    "ACTIVE": "ንቁ",
    "PENDING": "በመጠባበቅ ላይ",
    "CLOSED": "የተዘጋ",
  };
  
  // Translation map for Amharic to English (reverse of englishToAmharic)
  const amharicToEnglish: { [key: string]: string } = Object.entries(englishToAmharic).reduce(
    (acc, [eng, amh]) => ({
      ...acc,
      [amh]: eng
    }),
    {}
  );
  
  /**
   * Translates English text to Amharic
   * @param text The English text to translate
   * @returns The Amharic translation or the original text if no translation exists
   */
  export function translateToAmharic(text: string): string {
    return englishToAmharic[text] || text;
  }
  
  /**
   * Translates Amharic text to English
   * @param text The Amharic text to translate
   * @returns The English translation or the original text if no translation exists
   */
  export function translateToEnglish(text: string): string {
    return amharicToEnglish[text] || text;
  }
  
  /**
   * Checks if text is in Amharic script
   * @param text The text to check
   * @returns boolean indicating if the text contains Amharic characters
   */
  export function isAmharic(text: string): boolean {
    // Amharic Unicode range: \u1200-\u137F
    return /[\u1200-\u137F]/.test(text);
  }
  
  /**
   * Translates text based on the target language
   * @param text The text to translate
   * @param toAmharic Whether to translate to Amharic (true) or English (false)
   * @returns The translated text
   */
  export function translate(text: string, toAmharic: boolean): string {
    if (toAmharic) {
      return translateToAmharic(text);
    } else {
      return translateToEnglish(text);
    }
  } 