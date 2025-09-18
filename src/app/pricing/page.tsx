
"use client";

import React, { useState } from "react";
import AppHeader from "@/app/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, UserCheck } from "lucide-react";
import { PaymentDialog } from "./components/payment-dialog";
import { useRouter } from "next/navigation";
import { ContactDialog } from "../components/contact-dialog";
import { useAuth } from "@/hooks/use-auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";


const plans = [
  {
    id: "free",
    name: "الخطة المجانية",
    price: "0$",
    priceDescription: "للتجربة فقط",
    description: "مناسبة للتجربة والاستخدام الشخصي البسيط.",
    features: [
      "3 عمليات فقط.",
      "حجم ملف 5 ميجا كحد أقصى.",
      "صفحة PDF واحدة فقط.",
      "استخراج النص من الصور.",
    ],
    cta: "استخدم الخطة المجانية",
    isFree: true,
  },
  {
    id: "starter",
    name: "الخطة الأساسية",
    price: "5$",
    priceDescription: "للأفراد",
    description: "مدخلك المثالي للاستعمال العملي.",
    features: [
      "200 عملية شهرياً.",
      "حجم ملف 50 ميجا كحد أقصى.",
      "20 صفحة PDF كحد أقصى.",
      "تنزيل النتائج بصيغة TXT.",
      "بدون إعلانات.",
    ],
    cta: "اختر الخطة الأساسية",
  },
  {
    id: "pro",
    name: "الخطة المتقدمة",
    price: "12$",
    priceDescription: "للطلاب والمستقلين",
    description: "الخيار الأفضل للإنتاجية العالية.",
    features: [
      "3000 عملية شهرياً.",
      "حجم ملف 100 ميجا.",
      "100 صفحة PDF كحد أقصى.",
      "دعم 10 لغات عالمية.",
      "تصدير النتائج كـ TXT أو DOCX.",
    ],
    cta: "الترقية إلى برو",
    featured: true,
  },
  {
    id: "business",
    name: "الخطة الاحترافية",
    price: "49$",
    priceDescription: "للشركات المتوسطة",
    description: "حلول متكاملة للأعمال.",
    features: [
      "عمليات غير محدودة.",
      "حجم ملف 500 ميجا.",
      "1000 صفحة PDF كحد أقصى.",
      "واجهة برمجة تطبيقات (API).",
      "حتى 20 مستخدم.",
    ],
    cta: "اختر الخطة الاحترافية",
  },
];

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const router = useRouter();
  const { user, plan: activePlanId, refreshPlan } = useAuth();
  const { toast } = useToast();

  const handlePlanSelection = async (plan: any) => {
    // If user is not logged in, redirect them to sign up
    if (!user) {
      router.push('/auth/signup?redirect=/pricing');
      return;
    }
    
    // If user selects the free plan
    if (plan.isFree) {
      try {
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { plan: 'free' }, { merge: true });
        refreshPlan(); // Refresh auth context
        toast({ title: "تم التغيير إلى الخطة المجانية." });
        router.push('/');
      } catch (error) {
        toast({ variant: "destructive", title: "حدث خطأ", description: "فشل تحديث الخطة." });
      }
      return;
    }
    
    // If the plan requires contacting sales
    if (plan.isContact) {
      // The ContactDialog will handle this. The button is already wrapped.
      return;
    }

    // For paid plans, open the payment dialog
    setSelectedPlan(plan);
  };

  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">
            خطط وأسعار مرنة للجميع
          </h1>
          <p className="text-lg text-muted-foreground">
            تسعير بسيط وشفاف. ابدأ مجانًا وقم بالترقية حسب حاجتك. لا توجد رسوم خفية.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === activePlanId;
            return (
            <Card key={plan.name} className={`flex flex-col ${plan.featured ? 'border-primary shadow-lg' : ''} ${isCurrentPlan ? 'border-2 border-green-500 ring-4 ring-green-500/20' : ''}`}>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.price.includes('$') && !plan.isFree ? '/ شهر' : ''}</span>
                  <p className="text-sm text-muted-foreground mt-1">{plan.priceDescription}</p>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 ml-2 shrink-0 mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                 {plan.isContact ? (
                   <ContactDialog>
                     <Button className="w-full" variant={plan.featured ? 'default' : 'outline'}>
                       {plan.cta}
                     </Button>
                   </ContactDialog>
                 ) : isCurrentPlan ? (
                    <Button className="w-full" disabled variant="secondary">
                      <UserCheck className="ml-2"/>
                      الخطة الحالية
                    </Button>
                 ) : (
                  <Button onClick={() => handlePlanSelection(plan)} className="w-full" variant={plan.featured ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                 )}
              </CardFooter>
            </Card>
          )})}
        </div>
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
      
      {selectedPlan && (
          <PaymentDialog 
              plan={selectedPlan}
              isOpen={!!selectedPlan}
              onClose={() => setSelectedPlan(null)}
          />
      )}
    </div>
  );
}
