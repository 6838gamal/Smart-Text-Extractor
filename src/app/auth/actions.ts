'use server';

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { z } from 'zod';
import { redirect } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function emailSignup(values: z.infer<typeof signupSchema>) {
  const validatedFields = signupSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'حقول غير صالحة!' };
  }
  
  const { email, password } = validatedFields.data;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a document for the new user in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      email: user.email,
      plan: 'free', // Assign free plan by default
      createdAt: new Date(),
    });

  } catch (error: any) {
    return { error: error.message };
  }

  redirect('/pricing');
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function emailLogin(values: z.infer<typeof loginSchema>) {
    const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'حقول غير صالحة!' };
  }

  const { email, password } = validatedFields.data;

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential') {
      return { error: 'بريد إلكتروني أو كلمة مرور غير صالحة.' };
    }
    return { error: 'حدث خطأ ما.' };
  }
  
  redirect('/');
}

export async function socialSignIn(providerName: 'google' | 'github' | 'facebook') {
  let provider;
  switch (providerName) {
    case 'google':
      provider = new GoogleAuthProvider();
      break;
    case 'github':
      provider = new GithubAuthProvider();
      break;
    case 'facebook':
      provider = new FacebookAuthProvider();
      break;
    default:
      return { error: 'مزود غير صالح' };
  }
  
  // This part cannot be executed on the server, it must be run on the client.
  // We will adjust the call in the component accordingly.
  // The server action will just serve as a hub, but the actual popup
  // logic will be client-side.
  console.log(`Redirecting to ${providerName} sign in. This should be handled client-side.`);
}
