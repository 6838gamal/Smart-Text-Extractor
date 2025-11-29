
"use client";

import { useRef, useState, type DragEvent } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FileUploaderProps = {
  onFileChange: (files: File[]) => void;
};

export default function FileUploader({ onFileChange }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
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
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileChange(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFileChange(files);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={cn(
        "relative flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card p-12 text-center transition-colors duration-300",
        isDragging ? "border-primary bg-accent" : "border-border"
      )}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <UploadCloud className="w-16 h-16 text-muted-foreground mb-4" />
      <p className="text-xl font-semibold mb-2">اسحب وأفلت الملفات هنا</p>
      <p className="text-muted-foreground mb-6">أو</p>
      <Button onClick={handleButtonClick}>
        <FileUp className="ml-2 h-4 w-4" />
        اختر الملفات
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        يتم دعم ملفات الصور والصوت والفيديو والمستندات
      </p>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
        accept="image/*,application/pdf,audio/*,video/*,text/*"
      />
    </div>
  );
}
