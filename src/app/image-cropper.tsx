
"use client";

import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import 'react-image-crop/dist/ReactCrop.css';
import { useToast } from '@/hooks/use-toast';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ src, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        16 / 9,
        width,
        height
      ),
      width,
      height
    );
    setCrop(initialCrop);
  }

  async function handleConfirmCrop() {
    const image = imgRef.current;
    if (!image || !crop || !crop.width || !crop.height) {
      toast({
        variant: "destructive",
        title: "خطأ في الاقتصاص",
        description: "الرجاء تحديد منطقة للاقتصاص أولاً.",
      });
      return;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        toast({ variant: "destructive", title: "خطأ", description: "فشل في إنشاء سياق الرسم للصورة." });
        return;
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
    
    const base64Image = canvas.toDataURL('image/jpeg');
    onCropComplete(base64Image);
  }

  return (
    <div className="flex flex-col items-center gap-4" dir="ltr">
      <div className="max-h-[60vh] overflow-auto border rounded-md">
        <ReactCrop
          crop={crop}
          onChange={c => setCrop(c)}
          aspect={16 / 9}
        >
          <img ref={imgRef} src={src} onLoad={onImageLoad} alt="Source for cropping" style={{ maxHeight: '60vh' }}/>
        </ReactCrop>
      </div>
      <div className="flex justify-end gap-2 w-full" dir="rtl">
        <Button variant="outline" onClick={onCancel}>إلغاء</Button>
        <Button onClick={handleConfirmCrop}>تأكيد الاقتصاص واستخراج النص</Button>
      </div>
    </div>
  );
}
