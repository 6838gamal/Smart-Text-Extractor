'use client';

import { Button } from "@/components/ui/button";
import { Github, Facebook } from "lucide-react";
import { 
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc } from "firebase/firestore";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const LinkedInIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
        <path fill="currentColor" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-11 3H5v11h3V6m2 0h3v2h-3V6m4.5 0c1.93 0 3.5 1.57 3.5 3.5V17h-3v-5.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V17h-3v-5.5C9.5 7.57 11.07 6 13 6h1.5z"/>
    </svg>
)

export function SocialButtons() {
    const router = useRouter();
    const { toast } = useToast();

    const handleSocialLogin = async (providerName: 'google' | 'github' | 'facebook') => {
        let provider;
        if (providerName === 'google') provider = new GoogleAuthProvider();
        if (providerName === 'github') provider = new GithubAuthProvider();
        if (providerName === 'facebook') provider = new FacebookAuthProvider();

        if (!provider) return;

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore, if not, it's a new user
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // New user: create document and redirect to pricing
                await setDoc(userDocRef, {
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    plan: 'free',
                    createdAt: new Date(),
                });
                router.push('/pricing');
            } else {
                // Returning user: redirect to home
                router.push('/');
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'فشل المصادقة',
                description: 'تعذر تسجيل الدخول باستخدام الموفر المحدد.'
            })
        }
    }

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            أو المتابعة باستخدام
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" type="button" onClick={() => handleSocialLogin('google')}>
            <span className="mr-2">Google</span> <GoogleIcon />
        </Button>
        <Button variant="outline" type="button" onClick={() => handleSocialLogin('github')}>
            <span className="mr-2">GitHub</span> <Github />
        </Button>
      </div>
       <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" type="button" onClick={() => handleSocialLogin('facebook')}>
            <span className="mr-2">Facebook</span> <Facebook />
        </Button>
        <Button variant="outline" type="button" disabled>
            <span className="mr-2">LinkedIn</span> <LinkedInIcon />
        </Button>
      </div>
    </>
  );
}
