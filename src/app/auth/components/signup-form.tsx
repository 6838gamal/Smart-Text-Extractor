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
import { useTransition } from 'react';
import { emailSignup } from '../actions';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({ message: 'الرجاء إدخال بريد إلكتروني صالح.' }),
  password: z.string().min(6, { message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' }),
});

export function SignupForm() {
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
        const result = await emailSignup(values);
        if (result?.error) {
            toast({
                variant: 'destructive',
                title: 'فشل التسجيل',
                description: result.error,
            });
        } else {
            toast({
                title: 'تم التسجيل بنجاح',
                description: 'أهلاً بك! الرجاء اختيار خطة للبدء.',
            });
            router.push('/pricing');
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
            إنشاء حساب
        </Button>
      </form>
    </Form>
  );
}
