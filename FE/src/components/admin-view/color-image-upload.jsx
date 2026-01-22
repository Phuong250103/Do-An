import { UploadCloudIcon, XIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import axios from "axios";
import { Skeleton } from "../ui/skeleton";

function ColorImageUpload({
  colorName,
  colorCode,
  uploadedImageUrl,
  onImageUrlChange,
  isEditMode = false,
}) {
  const inputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageLoadingState, setImageLoadingState] = useState(false);

  function handleImageFileChange(event) {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) setImageFile(selectedFile);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event) {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) setImageFile(droppedFile);
  }

  function handleRemoveImage() {
    setImageFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onImageUrlChange("");
  }

  async function uploadImageToCloudinary() {
    if (!imageFile) return;

    setImageLoadingState(true);
    const data = new FormData();
    data.append("my_file", imageFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/admin/products/upload-image",
        data
      );

      if (response?.data?.success) {
        const imageUrl = response.data.result.url;
        onImageUrlChange(imageUrl);
        setImageLoadingState(false);
      } else {
        setImageLoadingState(false);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setImageLoadingState(false);
    }
  }

  useEffect(() => {
    if (imageFile !== null) {
      uploadImageToCloudinary();
    }
  }, [imageFile]);

  return (
    <div className="w-full">
      <Label className="text-xs text-muted-foreground mb-1 block">
        Image for this color
      </Label>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-lg p-2 min-h-[80px] flex items-center justify-center"
      >
        <Input
          id={`color-image-upload-${colorName}`}
          type="file"
          accept="image/*"
          className="hidden"
          ref={inputRef}
          onChange={handleImageFileChange}
          disabled={isEditMode && !uploadedImageUrl}
        />

        {uploadedImageUrl ? (
          <div className="relative w-full">
            <div className="relative w-full h-20 rounded overflow-hidden border">
              <img
                src={uploadedImageUrl}
                alt={`${colorName} color`}
                className="w-full h-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-0 right-0 h-6 w-6 text-red-500 hover:text-red-700"
              onClick={handleRemoveImage}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        ) : imageLoadingState ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <Label
            htmlFor={`color-image-upload-${colorName}`}
            className="flex flex-col items-center justify-center cursor-pointer w-full h-20"
          >
            <UploadCloudIcon className="w-6 h-6 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground text-center">
              Upload image
            </span>
          </Label>
        )}
      </div>
    </div>
  );
}

export default ColorImageUpload;
