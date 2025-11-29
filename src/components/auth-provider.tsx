
"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { AuthContext } from "@/hooks/use-auth";
import type { User } from "firebase/auth";

// This file is no longer needed as the logic is moved to hooks/use-auth.tsx
// It's kept to avoid breaking imports, but it just re-exports the real provider
export { AuthProvider } from '@/hooks/use-auth';
