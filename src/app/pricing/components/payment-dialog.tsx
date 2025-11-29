
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Mock Payment Gateway Icons (replace with actual icons or images)
const StripeIcon = () => <svg className="h-6 w-10" viewBox="0 0 48 48"><path fill="#6772e5" d="M14 18h20v4H14zM14 24h20v4H14zM14 30h20v4H14zM39 12H9c-1.7 0-3 1.3-3 3v18c0 1.7 1.3 3 3 3h30c1.7 0 3-1.3 3-3V15c0-1.7-1.3-3-3-3zM9 38c-2.8 0-5-2.2-5-5V15c0-2.8 2.2-5 5-5h30c2.8 0 5 2.2 5 5v18c0 2.8-2.2 5-5 5H9z"/></svg>;
const PayPalIcon = () => <svg className="h-6 w-10" viewBox="0 0 24 24"><path fill="#003087" d="M22.5 5.5H8.3l-.3 1.9c0 .1 0 .2.1.3c.1.1.2.1.3.1h7.4c.5 0 .9.4.9.9s-.4.9-.9.9h-7c-.1 0-.2.1-.3.2l-3.2 9.5c-.1.2 0 .4.2.5h3.9c.1 0 .2 0 .3-.1l.7-2.1c.1-.2.3-.3.5-.3h3.4c.2 0 .4.1.5.3l.6 2.1c.1.1.2.1.3.1h3.7c.3 0 .5-.3.4-.6l-4.1-12.2c-.2-.5-.7-.9-1.2-.9H8.7c-.1 0-.2.1-.3.2L8.2 6c-.1.2 0 .4.2.5h13.2c.5 0 .9-.4.9-.9s-.4-1.1-.9-1.1z"/><path fill="#009cde" d="M23.1 4H7.8C7.3 4 6.9 4.4 6.9 4.9c0 .3.2.6.5.7l.2.1h14.7c.5 0 .9.4.9.9s-.4.9-.9.9H7.6c-1.1 0-2.1.9-2.1 2.1l3.2 9.5c.3.9 1.1 1.5 2.1 1.5h3.9c.1 0 .2 0 .3-.1l.7-2.1c.1-.2.3-.3.5-.3h3.4c.2 0 .4.1.5.3l.6 2.1c.1.1.2.1.3.1h3.7c.6 0 1.1-.6.9-1.2l-4.1-12.2c-.4-1.2-1.5-2-2.8-2H7.2c-.1 0-.2.1-.3.2l-.2.6c-.1.2 0 .4.2.5H22c.5 0 .9-.4.9-.9s-.4-1-.8-1z"/></svg>;
const TapIcon = () => <div className="h-6 w-10 flex items-center justify-center bg-gray-200 rounded-sm text-xs font-bold text-gray-600">TAP</div>;

const paymentGateways = {
  global: [
    { id: "stripe", name: "Stripe", icon: <StripeIcon /> },
    { id: "paypal", name: "PayPal", icon: <PayPalIcon /> },
  ],
  mena: [
    { id: "tap", name: "Tap Payments", icon: <TapIcon/> },
  ],
};

type PaymentDialogProps = {
  plan: any;
  isOpen: boolean;
  onClose: () => void;
};

export function PaymentDialog({ plan, isOpen, onClose }: PaymentDialogProps) {
  const [selectedGateway, setSelectedGateway] = useState("stripe");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user, refreshPlan } = useAuth();

  const handlePayment = async () => {
    if (!user || !plan.id) {
        toast({ variant: "destructive", title: "خطأ", description: "يجب تسجيل الدخول لإتمام العملية." });
        return;
    }
    setIsProcessing(true);

    // In a real application, this would trigger a server-side process
    // (e.g., a Cloud Function) to handle the payment with the selected gateway.
    // After successful payment, the server would update the user's plan in Firestore.
    console.log(`Initiating payment for ${plan.name} for user ${user.uid} via ${selectedGateway}`);
    
    // For this simulation, we'll directly update the user's plan in Firestore.
    // This is NOT secure for a real application but demonstrates the flow.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    try {
        const userDocRef = doc(db, "users", user.uid);
        // We use merge: true to avoid overwriting other user data.
        await setDoc(userDocRef, { plan: plan.id }, { merge: true });

        // Refresh the auth context to get the new plan
        refreshPlan();

        toast({
          title: "تم الدفع بنجاح!",
          description: `لقد اشتركت في ${plan.name}.`,
        });

        setIsProcessing(false);
        onClose();
        
    } catch (error) {
        console.error("Failed to update plan:", error);
        toast({
            variant: "destructive",
            title: "فشل تحديث الخطة",
            description: "حدث خطأ أثناء تحديث اشتراكك. الرجاء التواصل مع الدعم.",
        });
        setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إتمام عملية الدفع</DialogTitle>
          <DialogDescription>
            أنت على وشك الاشتراك في <strong>{plan.name}</strong> مقابل{" "}
            <strong>{plan.price}/شهر</strong>. اختر طريقة الدفع.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
            <h3 className="mb-4 text-lg font-medium">اختر بوابة الدفع</h3>
            <RadioGroup value={selectedGateway} onValueChange={setSelectedGateway} className="grid gap-4">
                
                <h4 className="font-semibold text-muted-foreground mt-4 text-sm">بوابات عالمية</h4>
                {paymentGateways.global.map(gw => (
                    <Label key={gw.id} htmlFor={gw.id} className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent cursor-pointer has-[:checked]:border-primary">
                        <RadioGroupItem value={gw.id} id={gw.id} />
                        {gw.icon}
                        <span>{gw.name}</span>
                    </Label>
                ))}

                <h4 className="font-semibold text-muted-foreground mt-4 text-sm">الشرق الأوسط وشمال أفريقيا</h4>
                    {paymentGateways.mena.map(gw => (
                    <Label key={gw.id} htmlFor={gw.id} className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent cursor-pointer has-[:checked]:border-primary">
                        <RadioGroupItem value={gw.id} id={gw.id} />
                        {gw.icon}
                        <span>{gw.name}</span>
                    </Label>
                ))}
            </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            إلغاء
          </Button>
          <Button onClick={handlePayment} disabled={isProcessing}>
            {isProcessing && <Loader2 className="ml-2 animate-spin" />}
            ادفع الآن ({plan.price})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
