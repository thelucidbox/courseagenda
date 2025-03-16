import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/ui/file-upload';
import ProgressSteps from '@/components/ui/progress-steps';
import PDFViewer from '@/components/ui/pdf-viewer';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { type Syllabus } from '@shared/schema';

const steps = [
  { label: 'Upload Syllabus', status: 'current' as const },
  { label: 'Calendar Permissions', status: 'upcoming' as const },
  { label: 'Extract Information', status: 'upcoming' as const },
  { label: 'Create Study Plan', status: 'upcoming' as const }
];

const UploadSyllabus = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
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
        description: 'Your syllabus has been uploaded and is being processed by Gemini Vision AI.',
      });
      
      // Navigate to the calendar permissions page first
      navigate(`/calendar-permissions/${data.id}`);
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
            
            <Alert className="mb-4">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertTitle>Powered by Gemini Vision AI</AlertTitle>
              <AlertDescription>
                Your PDF will be analyzed by Google's multimodal AI, providing highly accurate 
                extraction of course information, dates, assignments, and exams.
              </AlertDescription>
            </Alert>
            
            {!selectedFile ? (
              <FileUpload onFileSelect={handleFileSelect} />
            ) : (
              <div className="relative">
                <PDFViewer file={selectedFile} onTextExtracted={() => {}} />
                <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-md shadow-md">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 312 100" className="h-5 mr-2">
                      <path d="M60.4 50c0-8.4-4.6-15.9-11.5-19.9L30.2 77.8c7 3.9 15.5 3.8 22.3-.3 4.8-2.9 7.9-8.3 7.9-14.3V50z" fill="#FF4A4A"/>
                      <path d="M18.7 50v13.2c0 6 3.1 11.4 7.9 14.3l18.7-47.6C38.1 26 30.3 26 23.4 29.8c-3 1.9-4.7 5.3-4.7 8.7V50z" fill="#FFAD47"/>
                      <path d="M18.7 38.5c0-3.4 1.8-6.8 4.7-8.7l18.7 47.6c7.1-4.2 11.6-11.7 11.6-20.1v-7.5L30.2 22.1c-7-3.9-15.5-3.8-22.3.3-4.8 2.9-7.9 8.3-7.9 14.3V50h18.7V38.5z" fill="#0066D9"/>
                      <path d="M11.5 50H0v11.5c0 6 3.1 11.4 7.9 14.3 4.7 2.8 10.3 3.1 15.1.9l-11.5-26.7z" fill="#00ACF5"/>
                    </svg>
                    <span className="text-xs font-medium">Gemini Vision Processing</span>
                  </div>
                </div>
              </div>
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
                  <h4 className="font-medium text-sm">AI analyzes your syllabus</h4>
                  <p className="text-sm text-gray-500">Google's Gemini Vision AI directly processes your PDF to extract key information with high accuracy.</p>
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
                  <span>Ensure your PDF includes clearly stated dates and deadlines</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="text-primary mt-0.5 h-4 w-4" />
                  <span>Our AI can process complex formats including tables and schedules</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="text-primary mt-0.5 h-4 w-4" />
                  <span>Both digital and scanned syllabi are supported</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckIcon className="text-primary mt-0.5 h-4 w-4" />
                  <span>You can always edit extracted information later</span>
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
