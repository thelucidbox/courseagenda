import * as pdfjs from 'pdfjs-dist';

// PDF processing utilities
export type PDFTextContent = {
  text: string;
  pageCount: number;
};

// Import the central PDF worker configuration
import './pdf-worker-config';

// No need to configure worker here as it's handled in pdf-worker-config.ts
const initializePdfJS = async () => {
  // Initialization is already handled globally
  // This function is kept for backward compatibility
};

// Extract text from PDF file
export const extractTextFromPDF = async (file: File): Promise<PDFTextContent> => {
  await initializePdfJS();

  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      const pageCount = pdf.numPages;
      
      // Extract text from each page
      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str);
        fullText += textItems.join(' ') + '\n';
      }
      
      resolve({ text: fullText, pageCount });
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      reject(error);
    }
  });
};

// Extract potential course information from text
export const extractCourseInfo = (text: string) => {
  // Simple regex extraction patterns
  const courseCodePattern = /(?:Course|Class) (?:Code|Number|ID)?\s*:?\s*([A-Z]{2,4}\s*\d{3,4}[A-Z0-9]*)/i;
  const courseNamePattern = /(?:Course|Class) (?:Title|Name)\s*:?\s*([^\n]+)/i;
  const instructorPattern = /(?:Professor|Instructor|Lecturer|Teacher|Faculty)\s*:?\s*([^\n]+)/i;
  const termPattern = /(?:Term|Semester|Quarter)\s*:?\s*([^\n]+)/i;
  
  const courseCodeMatch = text.match(courseCodePattern);
  const courseNameMatch = text.match(courseNamePattern);
  const instructorMatch = text.match(instructorPattern);
  const termMatch = text.match(termPattern);
  
  return {
    courseCode: courseCodeMatch?.[1]?.trim() || '',
    courseName: courseNameMatch?.[1]?.trim() || '',
    instructor: instructorMatch?.[1]?.trim() || '',
    term: termMatch?.[1]?.trim() || '',
  };
};

// Extract dates and events from PDF text
export const extractDatesAndEvents = (text: string) => {
  const events = [];
  
  // Assignment patterns
  const assignmentPattern = /(?:assignment|homework|project)[^.]*?due\s*(?:on|by)?\s*(?:(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,)?\s+\d{4}))/gi;
  
  // Exam patterns
  const examPattern = /(?:exam|midterm|final|test)[^.]*?(?:on|date|scheduled for)\s*(?:(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,)?\s+\d{4}))/gi;
  
  // Quiz patterns
  const quizPattern = /(?:quiz|quizzes)[^.]*?(?:on|date|scheduled for)\s*(?:(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|([a-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,)?\s+\d{4}))/gi;
  
  // Extract assignments
  let assignmentMatch;
  while ((assignmentMatch = assignmentPattern.exec(text)) !== null) {
    const title = text.substring(assignmentMatch.index, assignmentMatch.index + 50).split(/[.,:;\n]/)[0].trim();
    const dateStr = assignmentMatch[1] || assignmentMatch[2];
    
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        events.push({
          title,
          type: 'assignment',
          date,
        });
      }
    } catch (e) {
      // Skip invalid dates
    }
  }
  
  // Extract exams
  let examMatch;
  while ((examMatch = examPattern.exec(text)) !== null) {
    const title = text.substring(examMatch.index, examMatch.index + 50).split(/[.,:;\n]/)[0].trim();
    const dateStr = examMatch[1] || examMatch[2];
    
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        events.push({
          title,
          type: 'exam',
          date,
        });
      }
    } catch (e) {
      // Skip invalid dates
    }
  }
  
  // Extract quizzes
  let quizMatch;
  while ((quizMatch = quizPattern.exec(text)) !== null) {
    const title = text.substring(quizMatch.index, quizMatch.index + 50).split(/[.,:;\n]/)[0].trim();
    const dateStr = quizMatch[1] || quizMatch[2];
    
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        events.push({
          title,
          type: 'quiz',
          date,
        });
      }
    } catch (e) {
      // Skip invalid dates
    }
  }
  
  return events;
};
