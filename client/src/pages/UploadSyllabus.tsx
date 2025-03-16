import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/ui/file-upload';
import ProgressSteps from '@/components/ui/progress-steps';
import PDFViewer from '@/components/ui/pdf-viewer';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import { type Syllabus } from '@shared/schema';

const steps = [
  { label: 'Upload Syllabus', status: 'current' as const },
  { label: 'Extract Information', status: 'upcoming' as const },
  { label: 'Create Study Plan', status: 'upcoming' as const }
];

const UploadSyllabus = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/syllabi/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload syllabus');
      }
      
      return response.json() as Promise<Syllabus>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/syllabi'] });
      toast({
        title: 'Upload Successful',
        description: 'Your syllabus has been uploaded successfully.',
      });
      
      // Navigate to the extraction page
      navigate(`/extract/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload syllabus',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setExtractedText('');
  };

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
  };

  const handleContinue = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    } else {
      toast({
        title: 'No File Selected',
        description: 'Please select a PDF file to upload.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <ProgressSteps steps={steps} currentStep={1} />
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-2/3 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Upload Your Syllabus</h3>
            
            {!selectedFile ? (
              <FileUpload onFileSelect={handleFileSelect} />
            ) : (
              <PDFViewer file={selectedFile} onTextExtracted={handleTextExtracted} />
            )}
            
            {selectedFile && (
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={() => setSelectedFile(null)} 
                  variant="outline" 
                  className="mr-2"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleContinue}
                  disabled={uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Uploads</h3>
            
            <div className="space-y-2" id="recent-uploads">
              {/* Will be populated by React Query */}
            </div>
          </div>
        </div>
        
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">How It Works</h3>
            
            <div className="space-y-4">
              <div className="flex space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-sm">Upload your syllabus</h4>
                  <p className="text-sm text-gray-500">Upload your course syllabus in PDF format.</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-sm">Review extracted information</h4>
                  <p className="text-sm text-gray-500">We'll extract key dates, assignments, and exams from your syllabus. Review and make any necessary adjustments.</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-sm">Generate your study plan</h4>
                  <p className="text-sm text-gray-500">We'll create a personalized study plan with recommended study sessions based on your course schedule.</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-sm">Sync with your calendar</h4>
                  <p className="text-sm text-gray-500">Add your study plan directly to Google Calendar, Apple Calendar, or other supported calendar services.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary-50 rounded-md border border-primary-100">
              <h4 className="font-medium text-sm mb-2 text-primary-800">Tips for Best Results</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex items-start space-x-2">
                  <CheckIcon className="text-primary mt-0.5 h-4 w-4" />
                  <span>Make sure your PDF is text-searchable (not a scanned image)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="text-primary mt-0.5 h-4 w-4" />
                  <span>Ensure the syllabus includes clear assignment dates and deadlines</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="text-primary mt-0.5 h-4 w-4" />
                  <span>Check that course information (name, code, instructor) is clearly stated</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper icon component
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export default UploadSyllabus;
