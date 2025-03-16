import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/ui/file-upload';
import ProgressSteps from '@/components/ui/progress-steps';
import PDFViewer from '@/components/ui/pdf-viewer';
import DirectTextExtractor from '@/components/ui/direct-text-extractor';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { type Syllabus } from '@shared/schema';

// Import our PDF worker configuration to ensure it's loaded
import '@/lib/pdf-worker-config';

const steps = [
  { label: 'Upload Syllabus', status: 'current' as const },
  { label: 'Create Study Plan', status: 'upcoming' as const },
  { label: 'Calendar Integration', status: 'upcoming' as const }
];

const UploadSyllabus = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [pdfProcessingStatus, setPdfProcessingStatus] = useState<'idle' | 'processing' | 'failed' | 'success'>('idle');
  const [showDirectTextInput, setShowDirectTextInput] = useState<boolean>(false);
  
  // Handle PDF text extraction
  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
    setPdfProcessingStatus('success');
  };
  
  // Handle PDF processing error
  const handlePdfProcessingError = () => {
    setPdfProcessingStatus('failed');
    toast({
      title: 'PDF Processing Issue',
      description: 'We had trouble processing your PDF automatically. You can try entering course information manually instead.',
      variant: 'destructive',
    });
  };
  
  // Reset state when file is removed
  useEffect(() => {
    if (!selectedFile) {
      setExtractedText(null);
      setPdfProcessingStatus('idle');
      setShowDirectTextInput(false);
    }
  }, [selectedFile]);
  
  // Handle manual text submission
  const handleManualTextSubmit = (text: string) => {
    setExtractedText(text);
    setPdfProcessingStatus('success');
    setShowDirectTextInput(false);
    
    // Proceed with upload using the manually entered text
    uploadWithText(text);
  };
  
  // Upload text directly
  const uploadWithText = async (text: string) => {
    try {
      // Create a text file from the input
      const textBlob = new Blob([text], { type: 'text/plain' });
      const textFile = new File([textBlob], 'syllabus.txt', { type: 'text/plain' });
      
      // Use the same mutation as for PDF files
      uploadMutation.mutate(textFile);
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to process your input',
        variant: 'destructive',
      });
    }
  };
  
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/syllabi'] });
      toast({
        title: 'Upload Successful',
        description: 'Your syllabus has been uploaded and is being processed.',
      });
      
      try {
        // Directly extract the syllabus info
        const extractResponse = await fetch(`/api/syllabi/${data.id}/extract`, {
          method: 'POST',
          credentials: 'include',
        });
        
        if (extractResponse.ok) {
          // After extraction, navigate directly to the create plan page
          navigate(`/create-plan/${data.id}`);
        } else {
          // If extraction fails, still navigate to extract page manually
          navigate(`/extract/${data.id}`);
        }
      } catch (error) {
        // If there's an error, still navigate to extract page
        navigate(`/extract/${data.id}`);
      }
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
      if (extractedText) {
        // If we already have extracted text, use it
        uploadWithText(extractedText);
      } else {
        // Otherwise upload the PDF file directly
        uploadMutation.mutate(selectedFile);
      }
    } else {
      toast({
        title: 'No File Selected',
        description: 'Please select a PDF file to upload.',
        variant: 'destructive',
      });
    }
  };
  
  // Switch to manual text input mode
  const handleSwitchToManualInput = () => {
    setShowDirectTextInput(true);
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
              <AlertTitle>Upload your PDF and I'll take care of the rest</AlertTitle>
              <AlertDescription>
                Your syllabus will be analyzed to extract key course information, 
                important dates, assignments, and exams automatically.
              </AlertDescription>
            </Alert>
            
            {showDirectTextInput ? (
              // Manual text input component
              <DirectTextExtractor 
                onTextExtracted={handleManualTextSubmit}
                onCancel={() => {
                  setShowDirectTextInput(false);
                  setPdfProcessingStatus('idle');
                }}
              />
            ) : !selectedFile ? (
              // Initial file upload component
              <FileUpload onFileSelect={handleFileSelect} />
            ) : (
              // PDF Viewer with processing UI
              <div className="relative">
                <PDFViewer 
                  file={selectedFile} 
                  onTextExtracted={handleTextExtracted} 
                />
                
                {pdfProcessingStatus === 'processing' && (
                  <div className="absolute top-4 right-4 bg-white/90 p-3 rounded-md shadow-md">
                    <div className="flex items-center">
                      <div className="h-4 w-4 mr-2 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                      <span className="text-xs font-medium">Processing PDF...</span>
                    </div>
                  </div>
                )}
                
                {pdfProcessingStatus === 'failed' && (
                  <div className="mt-4">
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>PDF Processing Failed</AlertTitle>
                      <AlertDescription>
                        We couldn't automatically process this PDF. Try entering the information manually instead.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-center">
                      <Button 
                        onClick={handleSwitchToManualInput}
                        className="mr-2"
                      >
                        Enter Information Manually
                      </Button>
                      <Button 
                        onClick={() => setSelectedFile(null)}
                        variant="outline"
                      >
                        Try Another File
                      </Button>
                    </div>
                  </div>
                )}
                
                {pdfProcessingStatus !== 'failed' && (
                  <div className="mt-6 flex justify-center">
                    <Button 
                      onClick={handleContinue}
                      disabled={uploadMutation.isPending}
                      size="lg"
                      className="w-full max-w-md bg-primary shadow-lg text-white font-medium py-6"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="text-lg">Process PDF</span>
                          <ArrowRight className="ml-3 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {selectedFile && !showDirectTextInput && (
              <div className="mt-4 flex justify-between items-center">
                <Button 
                  onClick={handleSwitchToManualInput}
                  variant="ghost"
                  size="sm" 
                >
                  Enter information manually instead
                </Button>
                
                <Button 
                  onClick={() => setSelectedFile(null)} 
                  variant="outline" 
                >
                  Cancel
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
                  <h4 className="font-medium text-sm">Automatic analysis and processing</h4>
                  <p className="text-sm text-gray-500">Your PDF is automatically analyzed to extract course information, deadlines, and assignments.</p>
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
                  <span>Complex formats including tables and schedules are supported</span>
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
