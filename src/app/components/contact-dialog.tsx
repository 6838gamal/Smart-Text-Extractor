
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Instagram, Twitter, Send, Mail, Facebook } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Simple SVG for Telegram and WhatsApp
const TelegramIcon = () => <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-1.37.2-1.64l16.12-5.95c.74-.27 1.45.16 1.18 1.08l-3.03 14.07c-.33 1.16-1.37 1.44-2.22.89l-4.22-3.11l-2.05 1.97c-.24.24-.45.45-.8.45z"/></svg>;
const WhatsAppIcon = () => <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.75 13.96c.25.25.25.65 0 .9l-1.4 1.4c-.25.25-.65.25-.9 0l-1.15-1.15a6.5 6.5 0 1 1 3.45-3.45l1.15 1.15c.25.25.25.65 0 .9zm-5.22-8.21a5.5 5.5 0 0 0-7.78 7.78l-.01.01a5.5 5.5 0 0 0 7.78-7.78zM12 20a8 8 0 1 1 8-8a8 8 0 0 1-8 8z"/></svg>;

type ContactDialogProps = {
  children: React.ReactNode; // The trigger button
};

export function ContactDialog({ children }: ContactDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Mock sending message
        toast({
            title: "تم إرسال الرسالة",
            description: "شكرًا لتواصلك معنا! سنقوم بالرد في أقرب وقت ممكن.",
        });
        setIsOpen(false);
    };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl" dir="rtl">
            <DialogHeader>
                <DialogTitle>تواصل معنا</DialogTitle>
                <DialogDescription>
                    نحن هنا للمساعدة. اختر الطريقة المفضلة لديك للتواصل أو أرسل لنا رسالة مباشرة.
                </DialogDescription>
            </DialogHeader>
            
            <div className="grid md:grid-cols-2 gap-8 py-4">
                {/* Social Links Part */}
                <div className="space-y-4">
                    <h3 className="font-semibold">عبر وسائل التواصل الاجتماعي:</h3>
                    <div className="flex flex-col gap-3">
                       <Button variant="outline" asChild className="justify-start">
                           <a href="mailto:dev@example.com" target="_blank" rel="noopener noreferrer">
                                <Mail className="ml-2"/> البريد الإلكتروني
                           </a>
                       </Button>
                       <Button variant="outline" asChild className="justify-start">
                           <a href="https://wa.me/774440982" target="_blank" rel="noopener noreferrer">
                                <WhatsAppIcon /> <span className="mr-2">واتساب</span>
                           </a>
                       </Button>
                       <Button variant="outline" asChild className="justify-start">
                           <a href="https://t.me/Gamalalhwish" target="_blank" rel="noopener noreferrer">
                               <TelegramIcon /> <span className="mr-2">تليجرام</span>
                           </a>
                       </Button>
                        <Button variant="outline" asChild className="justify-start">
                           <a href="https://www.facebook.com/jmal.alhwysh.2025?mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer">
                                <Facebook className="ml-2"/> فيسبوك
                           </a>
                       </Button>
                       <Button variant="outline" asChild className="justify-start">
                           <a href="https://www.instagram.com/gamal_almaqtary_tech_services/" target="_blank" rel="noopener noreferrer">
                                <Instagram className="ml-2"/> انستغرام
                           </a>
                       </Button>
                       <Button variant="outline" asChild className="justify-start">
                           <a href="https://x.com/alhwysh787472?s=09" target="_blank" rel="noopener noreferrer">
                                <Twitter className="ml-2"/> تويتر / X
                           </a>
                       </Button>
                    </div>
                </div>

                {/* Message Form Part */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <h3 className="font-semibold">أو أرسل رسالة مباشرة:</h3>
                    <div className="grid gap-2">
                        <Label htmlFor="subject">الموضوع</Label>
                        <Input id="subject" placeholder="مثال: استفسار عن الخطة المخصصة" required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="message">الرسالة</Label>
                        <Textarea id="message" placeholder="اكتب رسالتك هنا..." required rows={5}/>
                    </div>
                    <Button type="submit" className="w-full">
                        <Send className="ml-2" />
                        إرسال الرسالة
                    </Button>
                </form>
            </div>
            
            <DialogFooter>
                <Button variant="secondary" onClick={() => setIsOpen(false)}>إغلاق</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
