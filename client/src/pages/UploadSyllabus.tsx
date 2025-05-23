import { useState, useEffect, SVGProps } from 'react'; // Added SVGProps for CheckIcon
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import FileUpload from '@/components/ui/file-upload'; // Assume this component is/will be styled consistently
import ProgressSteps from '@/components/ui/progress-steps'; // Assume this component is/will be styled consistently
import PDFViewer from '@/components/ui/pdf-viewer'; // Assume this component is/will be styled consistently
import DirectTextExtractor from '@/components/ui/direct-text-extractor'; // Assume this component is/will be styled consistently
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card'; // Import Card
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { type Syllabus } from '@shared/schema';

// Import our PDF worker configuration to ensure it's loaded
import '@/lib/pdf-worker-config';

// Define upload parameters interface
interface UploadParams {
  file: File;
  textContent?: string;
}

const steps = [
  { label: 'Upload Syllabus', status: 'current' as const },
  { label: 'Create Study Plan', status: 'upcoming' as const },
  { label: 'Calendar Integration', status: 'upcoming' as const }
];

const UploadSyllabus = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useMobile();
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
      
      // Use the same mutation as for PDF files, but pass the text as well
      uploadMutation.mutate({ file: textFile, textContent: text });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to process your input',
        variant: 'destructive',
      });
    }
  };
  
  const uploadMutation = useMutation({
    mutationFn: async (params: UploadParams) => {
      const formData = new FormData();
      formData.append('file', params.file);
      
      // Add text content if available
      if (params.textContent) {
        console.log('Adding extracted text content to upload request', params.textContent.length);
        formData.append('textContent', params.textContent);
      } else {
        console.log('No text content to add to form data');
      }
      
      // Log what's being sent
      console.log('Uploading syllabus with form data keys:', Array.from(formData.keys()));
      
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
        toast({
          title: 'No Text Extracted',
          description: 'Please wait for text extraction to complete or enter text manually.',
        });
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
      <ProgressSteps steps={steps} currentStep={1} /> {/* Assuming ProgressSteps is styled according to the guide */}
      
      <div className="flex flex-col md:flex-row gap-6 section-spacing"> {/* Added section-spacing */}
        <div className="md:w-2/3 space-y-6">
          {/* Changed div to Card component */}
          <Card className="p-6"> 
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Upload Your Syllabus</h3> {/* Use theme text color */}
            
            <Alert className="mb-4"> {/* Alert component should be consistent from its own definition */}
              <CheckCircle2 className="h-4 w-4 text-green-500" /> {/* Standard success color is fine */}
              <AlertTitle>Upload your PDF and I'll take care of the rest</AlertTitle>
              <AlertDescription className="text-text-secondary"> {/* Use theme text color */}
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
                  onProcessingError={handlePdfProcessingError}
                />
                
                {pdfProcessingStatus === 'processing' && (
                  // Updated popup with theme styles
                  <div className="absolute top-4 right-4 bg-card/90 p-3 rounded-xl shadow-prodigy-md border border-border">
                    <div className="flex items-center">
                      <div className="h-4 w-4 mr-2 rounded-full border-2 border-prodigy-purple border-t-transparent animate-spin"></div> {/* Use theme color */}
                      <span className="text-xs font-medium text-text-secondary">Processing PDF...</span> {/* Use theme text color */}
                    </div>
                  </div>
                )}
                
                {pdfProcessingStatus === 'failed' && (
                  <div className="mt-4">
                    <Alert variant="destructive" className="mb-4"> {/* Destructive Alert should be consistent */}
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>PDF Processing Failed</AlertTitle>
                      <AlertDescription> {/* Default destructive text color from Alert variant */}
                        We couldn't automatically process this PDF. Try another file or try on a desktop device for manual entry.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-center gap-2 flex-wrap">
                      {/* Buttons use standardized variants */}
                      <Button 
                        onClick={handleSwitchToManualInput}
                        variant="default" // Or another suitable variant like outline
                        className="hidden md:inline-flex" 
                      >
                        Enter Information Manually
                      </Button>
                      <Button 
                        onClick={() => setSelectedFile(null)}
                        variant={isMobile ? "default" : "outline"} // Responsive variant choice
                        className="w-full md:w-auto"
                      >
                        Try Another File
                      </Button>
                    </div>
                  </div>
                )}
                
                {pdfProcessingStatus !== 'failed' && (
                  <div className="mt-6 flex justify-center">
                    {/* Standardized Button with specific padding and shadow for CTA */}
                    <Button 
                      onClick={handleContinue}
                      disabled={uploadMutation.isPending}
                      size="lg"
                      variant="default" // Explicitly use default variant which is themed
                      className="w-full max-w-md py-6 shadow-prodigy-lg" // Custom padding and themed shadow
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Uploading and processing...
                        </>
                      ) : (
                        <>
                          <span className="text-lg">{extractedText ? 'Continue with Extracted Text' : 'Process PDF'}</span>
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
                  variant="ghost" // Ghost is subtle
                  size="sm"
                  className="hidden md:flex" 
                >
                  Enter information manually instead
                </Button>
                
                <div className="md:hidden w-4"></div> {/* Spacer on mobile */}
                
                <Button 
                  onClick={() => setSelectedFile(null)} 
                  variant="outline" // Outline is standard for cancel/secondary actions
                >
                  Cancel
                </Button>
              </div>
            )}
          </Card>

          {/* Changed div to Card component */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">Recent Uploads</h3>
            
            <div className="space-y-2" id="recent-uploads">
              {/* Content will be populated by React Query, assuming it uses themed components */}
            </div>
          </Card>
        </div>
        
        <div className="md:w-1/3">
          {/* Changed div to Card component */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-text-primary">How It Works</h3>
            
            <div className="space-y-4">
              {[
                { title: "Upload your syllabus", description: "Upload your course syllabus in PDF format." },
                { title: "Automatic analysis and processing", description: "Your PDF is automatically analyzed to extract course information, deadlines, and assignments." },
                { title: "Generate your study plan", description: "We'll create a personalized study plan with recommended study sessions based on your course schedule." },
                { title: "Sync with your calendar", description: "Add your study plan directly to Google Calendar, Apple Calendar, or other supported calendar services." }
              ].map((step, index) => (
                <div className="flex space-x-3" key={index}>
                  <div className="w-6 h-6 rounded-full bg-prodigy-purple text-primary-foreground flex items-center justify-center flex-shrink-0 text-xs">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-text-primary">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Tips box with themed styles */}
            <div className="mt-6 p-4 bg-muted/50 rounded-xl border border-border"> {/* Changed to rounded-xl and border-border */}
              <h4 className="font-medium text-sm mb-2 text-text-primary">Tips for Best Results</h4>
              <ul className="text-sm space-y-1">
                {[
                  "Ensure your PDF includes clearly stated dates and deadlines",
                  "Complex formats including tables and schedules are supported",
                  "Both digital and scanned syllabi are supported",
                  "You can always edit extracted information later"
                ].map((tip, index) => (
                  <li className="flex items-start space-x-2" key={index}>
                    <CheckIcon className="text-prodigy-purple mt-0.5 h-4 w-4" /> {/* Use theme color for icon */}
                    <span className="text-text-secondary">{tip}</span> {/* Use theme text color */}
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Helper icon component - already using stroke="currentColor" which is good
const CheckIcon = (props: SVGProps<SVGSVGElement>) => ( // Added SVGProps type
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
