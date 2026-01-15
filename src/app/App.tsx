import { useState, useEffect } from 'react';
import { ImageUploader } from '@/app/components/ImageUploader';
import { ImageCropper } from '@/app/components/ImageCropper';
import { DesignCanvas } from '@/app/components/DesignCanvas';
import { TagSelector } from '@/app/components/TagSelector';
import { TextBackgroundSelector, type TextBackgroundStyle } from '@/app/components/TextBackgroundSelector';
import { ImageStrokeSelector, type ImageStrokeStyle } from '@/app/components/ImageStrokeSelector';
import { TextAlignmentSelector, type TextAlignment } from '@/app/components/TextAlignmentSelector';
import { PreviewPanel } from '@/app/components/PreviewPanel';
import { ExportPanel } from '@/app/components/ExportPanel';
import { SuccessModal } from '@/app/components/SuccessModal';
import { toast } from 'sonner';
import lokalLogo from '@/assets/lokal.png';

interface ImagePlaceholder {
  x: number;
  y: number;
  diameter: number;
}

interface NamePlaceholder {
  x: number;
  y: number;
  width: number;
  height: number;
}

type AspectRatio = '3:4' | '9:16';

const CANVAS_WIDTH = 1080;

const getCanvasHeight = (aspectRatio: AspectRatio) => {
  return aspectRatio === '3:4' ? 1440 : 1920;
};

// Tags interface for API response
interface Tag {
  id: number;
  title: string;
}

const LANGUAGE_TAGS = [
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Bengali',
  'Gujarati',
  'Punjabi'
];

// Sample photo for preview
const SAMPLE_PHOTO = 'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

