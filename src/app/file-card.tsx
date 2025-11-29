
"use client";

import * as React from "react";
import Image from "next/image";
import {
  FileImage,
  FileText,
  FileAudio,
  FileVideo,
  AlertCircle,
  Clock,
  CheckCircle2,
  Download,
  Languages,
  BookText,
  Loader2,
  Search,
  Crop,
} from "lucide-react";
import { type ProcessedFile } from "@/app/page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSeoKeywords, getSummary, getTranslation } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { ImageCropper } from "./image-cropper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


type FileCardProps = {
  fileData: ProcessedFile;
  onAction: () => void;
  onProcess: (fileId: string, dataUri?: string) => void;
  checkUsage: () => boolean;
  usageCount: number;
  usageLimit: number;
};

const ICONS = {
  image: <FileImage className="w-6 h-6" />,
  pdf: <FileText className="w-6 h-6" />,
  audio: <FileAudio className="w-6 h-6" />,
  video: <FileVideo className="w-6 h-6" />,
  text: <FileText className="w-6 h-6" />,
  unsupported: <AlertCircle className="w-6 h-6 text-destructive" />,
};

const STATUS_INFO = {
  queued: { icon: <Clock className="w-4 h-4 text-muted-foreground" />, text: "في الانتظار" },
  processing: { icon: <Loader2 className="w-4 h-4 animate-spin" />, text: "قيد المعالجة..." },
  success: { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, text: "نجاح" },
  error: { icon: <AlertCircle className="w-4 h-4 text-destructive" />, text: "خطأ" },
};

