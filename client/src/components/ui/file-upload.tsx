import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

const FileUpload = ({ 
  onFileSelect, 
  accept = '.pdf', 
  maxSizeMB = 10 
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    // Log file details for debugging
    console.log('Validating file:', { 
      name: file.name, 
      type: file.type, 
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    // Check file type - be more permissive with MIME types
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const isPdf = 
      fileType === 'application/pdf' ||
      fileType === 'application/x-pdf' ||
      fileType === 'binary/octet-stream' ||
      fileType.includes('pdf') ||
      fileName.endsWith('.pdf');
    
    if (!isPdf) {
      setErrorMessage('Only PDF files are supported');
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setErrorMessage(`File size must be less than ${maxSizeMB}MB`);
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB`,
        variant: "destructive"
      });
      return;
    }

    // Clear any previous error
    setErrorMessage(null);
    
    // Process the file
    onFileSelect(file);
    
    toast({
      title: "File uploaded successfully",
      description: `${file.name} has been uploaded`,
      variant: "default"
    });
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition cursor-pointer",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted hover:border-primary"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
        >
          <div className="mb-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          </div>
          <p className="mb-2">Drag and drop your syllabus PDF here</p>
          <p className="text-sm text-muted-foreground mb-4">or</p>
          <Button className="bg-primary text-primary-foreground">
            <Upload className="mr-2 h-4 w-4" />
            Browse Files
          </Button>
          <input
            type="file"
            className="hidden"
            accept={accept}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground mt-4">Supported format: PDF</p>
          
          {errorMessage && (
            <div className="mt-4 flex items-center justify-center text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errorMessage}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
