import { useState } from "react";
import { UploadButton } from "~/utils/uploadthing";
import { Camera } from "lucide-react";
import { ClipLoader } from "react-spinners";

interface UploadThingProps {
  onUploadComplete: (files: { url: string }[]) => void;
  onUploadError: (error: Error) => void;
}

const UploadThing: React.FC<UploadThingProps> = ({ onUploadComplete, onUploadError }) => {
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  return (
    <div className="space-y-4">

      <div className="relative border-2 border-dashed border-yellow-400 rounded-3xl p-6 text-center flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
        <Camera size={32} className="text-gray-500 mb-2" />
        <p className=" font-bold">Upload photo</p>
        <p className="text-sm text-gray-500">Max 12 photos</p>

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
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {uploadProgress !== null && (
        <div className="mt-2 text-sm text-gray-700 flex justify-center items-center">
          <ClipLoader color="#5de4c7" />
          <span className="ml-2">Uploading... {uploadProgress}%</span>
        </div>
      )}
    </div>
  );
};

export default UploadThing;