const CsvViewer = ({ csvData }: { csvData: string }) => {
  const rows = React.useMemo(() => {
    return csvData.split('\n').map(row => row.split(','));
  }, [csvData]);

  if (!rows || rows.length === 0) {
    return <p>لا توجد بيانات لعرضها في الجدول.</p>;
  }

  const header = rows[0];
  const body = rows.slice(1);

  return (
    <ScrollArea className="h-48 w-full rounded-md border">
      <Table className="w-full text-sm">
        <TableHeader>
          <TableRow>
            {header.map((cell, i) => <TableHead key={i}>{cell}</TableHead>)}
          </TableRow>
        </TableHeader>
        <TableBody>
          {body.map((row, i) => (
            <TableRow key={i}>
              {row.map((cell, j) => <TableCell key={j}>{cell}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};


export function FileCard({ fileData, onAction, onProcess, checkUsage, usageCount, usageLimit }: FileCardProps) {
  const { file, status, text, error, type, previewUrl, id, isTable, csvData } = fileData;
  const [isSummaryOpen, setIsSummaryOpen] = React.useState(false);
  const [summary, setSummary] = React.useState("");
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = React.useState(false);
  const [translation, setTranslation] = React.useState("");
  const [isTranslating, setIsTranslating] = React.useState(false);
  const [targetLanguage, setTargetLanguage] = React.useState("English");
  const [isKeywordsOpen, setIsKeywordsOpen] = React.useState(false);
  const [keywords, setKeywords] = React.useState<string[]>([]);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = React.useState(false);
  const [isCropOpen, setIsCropOpen] = React.useState(false);
  
  const { plan } = useAuth();
  const { toast } = useToast();
  const statusInfo = STATUS_INFO[status];
  const limitReached = usageCount >= usageLimit;
  
  const canExportPdf = plan === 'pro' || plan === 'business' || plan === 'enterprise';
  const canExportDocx = canExportPdf;


  const handleSummarize = async () => {
    if (!text || checkUsage()) return;
    setIsSummarizing(true);
    setSummary("");
    onAction();
    const result = await getSummary({ text });
    if (result.error) {
      toast({ variant: "destructive", title: "فشل التلخيص", description: result.error });
    } else {
      setSummary(result.summary || "تعذر إنشاء ملخص.");
      setIsSummaryOpen(true);
    }
    setIsSummarizing(false);
  };

  const handleTranslate = async () => {
    if (!text || checkUsage()) {
      setIsTranslateOpen(false); // Close modal if usage check fails
      return;
    }
    setIsTranslating(true);
    setTranslation("");
    onAction();
    const result = await getTranslation({ text, targetLanguage });
    if (result.error) {
      toast({ variant: "destructive", title: "فشلت الترجمة", description: result.error });
    } else {
      setTranslation(result.translatedText || "تعذرت ترجمة النص.");
    }
    setIsTranslating(false);
  };

  const handleGenerateKeywords = async () => {
    if (!text || checkUsage()) return;
    setIsGeneratingKeywords(true);
    setKeywords([]);
    onAction();
    const result = await getSeoKeywords({ text });
    if (result.error) {
      toast({ variant: "destructive", title: "فشل إنشاء الكلمات الرئيسية", description: result.error });
    } else {
      setKeywords(result.keywords || []);
      setIsKeywordsOpen(true);
    }
    setIsGeneratingKeywords(false);
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setIsCropOpen(false);
    onProcess(id, croppedDataUrl);
  };
  
  const handleExport = (format: "txt" | "md" | "csv") => {
    if (!text) return;

    let blob;
    let extension = format;
    if (format === 'csv' && csvData) {
        blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    } else {
        const content = text;
        blob = new Blob([content], { type: format === 'txt' ? 'text/plain' : 'text/markdown;charset=utf-8' });
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.split('.')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "تم التصدير بنجاح!", description: `تم تنزيل الملف كـ ${format.toUpperCase()}.` });
  };

  const showPreview = type === 'image' || type === 'video' || type === 'audio';

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start gap-4">
            {ICONS[type]}
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold leading-tight line-clamp-2">{file.name}</CardTitle>
              <CardDescription className="text-sm">
                {(file.size / 1024 / 1024).toFixed(2)} ميجابايت
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          <div className="flex items-center space-x-2 text-sm" dir="rtl">
            {statusInfo.icon}
            <span className="mr-2">{statusInfo.text}</span>
          </div>

          {status === "processing" && <Progress value={50} className="h-2 animate-pulse" />}
          {status === "error" && <p className="text-sm text-destructive">{error}</p>}
          
          {status === "success" && text && (
             <div className={`grid grid-cols-1 ${showPreview ? "md:grid-cols-2" : ""} gap-4`}>
                {showPreview && (
                    <div className="relative aspect-video rounded-md overflow-hidden border">
                    {type === 'image' && <Image src={previewUrl} alt={`Preview of ${file.name}`} layout="fill" objectFit="contain" />}
                    {type === 'video' && <video src={previewUrl} controls className="w-full h-full" />}
                    {type === 'audio' && <audio src={previewUrl} controls className="w-full" />}
                    </div>
                )}
                <div className={showPreview ? '' : 'col-span-full'}>
                  {isTable && csvData ? (
                    <Tabs defaultValue="text" className="w-full">
                      <TabsList>
                        <TabsTrigger value="text">نص</TabsTrigger>
                        <TabsTrigger value="table">جدول</TabsTrigger>
                      </TabsList>
                      <TabsContent value="text">
                        <ScrollArea className="h-48 w-full rounded-md border p-3 bg-muted/20">
                          <p className="text-sm whitespace-pre-wrap">{text}</p>
                        </ScrollArea>
                      </TabsContent>
                      <TabsContent value="table">
                        <CsvViewer csvData={csvData} />
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <ScrollArea className="h-48 w-full rounded-md border p-3 bg-muted/20">
                      <p className="text-sm whitespace-pre-wrap">{text}</p>
                    </ScrollArea>
                  )}
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2 flex-wrap items-center">
           <div className="flex-grow text-xs text-muted-foreground" dir="rtl">
             {limitReached 
               ? 'تم الوصول إلى حد الاستخدام' 
               : `${usageLimit === Infinity ? 'استخدام غير محدود' : `المحاولات: ${usageCount} / ${usageLimit}`}`}
           </div>
          
          {type === 'image' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCropOpen(true)}
              disabled={status === 'processing' || (limitReached && usageLimit !== 0)}
              title={limitReached ? 'تم الوصول إلى حد الاستخدام' : 'اقتصاص الصورة'}
            >
              <Crop className="ml-2 h-4 w-4" />
              اقتصاص
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSummarize}
            disabled={status !== "success" || isSummarizing || (limitReached && usageLimit !== 0) }
            title={limitReached ? 'تم الوصول إلى حد الاستخدام' : 'تلخيص النص'}
          >
            {isSummarizing ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <BookText className="ml-2 h-4 w-4" />
            )}
            تلخيص
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateKeywords}
            disabled={status !== 'success' || isGeneratingKeywords || (limitReached && usageLimit !== 0)}
            title={limitReached ? 'تم الوصول إلى حد الاستخدام' : 'توليد كلمات مفتاحية'}
          >
            {isGeneratingKeywords ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Search className="ml-2 h-4 w-4" />
            )}
            كلمات مفتاحية
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => (limitReached && usageLimit !== 0) ? checkUsage() : setIsTranslateOpen(true)}
            disabled={status !== "success" || (limitReached && usageLimit !== 0)}
             title={limitReached ? 'تم الوصول إلى حد الاستخدام' : 'ترجمة النص'}
          >
            <Languages className="ml-2 h-4 w-4" />
            ترجمة
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={status !== "success"}>
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent dir="rtl">
              <DropdownMenuItem onClick={() => handleExport("txt")}>نص (.txt)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("md")}>ماركداون (.md)</DropdownMenuItem>
              {isTable && <DropdownMenuItem onClick={() => handleExport("csv")}>CSV (.csv)</DropdownMenuItem>}
              <DropdownMenuItem disabled={!canExportPdf} onSelect={(e) => e.preventDefault()} title={!canExportPdf ? "الترقية إلى Pro للتصدير بصيغة PDF" : ""}>
                <span className={!canExportPdf ? 'opacity-50' : ''}>PDF (.pdf)</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!canExportDocx} onSelect={(e) => e.preventDefault()} title={!canExportDocx ? "الترقية إلى Pro للتصدير بصيغة DOCX" : ""}>
                <span className={!canExportDocx ? 'opacity-50' : ''}>Word (.docx)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardFooter>
      </Card>

      {/* Crop Dialog */}
      <Dialog open={isCropOpen} onOpenChange={setIsCropOpen}>
        <DialogContent className="max-w-4xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>اقتصاص الصورة</DialogTitle>
            <DialogDescription>حدد الجزء من الصورة الذي تريد استخراج النص منه.</DialogDescription>
          </DialogHeader>
          <ImageCropper
            src={previewUrl}
            onCropComplete={handleCropComplete}
            onCancel={() => setIsCropOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog open={isSummaryOpen} onOpenChange={setIsSummaryOpen}>
        <DialogContent className="sm:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>ملخص</DialogTitle>
            <DialogDescription>ملخص تم إنشاؤه بواسطة الذكاء الاصطناعي لـ {file.name}.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] p-4 border rounded-md bg-muted/50">
            {summary}
          </ScrollArea>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsSummaryOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Translate Dialog */}
      <Dialog open={isTranslateOpen} onOpenChange={setIsTranslateOpen}>
        <DialogContent className="sm:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>ترجمة النص</DialogTitle>
            <DialogDescription>ترجمة النص المستخرج إلى لغة أخرى.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="language">اللغة الهدف</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="اختر اللغة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arabic">العربية</SelectItem>
                  <SelectItem value="Chinese">الصينية</SelectItem>
                  <SelectItem value="English">الإنجليزية</SelectItem>
                  <SelectItem value="French">الفرنسية</SelectItem>
                  <SelectItem value="German">الألمانية</SelectItem>
                  <SelectItem value="Japanese">اليابانية</SelectItem>
                  <SelectItem value="Spanish">الإسبانية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleTranslate} disabled={isTranslating}>
              {isTranslating && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              ترجمة
            </Button>

            {translation && (
              <ScrollArea className="max-h-[40vh] p-4 border rounded-md mt-4 bg-muted/50">
                <p className="text-sm">{translation}</p>
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsTranslateOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SEO Keywords Dialog */}
      <Dialog open={isKeywordsOpen} onOpenChange={setIsKeywordsOpen}>
        <DialogContent className="sm:max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>كلمات مفتاحية للسيو</DialogTitle>
            <DialogDescription>كلمات مفتاحية تم إنشاؤها بواسطة الذكاء الاصطناعي لـ {file.name}.</DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md min-h-[100px] bg-muted/50">
            {keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">{keyword}</Badge>
                ))}
              </div>
            ) : (
              <p>لم يتمكن من إنشاء كلمات مفتاحية.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsKeywordsOpen(false)}>إغلاق</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
