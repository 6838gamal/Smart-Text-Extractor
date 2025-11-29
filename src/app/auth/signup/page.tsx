import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignupForm } from "@/app/auth/components/signup-form";
import { SocialButtons } from "../components/social-buttons";
import AppHeader from "@/app/components/app-header";


export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <AppHeader />
       <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8 md:px-6 md:py-12">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">إنشاء حساب</CardTitle>
            <CardDescription>
              أدخل معلوماتك لإنشاء حساب
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SignupForm />
            <SocialButtons />
            <div className="mt-4 text-center text-sm">
              هل لديك حساب بالفعل؟{" "}
              <Link href="/auth/login" className="underline">
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
