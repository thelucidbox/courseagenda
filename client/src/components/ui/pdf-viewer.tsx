import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Page } from 'react-pdf';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Import the central PDF worker configuration
// This ensures the PDF.js worker is properly set up before trying to use the library
import pdfjs from '@/lib/pdf-worker-config';

// Log that the PDF viewer component is loaded with the worker configuration
console.log('PDF Viewer initialized with worker source:', pdfjs.GlobalWorkerOptions.workerSrc);

interface PDFViewerProps {
  file: File | null;
  onTextExtracted?: (text: string) => void;
  onProcessingError?: () => void;
}

const PDFViewer = ({ file, onTextExtracted, onProcessingError }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfText, setPdfText] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [renderMode, setRenderMode] = useState<'normal' | 'fallback'>('normal');

  useEffect(() => {
    if (file) {
      setLoading(true);
      setError(null);
      
      // Try the primary extraction method first
      extractTextFromPDF(file)
        .then(text => {
          setPdfText(text);
          if (onTextExtracted && text.trim()) {
            onTextExtracted(text);
          }
          setLoading(false);
        })
        .catch(primaryError => {
          console.warn('Primary PDF extraction failed, trying fallback method:', primaryError);
          
          // Try fallback method if primary fails
          extractTextFromPDFFallback(file)
            .then(text => {
              setPdfText(text);
              if (onTextExtracted && text.trim()) {
                onTextExtracted(text);
              }
              setRenderMode('fallback');
              setLoading(false);
            })
            .catch(fallbackError => {
              console.error('All PDF extraction methods failed:', fallbackError);
              setError('We encountered an issue processing this PDF. You may need to enter the information manually.');
              setLoading(false);
              if (onProcessingError) {
                onProcessingError();
              }
            });
        });
    }
  }, [file, onTextExtracted, onProcessingError]);

  // Primary extraction method using PDFjs library directly
  async function extractTextFromPDF(file: File): Promise<string> {
    try {
      console.log('Starting primary PDF extraction for file:', file.name, 'Size:', file.size);
      const arrayBuffer = await file.arrayBuffer();
      console.log('File converted to ArrayBuffer, size:', arrayBuffer.byteLength);
      
      console.log('Loading PDF document...');
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      console.log('PDF loaded successfully. Number of pages:', pdf.numPages);
      
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Use any to bypass type checking for library incompatibilities
        const items = textContent.items as any[];
        console.log(`Page ${i}: Found ${items.length} text items`);
        
        const textItems = items
          .filter(item => 'str' in item)
          .map(item => item.str);
        fullText += textItems.join(' ') + '\n';
        
        console.log(`Page ${i} text extraction complete. Total length so far:`, fullText.length);
      }

      if (!fullText.trim()) {
        console.error('No text content could be extracted from the PDF');
        throw new Error('No text content extracted from PDF');
      }

      console.log('PDF extraction complete. Total extracted text length:', fullText.length);
      return fullText;
    } catch (error) {
      console.error('Error in primary extraction method:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.stack) console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }
  
  // Fallback extraction method using simpler approach
  async function extractTextFromPDFFallback(file: File): Promise<string> {
    try {
      console.log('Starting FALLBACK PDF extraction for file:', file.name, 'Size:', file.size);
      
      return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        
        fileReader.onload = function() {
          try {
            console.log('FileReader loaded file successfully');
            const typedArray = new Uint8Array(this.result as ArrayBuffer);
            console.log('File converted to Uint8Array, length:', typedArray.length);
            
            // Use basic PDF.js without advanced features
            console.log('Loading PDF with fallback method...');
            pdfjsLib.getDocument(typedArray).promise.then(pdf => {
              console.log('PDF loaded successfully in fallback mode. Number of pages:', pdf.numPages);
              let textPromises = [];
              
              for (let i = 1; i <= pdf.numPages; i++) {
                console.log(`Preparing to extract text from page ${i}/${pdf.numPages} (fallback)...`);
                textPromises.push(
                  pdf.getPage(i).then(page => {
                    console.log(`Getting text content for page ${i}...`);
                    return page.getTextContent().then(content => {
                      const items = content.items as any[];
                      console.log(`Page ${i}: Found ${items.length} text items (fallback)`);
                      return items
                        .filter(item => 'str' in item)
                        .map(item => item.str)
                        .join(' ');
                    });
                  })
                );
              }
              
              console.log('Waiting for all page text extraction to complete...');
              Promise.all(textPromises).then(pageTexts => {
                const fullText = pageTexts.join('\n\n');
                console.log('Fallback extraction complete. Total text length:', fullText.length);
                
                if (!fullText.trim()) {
                  console.error('No text content extracted with fallback method');
                  reject(new Error('No text extracted with fallback method'));
                } else {
                  console.log('Fallback extraction successful');
                  resolve(fullText);
                }
              }).catch(error => {
                console.error('Error in Promise.all for text extraction:', error);
                reject(error);
              });
            }).catch(error => {
              console.error('Error loading PDF in fallback mode:', error);
              reject(error);
            });
          } catch (error) {
            console.error('Error in fileReader.onload handler:', error);
            reject(error);
          }
        };
        
        fileReader.onerror = function() {
          console.error('FileReader failed to read the file');
          reject(new Error('FileReader failed to read the file'));
        };
        
        console.log('Starting FileReader...');
        fileReader.readAsArrayBuffer(file);
      });
    } catch (error) {
      console.error('Error in fallback extraction method:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.stack) console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.max(1, Math.min(numPages || 1, newPageNumber));
    });
  }

  if (!file) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center text-gray-500">
          No PDF file selected. Please upload a syllabus.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{file.name}</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(URL.createObjectURL(file), '_blank')}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center space-x-2 mb-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search in document..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-grow"
              />
            </div>

            <ScrollArea className="h-[500px] border rounded-md bg-white">
              {loading ? (
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : error ? (
                <div className="p-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading PDF</AlertTitle>
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                  
                  {pdfText ? (
                    <div className="mt-4 p-4 bg-gray-50 rounded border text-sm font-mono">
                      <h4 className="font-semibold mb-2">Extracted Text Preview:</h4>
                      <div className="max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                        {pdfText.length > 1000 
                          ? pdfText.substring(0, 1000) + '...' 
                          : pdfText}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : renderMode === 'fallback' ? (
                <div className="p-4">
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <AlertTitle>Using Simplified View</AlertTitle>
                    <AlertDescription>
                      We're displaying this PDF in simplified mode. Some visual elements may not appear correctly.
                    </AlertDescription>
                  </Alert>
                  
                  <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="pdf-document"
                    error={
                      <div className="text-center p-4">
                        <p className="text-red-500">Could not render PDF preview.</p>
                        <p className="text-sm mt-2">However, we've successfully extracted the text content.</p>
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      renderTextLayer={true}
                      renderAnnotationLayer={false}
                      className="pdf-page"
                      error={
                        <div className="p-4 border rounded bg-gray-50">
                          <h4 className="font-medium">Page {pageNumber} Text Content:</h4>
                          <p className="mt-2 whitespace-pre-wrap text-sm">
                            {pdfText.split('\n\n')[pageNumber - 1] || 'No content available for this page.'}
                          </p>
                        </div>
                      }
                    />
                  </Document>
                </div>
              ) : (
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="pdf-document"
                  error={
                    <div className="text-center p-4">
                      <p className="text-red-500">Unable to render this PDF.</p>
                      {pdfText ? (
                        <p className="text-sm mt-2">However, we've successfully extracted the text content.</p>
                      ) : null}
                    </div>
                  }
                >
                  <Page 
                    pageNumber={pageNumber} 
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="pdf-page"
                  />
                </Document>
              )}
            </ScrollArea>

            <div className="flex justify-between items-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(-1)}
                disabled={pageNumber <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <p className="text-sm text-gray-500">
                Page {pageNumber} of {numPages || '?'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changePage(1)}
                disabled={pageNumber >= (numPages || 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PDFViewer;