export default function App() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [textBackgroundStyle, setTextBackgroundStyle] = useState<TextBackgroundStyle>('none');
  const [imageStrokeStyle, setImageStrokeStyle] = useState<ImageStrokeStyle>('none');
  const [textAlignment, setTextAlignment] = useState<TextAlignment>('center');
  const [username, setUsername] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [occasionTags, setOccasionTags] = useState<Tag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState<boolean>(true);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  
  // Cropper state
  const [rawImage, setRawImage] = useState<string | null>(null);
  
  const canvasHeight = getCanvasHeight(aspectRatio);

  // Fetch tags from API on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoadingTags(true);
        const response = await fetch('https://testapi.eazeapp.com/greetings/tags/');
        if (!response.ok) {
          throw new Error(`Failed to fetch tags: ${response.status}`);
        }
        const tags: Tag[] = await response.json();
        console.log('Fetched tags:', tags);
        setOccasionTags(tags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        toast.error('Failed to load tags', {
          description: 'Using default tags instead',
        });
        // Fallback to hardcoded tags if API fails
        setOccasionTags([
    {
        "id": 10,
        "title": "Motivational"
    },
    {
        "id": 9,
        "title": "Anniversary"
    },
    {
        "id": 8,
        "title": "New Year"
    },
    {
        "id": 7,
        "title": "Birthday"
    },
    {
        "id": 6,
        "title": "Quotes"
    },
    {
        "id": 5,
        "title": "Diwali"
    },
    {
        "id": 4,
        "title": "Pongal"
    },
    {
        "id": 3,
        "title": "Christmas"
    },
    {
        "id": 2,
        "title": "Good Evening"
    },
    {
        "id": 1,
        "title": "Good Morning"
    }
]);
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, []);
  
  const handleRawImageUpload = (imageUrl: string) => {
    setRawImage(imageUrl);
  };
  
  const handleCropComplete = (croppedImageUrl: string) => {
    setBackgroundImage(croppedImageUrl);
    setRawImage(null);
  };
  
  const handleCropCancel = () => {
    setRawImage(null);
  };
  
  // Calculate aspect ratio for cropper
  const cropAspectRatio = aspectRatio === '3:4' ? 3 / 4 : 9 / 16;
  
  // Default placeholder positions
  const [imageHolder, setImageHolder] = useState<ImagePlaceholder>({
    x: (CANVAS_WIDTH - 250) / 2,
    y: 200,
    diameter: 250,
  });

  const [nameHolder, setNameHolder] = useState<NamePlaceholder>({
    x: (CANVAS_WIDTH - 600) / 2,
    y: 550,
    width: 600,
    height: 100,
  });

  // Clamp placeholder positions when aspect ratio changes
  useEffect(() => {
    // Clamp image holder position
    setImageHolder(prev => {
      const maxY = canvasHeight - prev.diameter;
      if (prev.y > maxY) {
        return { ...prev, y: Math.max(0, maxY) };
      }
      return prev;
    });

    // Clamp name holder position
    setNameHolder(prev => {
      const maxY = canvasHeight - prev.height;
      if (prev.y > maxY) {
        return { ...prev, y: Math.max(0, maxY) };
      }
      return prev;
    });
  }, [aspectRatio, canvasHeight]);

  const handleExport = async () => {
    if (!backgroundImage) {
      toast.error('Background image is required');
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert background image URL to blob/file
      const response = await fetch(backgroundImage);
      const blob = await response.blob();
      
      // Create form data as specified in the API
      const formData = new FormData();
      
      // Add the background image file
      formData.append('backgroundImage', blob, 'template-background.png');
      
      // Add aspect ratio
      formData.append('aspectRatio', aspectRatio);
      
      // Add tag (using first occasion tag as the main tag)
      if (selectedOccasions.length > 0) {
        // Find the tag object from occasionTags array
        const selectedTag = occasionTags.find(tag => tag.title === selectedOccasions[0]);
        const tagId = selectedTag ? selectedTag.id.toString() : '3'; // Default to '3' if not found
        formData.append('tag', tagId);
      }
      
      // Add language tags
      selectedLanguages.forEach(language => {
        formData.append('languageTags', language);
      });
      
      // Convert placeholders to percentages and format as JSON strings
      const imagePlaceholderData = {
        x: (imageHolder.x / CANVAS_WIDTH) * 100,
        y: (imageHolder.y / canvasHeight) * 100,
        width: (imageHolder.diameter / CANVAS_WIDTH) * 100,
        height: (imageHolder.diameter / canvasHeight) * 100
      };
      
      const namePlaceholderData = {
        x: (nameHolder.x / CANVAS_WIDTH) * 100,
        y: (nameHolder.y / canvasHeight) * 100,
        width: (nameHolder.width / CANVAS_WIDTH) * 100,
        height: (nameHolder.height / canvasHeight) * 100
      };
      
      formData.append('imagePlaceholder', JSON.stringify(imagePlaceholderData));
      formData.append('namePlaceholder', JSON.stringify(namePlaceholderData));
      
      // Upload template to API
      const uploadResponse = await fetch('https://testapi.eazeapp.com/greetings/templates/', {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Connection': 'keep-alive',
        },
        body: formData
      });
      
      if (uploadResponse.ok) {
        const result = await uploadResponse.json();
        console.log('Upload successful:', result);
        setShowSuccessModal(true);
      } else {
        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload template', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const currentStep = !backgroundImage ? 1 : selectedOccasions.length === 0 || selectedLanguages.length === 0 ? 2 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={lokalLogo} alt="Lokal" className="h-10 w-10 rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Template Design Studio</h1>
              <p className="text-sm text-gray-600">Create personalized image templates for your community</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-200">
              Designer Tool
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-3 space-y-4">
            {/* Steps 1 & 2: Aspect Ratio + Upload Background */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              {/* Step 1: Aspect Ratio */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    1
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">Select Aspect Ratio</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAspectRatio('3:4')}
                    className={`relative px-4 py-3 text-sm font-semibold border-2 rounded-xl transition-all duration-200 ${
                      aspectRatio === '3:4'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <div className="text-base">3:4</div>
                    <div className={`text-xs mt-1 ${aspectRatio === '3:4' ? 'text-amber-100' : 'text-gray-500'}`}>
                      1080×1440
                    </div>
                  </button>
                  <button
                    onClick={() => setAspectRatio('9:16')}
                    className={`relative px-4 py-3 text-sm font-semibold border-2 rounded-xl transition-all duration-200 ${
                      aspectRatio === '9:16'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <div className="text-base">9:16</div>
                    <div className={`text-xs mt-1 ${aspectRatio === '9:16' ? 'text-amber-100' : 'text-gray-500'}`}>
                      1080×1920
                    </div>
                  </button>
                </div>
              </div>

              {/* Horizontal Divider */}
              <div className="h-px bg-gray-200 my-5" />

              {/* Step 2: Upload Background */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= 1 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    2
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">Upload Background</h2>
                </div>
                <ImageUploader 
                  onImageUpload={handleRawImageUpload}
                  hasImage={!!rawImage}
                />
                {rawImage && (
                  <ImageCropper
                    rawImage={rawImage}
                    onCropComplete={handleCropComplete}
                    onClose={handleCropCancel}
                    aspectRatio={cropAspectRatio}
                  />
                )}
              </div>
            </div>

            {/* Step 3: Select Tags */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 2 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <h2 className="text-sm font-bold text-gray-900">Configure Tags</h2>
              </div>
              <div className="space-y-5">
                <TagSelector
                  title="Occasion Tags"
                  description={isLoadingTags ? "Loading tags..." : "Select occasions for this template"}
                  availableTags={(() => {
                    const tagTitles = occasionTags.map(tag => tag.title);
                    console.log('Available tag titles:', tagTitles);
                    return tagTitles;
                  })()}
                  selectedTags={selectedOccasions}
                  onTagsChange={setSelectedOccasions}
                  required={true}
                  disabled={isLoadingTags}
                />
                
                <div className="h-px bg-gray-200" />
                
                <TagSelector
                  title="Language Tags"
                  description="Select supported languages"
                  availableTags={LANGUAGE_TAGS}
                  selectedTags={selectedLanguages}
                  onTagsChange={setSelectedLanguages}
                  required={true}
                />
              </div>
            </div>

            {/* Step 4: Username */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 3 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  4
                </div>
                <h2 className="text-sm font-bold text-gray-900">Text placeholder</h2>
              </div>
              <div className="space-y-3">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700 mb-2 block">Please provide the text</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                  />
                </label>
                <p className="text-xs text-gray-500">
                  Username is required to upload templates
                </p>
              </div>
            </div>

            {/* Step 5: Export */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 3 ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  5
                </div>
                <h2 className="text-sm font-bold text-gray-900">Validate & Upload</h2>
              </div>
              <ExportPanel
                backgroundImage={backgroundImage}
                imageHolder={imageHolder}
                nameHolder={nameHolder}
                selectedTags={selectedOccasions}
                selectedLanguages={selectedLanguages}
                username={username}
                onExport={handleExport}
                isUploading={isUploading}
              />
            </div>
          </div>

          {/* Center - Canvas */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Design Canvas</h2>
                <p className="text-sm text-gray-600">
                  Drag the placeholders to position them. Hover over the name box to resize it.
                </p>
              </div>
              
              <div className="flex justify-center">
                <DesignCanvas
                  backgroundImage={backgroundImage}
                  imageHolder={imageHolder}
                  nameHolder={nameHolder}
                  onImageHolderChange={setImageHolder}
                  onNameHolderChange={setNameHolder}
                  canvasWidth={CANVAS_WIDTH}
                  canvasHeight={canvasHeight}
                  aspectRatio={aspectRatio}
                  imageStrokeStyle={imageStrokeStyle}
                />
              </div>
              
              {backgroundImage && (
                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">Smart Positioning</p>
                      <p className="text-xs text-amber-800">
                        Positions are saved as percentages for accurate rendering across all device sizes
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <PreviewPanel
                backgroundImage={backgroundImage}
                imageHolder={imageHolder}
                nameHolder={nameHolder}
                samplePhoto={SAMPLE_PHOTO}
                sampleName={username || "Enter text above"}
                canvasWidth={CANVAS_WIDTH}
                canvasHeight={canvasHeight}
                textBackgroundStyle={textBackgroundStyle}
                imageStrokeStyle={imageStrokeStyle}
                textAlignment={textAlignment}
              />
            </div>

            {backgroundImage && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <TextBackgroundSelector
                    selectedStyle={textBackgroundStyle}
                    onStyleChange={setTextBackgroundStyle}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <ImageStrokeSelector
                    selectedStyle={imageStrokeStyle}
                    onStyleChange={setImageStrokeStyle}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <TextAlignmentSelector
                    selectedAlignment={textAlignment}
                    onAlignmentChange={setTextAlignment}
                  />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Position Coordinates
                  </h4>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">User Photo</span>
                      <span className="text-gray-900 font-mono text-xs">
                        ({Math.round(imageHolder.x)}, {Math.round(imageHolder.y)})
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">User Name</span>
                      <span className="text-gray-900 font-mono text-xs">
                        ({Math.round(nameHolder.x)}, {Math.round(nameHolder.y)})
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Name Width</span>
                      <span className="text-gray-900 font-mono text-xs">
                        {Math.round(nameHolder.width)}px
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="🎉 Template Successfully Submitted!"
        description="Your template has been uploaded and is now available for end users to customize with their own photos and details."
      />
    </div>
  );
}