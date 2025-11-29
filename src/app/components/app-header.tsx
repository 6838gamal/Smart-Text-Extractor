
"use client";

import Link from "next/link";
import { AppLogo } from "@/app/components/icons";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ContactDialog } from "./contact-dialog";
import { LifeBuoy } from "lucide-react";

function UserNav() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
              <AvatarFallback>
                {user.displayName?.charAt(0) ?? user.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount dir="rtl">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
           <ContactDialog>
             <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <LifeBuoy className="w-4 h-4 ml-2"/>
                الدعم والتواصل
             </DropdownMenuItem>
           </ContactDialog>
          <DropdownMenuItem onClick={() => router.push('/pricing')}>
            الخطط والأسعار
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            تسجيل الخروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost">
        <Link href="/auth/login">تسجيل الدخول</Link>
      </Button>
      <Button asChild>
        <Link href="/auth/signup">إنشاء حساب</Link>
      </Button>
    </div>
  );
}


export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-start space-x-2">
          <ThemeToggle />
          <UserNav />
        </div>
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold font-headline">مستخرج النصوص</span>
          <AppLogo />
        </Link>
      </div>
    </header>
  );
}
