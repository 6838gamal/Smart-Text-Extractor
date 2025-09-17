'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { emailLogin } from '../actions';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صالح.' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة.' }),
});

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
        const result = await emailLogin(values);
        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'فشل تسجيل الدخول',
                description: result.error,
            });
        } else {
            toast({
                title: 'تم تسجيل الدخول بنجاح',
                description: "مرحبا بعودتك!",
            });
            router.push('/');
        }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input placeholder="m@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>كلمة المرور</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin ml-2" />}
          تسجيل الدخول
        </Button>
      </form>
    </Form>
  );
}
