import { Button } from "@/app/components/ui/button";
import { AlertCircle, Upload, CheckCircle, Loader2 } from "lucide-react";

interface PlaceholderPosition {
  x: number;
  y: number;
}

interface NamePlaceholder extends PlaceholderPosition {
  width: number;
  height: number;
}

interface ImagePlaceholder extends PlaceholderPosition {
  diameter: number;
}

interface ExportPanelProps {
  backgroundImage: string | null;
  imageHolder: ImagePlaceholder;
  nameHolder: NamePlaceholder;
  selectedTags: string[];
  selectedLanguages: string[];
  username: string;
  onExport: () => void;
  isUploading?: boolean;
}

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1440;

export function ExportPanel({
  backgroundImage,
  imageHolder,
  nameHolder,
  selectedTags,
  selectedLanguages,
  username,
  onExport,
  isUploading = false,
}: ExportPanelProps) {
  const validations = {
    hasImage: !!backgroundImage,
    hasTags: selectedTags.length > 0,
    hasLanguages: selectedLanguages.length > 0,
    hasUsername: username.trim().length > 0,
    imageInBounds:
      imageHolder.x >= 0 &&
      imageHolder.y >= 0 &&
      imageHolder.x + imageHolder.diameter <= CANVAS_WIDTH &&
      imageHolder.y + imageHolder.diameter <= CANVAS_HEIGHT,
    nameInBounds:
      nameHolder.x >= 0 &&
      nameHolder.y >= 0 &&
      nameHolder.x + nameHolder.width <= CANVAS_WIDTH &&
      nameHolder.y + nameHolder.height <= CANVAS_HEIGHT,
  };

  const allValid = Object.values(validations).every((v) => v);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <ValidationItem
          valid={validations.hasImage}
          label="Background image uploaded"
        />
        <ValidationItem
          valid={validations.hasTags}
          label="Occasion tags selected"
        />
        <ValidationItem
          valid={validations.hasLanguages}
          label="Language tags selected"
        />
        <ValidationItem
          valid={validations.hasUsername}
          label="Text placeholder provided"
        />
        <ValidationItem
          valid={validations.imageInBounds}
          label="Photo placeholder in bounds"
        />
        <ValidationItem
          valid={validations.nameInBounds}
          label="Name placeholder in bounds"
        />
      </div>

      <Button
        onClick={onExport}
        disabled={!allValid || isUploading}
        className={`w-full h-11 font-semibold text-sm transition-all duration-200 ${
          allValid && !isUploading
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200 hover:shadow-xl'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        {isUploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {isUploading ? 'Uploading...' : allValid ? 'Upload Template' : 'Complete Requirements'}
      </Button>

      {!allValid && (
        <p className="text-xs text-gray-500 text-center bg-gray-50 rounded-lg py-2 px-3">
          ✓ Complete all validations above to proceed
        </p>
      )}

      {allValid && (
        <p className="text-xs text-green-700 text-center bg-green-50 rounded-lg py-2 px-3 font-medium">
          ✓ Ready to upload template
        </p>
      )}
    </div>
  );
}

function ValidationItem({
  valid,
  label,
}: {
  valid: boolean;
  label: string;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all ${
        valid ? 'bg-green-50' : 'bg-gray-50'
      }`}
    >
      {valid ? (
        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
      )}
      <span
        className={`text-xs font-medium ${
          valid ? 'text-green-900' : 'text-gray-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}