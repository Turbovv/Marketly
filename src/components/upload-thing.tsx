import { useState } from "react";
import { UploadButton } from "~/utils/uploadthing";
import { FileVideo } from "lucide-react";
import { ClipLoader } from "react-spinners";


interface UploadThingProps {
  onUploadComplete: (files: { url: string }[]) => void;
  onUploadError: (error: Error) => void;
}

const UploadThing: React.FC<UploadThingProps> = ({ onUploadComplete, onUploadError }) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  return (
    <div className="relative inline-flex flex-col items-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <FileVideo size={20} className="text-gray-700" />
      </div>

      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(files) => {
          setUploadProgress(null);
          onUploadComplete(files);
        }}
        onUploadError={(error) => {
          setUploadProgress(null);
          onUploadError(error);
        }}
        onUploadProgress={(progress) => setUploadProgress(progress)}
        className="h-10 w-full opacity-0"
      />

      {uploadProgress !== null && (
        <div className="mt-2 text-sm text-gray-700">
           <ClipLoader color="#5de4c7" /><br />
           Uploading...{uploadProgress}%
        </div>
      )}
    </div>
  );
};

export default UploadThing;