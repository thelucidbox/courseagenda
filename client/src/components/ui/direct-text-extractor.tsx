import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DirectTextExtractorProps {
  onTextExtracted: (text: string) => void;
  onCancel: () => void;
}

/**
 * A fallback component for direct text extraction when PDF processing fails
 */
const DirectTextExtractor = ({ onTextExtracted, onCancel }: DirectTextExtractorProps) => {
  const [text, setText] = useState<string>('');
  const [courseName, setCourseName] = useState<string>('');
  const [courseCode, setCourseCode] = useState<string>('');
  const [instructor, setInstructor] = useState<string>('');
  const [term, setTerm] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Create a formatted text with course information and syllabus content
    // This format is designed to be easily parsed by the Gemini API
    const formattedText = `
COURSE INFORMATION
----------------
Course Name: ${courseName || 'Not specified'}
Course Code: ${courseCode || 'Not specified'}
Instructor: ${instructor || 'Not specified'}
Term: ${term || 'Not specified'}

SYLLABUS CONTENT
----------------
${text}
    `.trim();
    
    console.log('Submitting manual text input with length:', formattedText.length);
    
    // Add a small delay to simulate processing
    setTimeout(() => {
      // Pass the extracted text back to the parent component
      onTextExtracted(formattedText);
      setIsSubmitting(false);
      
      console.log('Manual text extraction completed successfully');
    }, 500);
  };
  
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Manual Syllabus Information</h2>
        <p className="text-gray-600 mb-4">
          Enter your syllabus information manually to continue with the process:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="courseName">Course Name</Label>
            <Input 
              id="courseName"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="e.g. Introduction to Computer Science"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="courseCode">Course Code</Label>
            <Input 
              id="courseCode"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="e.g. CS 101"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructor">Instructor</Label>
            <Input 
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              placeholder="e.g. Dr. Jane Smith"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="term">Term</Label>
            <Input 
              id="term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="e.g. Fall 2025"
            />
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <Label htmlFor="syllabusText">Syllabus Text</Label>
          <Textarea 
            id="syllabusText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your syllabus text here, including important dates, assignments, and course schedule..."
            className="min-h-[200px]"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !text.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Process Text'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectTextExtractor;