import axios from 'axios';

const WEBSITE_URL = 'https://www.education.gouv.ci';

interface WebsiteContent {
  title: string;
  content: string;
  url: string;
}

// This is a mock service that simulates responses from the Ivory Coast Education Ministry website
// In a real implementation, you would need to set up a proxy server to handle CORS issues
// and actually fetch and parse the content from the website

class EducationApiService {
  // Base knowledge about the website structure and common information
  private websiteContent: WebsiteContent[] = [
    {
      title: "Homepage",
      content: "The Ministry of National Education of Côte d'Ivoire is responsible for implementing and monitoring the government's policy on education.",
      url: "/"
    },
    {
      title: "Education System",
      content: "The education system in Côte d'Ivoire is structured into primary education (6 years), secondary education (7 years), and higher education.",
      url: "/education-system"
    },
    {
      title: "School Calendar",
      content: "The school year typically runs from September to July, with breaks in December and April.",
      url: "/calendar"
    },
    {
      title: "Examinations",
      content: "National examinations include CEPE (end of primary), BEPC (end of lower secondary), and BAC (end of upper secondary).",
      url: "/examinations"
    },
    {
      title: "Registration",
      content: "School registration typically begins in June-July for the following academic year. Online registration is available for some institutions.",
      url: "/registration"
    },
    {
      title: "Scholarships",
      content: "Various scholarship programs are available for qualified students, particularly for higher education.",
      url: "/scholarships"
    },
    {
      title: "Educational Reforms",
      content: "The ministry regularly implements reforms to improve the quality and accessibility of education in Côte d'Ivoire.",
      url: "/reforms"
    },
    {
      title: "Contact Information",
      content: "The Ministry of Education is located in Abidjan. Phone: +225 27 22 24 24 24. Email: info@education.gouv.ci",
      url: "/contact"
    },
  ];

  // Method to search for information based on a query
  async searchInformation(query: string): Promise<string> {
    // In a real implementation, this would make an API call to the website or a backend service
    // For now, we'll simulate a response based on the query
    
    const normalizedQuery = query.toLowerCase();
    
    // Search for relevant content
    const relevantContent = this.websiteContent.filter(item => 
      item.title.toLowerCase().includes(normalizedQuery) || 
      item.content.toLowerCase().includes(normalizedQuery)
    );
    
    if (relevantContent.length > 0) {
      // Return the most relevant information
      const result = relevantContent.map(item => 
        `${item.title}: ${item.content}`
      ).join('\n\n');
      
      return result;
    } else {
      // If no specific information is found, provide a general response
      return "I don't have specific information about that. You can visit the Ministry of Education website at https://www.education.gouv.ci for more details or contact them directly at info@education.gouv.ci or +225 27 22 24 24 24.";
    }
  }

  // Method to fetch the latest news from the education ministry
  async getLatestNews(): Promise<string> {
    // In a real implementation, this would scrape the news section of the website
    // For now, we'll return some sample news items
    
    return `
      Latest News from the Ministry of Education:
      
      1. New digital learning platforms being deployed across schools
      2. Registration dates for the upcoming school year announced
      3. Results of the national BAC examination published
      4. Minister announces new scholarship program for STEM students
      5. Teacher recruitment campaign launched for rural areas
    `;
  }

  // Method to fetch information about a specific educational program
  async getProgramInfo(programName: string): Promise<string> {
    // Simulate fetching program information
    const programMap: {[key: string]: string} = {
      "primary": "Primary education in Côte d'Ivoire lasts for 6 years (CP1 to CM2) and leads to the CEPE examination.",
      "secondary": "Secondary education is divided into lower secondary (4 years) and upper secondary (3 years), culminating in the BAC examination.",
      "higher": "Higher education is provided by universities and specialized institutions, offering diplomas, bachelor's, master's, and doctoral degrees.",
      "vocational": "Vocational training is available through specialized centers focused on practical skills development for various industries.",
      "default": "The education system in Côte d'Ivoire follows a 6-4-3 structure (6 years primary, 4 years lower secondary, 3 years upper secondary), followed by higher education."
    };
    
    const normalizedProgram = programName.toLowerCase();
    
    return programMap[normalizedProgram] || programMap["default"];
  }
}

// Export a singleton instance
export const educationApiService = new EducationApiService();