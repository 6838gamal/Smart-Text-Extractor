
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import AppHeader from "@/app/components/app-header";
import FileUploader from "@/app/components/file-uploader";
import { FileCard } from "@/app/file-card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth, type PlanId } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { getExtractedText } from "@/app/actions";
import { PDFDocument } from 'pdf-lib';
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";


export type FileStatus = "queued" | "processing" | "success" | "error";

type BasicFileType = 'image' | 'pdf' | 'audio' | 'video' | 'text' | 'unsupported';

const getFileType = (file: File): { displayType: BasicFileType, processingType: 'image' | 'audio' | 'video' | 'text' | 'unsupported' } => {
    const type = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (type.startsWith('image/')) return { displayType: 'image', processingType: 'image' };
    if (type === 'application/pdf') return { displayType: 'pdf', processingType: 'image' };
    if (type.startsWith('audio/')) return { displayType: 'audio', processingType: 'audio' };
    if (type.startsWith('video/')) return { displayType: 'video', processingType: 'video' };
    if (type.startsWith('text/')) return { displayType: 'text', processingType: 'text' };
    
    if (extension) {
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) return { displayType: 'image', processingType: 'image' };
        if (extension === 'pdf') return { displayType: 'pdf', processingType: 'image' };
        if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(extension)) return { displayType: 'audio', processingType: 'audio' };
        if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension)) return { displayType: 'video', processingType: 'video' };
        if (['txt', 'md', 'json', 'csv', 'xml', 'js', 'ts', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'php', 'swift', 'html', 'css'].includes(extension)) return { displayType: 'text', processingType: 'text' };
    }

    return { displayType: 'unsupported', processingType: 'unsupported' };
};


export type ProcessedFile = {
  id: string;
  file: File;
  previewUrl: string;
  status: FileStatus;
  text?: string;
  error?: string;
  type: BasicFileType;
  isTable?: boolean;
  csvData?: string;
};

const PLAN_LIMITS: Record<PlanId, { usage: number; fileSizeMB: number; pdfPages: number }> = {
    free: { usage: 3, fileSizeMB: 5, pdfPages: 1 },
    starter: { usage: 200, fileSizeMB: 50, pdfPages: 20 },
    pro: { usage: 3000, fileSizeMB: 100, pdfPages: 100 },
    business: { usage: Infinity, fileSizeMB: 500, pdfPages: 1000 },
    enterprise: { usage: Infinity, fileSizeMB: Infinity, pdfPages: Infinity },
    custom: { usage: Infinity, fileSizeMB: Infinity, pdfPages: Infinity },
};


const toDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const readTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};


