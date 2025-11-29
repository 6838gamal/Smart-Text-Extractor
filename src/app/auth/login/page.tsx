import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/app/auth/components/login-form";
import { SocialButtons } from "../components/social-buttons";
import AppHeader from "@/app/components/app-header";

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen" dir="rtl">
      <AppHeader />
      <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-8 md:px-6 md:py-12">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بريدك الإلكتروني أدناه لتسجيل الدخول إلى حسابك
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <LoginForm />
            <SocialButtons />
            <div className="mt-4 text-center text-sm">
              ليس لديك حساب؟{" "}
              <Link href="/auth/signup" className="underline">
                إنشاء حساب
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