export default function Home() {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading, plan } = useAuth();
  
  const currentPlanLimits = useMemo(() => PLAN_LIMITS[plan] || PLAN_LIMITS.free, [plan]);

  useEffect(() => {
    const fetchUsageCount = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const monthlyUsage = userDoc.data()?.monthlyUsage || 0;
          setUsageCount(monthlyUsage);
        }
      }
    };
    if(!authLoading) {
      fetchUsageCount();
    }
  }, [user, authLoading, plan]);
  
  const incrementUsage = async () => {
    if (!user) return;
    const newCount = usageCount + 1;
    if (currentPlanLimits.usage !== Infinity && newCount > currentPlanLimits.usage) return;
    
    setUsageCount(newCount);
    const userDocRef = doc(db, "users", user.uid);
    await updateDoc(userDocRef, {
      monthlyUsage: increment(1)
    });
  };
  
  const checkUsageLimit = () => {
    if (currentPlanLimits.usage !== Infinity && usageCount >= currentPlanLimits.usage) {
      setIsLimitModalOpen(true);
      return true;
    }
    return false;
  };

  const processFile = useCallback(async (fileToProcessId: string, dataUri?: string) => {
      const fileToProcess = files.find(f => f.id === fileToProcessId);

      if (!fileToProcess || authLoading || !user) {
        if (!user) {
            setFiles((prev) =>
                prev.map((f) =>
                f.id === fileToProcessId ? { ...f, status: "error", error: "الرجاء تسجيل الدخول أولاً للمتابعة." } : f
                )
            );
        }
        return;
      }
      
      if (checkUsageLimit()) return;

      const { processingType } = getFileType(fileToProcess.file);

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileToProcess.id ? { ...f, status: "processing", text: undefined, error: undefined } : f
        )
      );

      try {
        await incrementUsage();
        
        let extractedText: string | undefined;
        let isTable: boolean | undefined;
        let csvData: string | undefined;

        if (processingType === 'text') {
            extractedText = await readTextFromFile(fileToProcess.file);
            isTable = false;
        } else {
            const fileDataUri = dataUri || await toDataURL(fileToProcess.file);
            const result = await getExtractedText({ fileDataUri });

            if (result.error) {
              throw new Error(result.error);
            }
            extractedText = result.text;
            isTable = result.isTable;
            csvData = result.csvData;
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileToProcess.id
              ? { ...f, status: "success", text: extractedText, isTable, csvData }
              : f
          )
        );

      } catch (e: any) {
         const userDocRef = doc(db, "users", user.uid);
         await updateDoc(userDocRef, { monthlyUsage: increment(-1) });
         setUsageCount(prev => prev - 1);

         setFiles((prev) =>
          prev.map((f) =>
            f.id === fileToProcess.id
              ? { ...f, status: "error", error: e.message || 'فشل استخراج النص.' }
              : f
          )
        );
      }
    }, [files, authLoading, user, plan, usageCount]);

  const handleFileChange = async (newFiles: File[]) => {
    const processedFilesPromises = newFiles.map(async (file): Promise<ProcessedFile> => {
      const { displayType, processingType } = getFileType(file);
      const id = crypto.randomUUID();
      let previewUrl = URL.createObjectURL(file);
      
      const baseProcessedFile = { id, file, previewUrl, type: displayType };

      const fileSizeMB = file.size / 1024 / 1024;
      if (currentPlanLimits.fileSizeMB !== Infinity && fileSizeMB > currentPlanLimits.fileSizeMB) {
        return {
          ...baseProcessedFile,
          status: "error",
          error: `تجاوز حجم الملف الحد المسموح به لخطتك (${currentPlanLimits.fileSizeMB} ميجابايت). الرجاء الترقية.`,
        };
      }

      if (file.type === 'application/pdf') {
          try {
              const arrayBuffer = await file.arrayBuffer();
              const pdfDoc = await PDFDocument.load(arrayBuffer);
              const pageCount = pdfDoc.getPageCount();
              if (currentPlanLimits.pdfPages !== Infinity && pageCount > currentPlanLimits.pdfPages) {
                   return {
                      ...baseProcessedFile,
                      status: "error",
                      error: `تجاوز عدد صفحات PDF الحد المسموح به لخطتك (${currentPlanLimits.pdfPages} صفحة). الرجاء الترقية.`,
                  };
              }
          } catch (e) {
               return {
                  ...baseProcessedFile,
                  status: "error",
                  error: `فشل في قراءة ملف PDF. قد يكون الملف تالفًا.`,
              };
          }
      }

      if (displayType === 'unsupported') {
        return {
          ...baseProcessedFile,
          status: "error",
          error: `نوع الملف (${file.name.split('.').pop()}) غير مدعوم حاليًا.`,
        };
      }

      return { ...baseProcessedFile, status: "queued" };
    });
    
    const processedFiles = await Promise.all(processedFilesPromises);
    setFiles((prevFiles) => [...processedFiles, ...prevFiles]);

    // Automatically process queued files
    processedFiles.forEach(file => {
      if (file.status === 'queued') {
        processFile(file.id);
      }
    });
  };
  
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.previewUrl));
    };
  }, [files]);
  
  if (authLoading) {
     return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                 <Skeleton className="h-12 w-3/4 mx-auto" />
                 <Skeleton className="h-6 w-full mx-auto" />
              </div>
              <div className="mt-12 max-w-4xl mx-auto">
                <Skeleton className="h-56 w-full" />
              </div>
            </main>
        </div>
     )
  }

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
            مستخرج النصوص الذكي
          </h1>
          <p className="text-lg text-muted-foreground">
            ارفع أي ملف (صورة، صوت، فيديو، PDF). سنستخرج النص بدقة عالية، حتى تتمكن من تلخيصه، ترجمته، وتصديره.
          </p>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <FileUploader onFileChange={handleFileChange} />
        </div>

        {files.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-headline font-semibold mb-6">
              الملفات المعالجة
            </h2>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {files.map((file) => (
                <FileCard 
                  key={file.id} 
                  fileData={file}
                  onAction={() => { /* Usage is now incremented before processing */ }}
                  onProcess={processFile}
                  checkUsage={checkUsageLimit}
                  usageCount={usageCount}
                  usageLimit={currentPlanLimits.usage}
                />
              ))}
            </div>
          </div>
        )}
      </main>
      <footer className="py-6 px-4 text-center text-sm text-muted-foreground">
        <div className="mb-2">
          <span>بني بواسطة جمال عبدالناصر. للتواصل: </span>
        </div>
        <div className="flex justify-center items-center flex-wrap gap-x-4 gap-y-2">
            <a href="https://wa.me/774440982" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">WhatsApp</a>
            <a href="https://t.me/Gamalalhwish" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Telegram</a>
            <a href="https://www.linkedin.com/in/gamal-alhwish" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">LinkedIn</a>
            <a href="https://x.com/alhwysh787472?s=09" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">X (Twitter)</a>
            <a href="https://www.facebook.com/jmal.alhwysh.2025?mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Facebook</a>
            <a href="https://www.instagram.com/gamal_almaqtary_tech_services/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Instagram</a>
        </div>
      </footer>
      
      <AlertDialog open={isLimitModalOpen} onOpenChange={setIsLimitModalOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>لقد وصلت إلى الحد المسموح به</AlertDialogTitle>
            <AlertDialogDescription>
              لقد استهلكت جميع محاولاتك في خطتك الحالية ({currentPlanLimits.usage} محاولات). يرجى الترقية إلى خطة أعلى لمواصلة استخدام ميزاتنا.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/pricing')}>الترقية الآن</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
