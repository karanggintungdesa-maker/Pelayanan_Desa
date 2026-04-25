'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, AuthError } from 'firebase/auth';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { isUserLoading } = useUser();
  const loginImage = PlaceHolderImages.find((img) => img.id === 'login-hero');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // useEffect yang menyebabkan kedip-kedip saat load halaman telah dihapus.
  // Sekarang, semua logika hanya berjalan setelah tombol "Login" diklik.

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const adminEmail = 'karanggintungdesa@gmail.com';

    if (email !== adminEmail) {
        toast({
            title: 'Akses Ditolak',
            description: 'Email yang Anda masukkan tidak terdaftar sebagai admin.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    if (!auth) {
        toast({
            title: 'Error',
            description: 'Layanan autentikasi tidak dapat diinisialisasi.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: 'Login Berhasil',
            description: 'Mengalihkan ke dasbor admin...',
        });
        router.replace('/admin');

    } catch (error) {
        const authError = error as AuthError;

        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                toast({
                    title: 'Akun Admin Berhasil Dibuat',
                    description: 'Login berhasil, mengalihkan ke dasbor...',
                });
                router.replace('/admin');
            } catch (creationError) {
                const creationAuthError = creationError as AuthError;
                toast({
                    title: 'Pendaftaran Gagal',
                    description: `Terjadi kesalahan saat membuat akun: ${creationAuthError.message}`,
                    variant: 'destructive',
                });
            }
        } else if (authError.code === 'auth/wrong-password') {
            toast({
                title: 'Login Gagal',
                description: 'Password yang Anda masukkan salah.',
                variant: 'destructive',
            });
        } else {
            toast({
                title: 'Login Gagal',
                description: authError.message,
                variant: 'destructive',
            });
        }
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="w-full lg:grid lg:min-h-[100vh] lg:grid-cols-2 xl:min-h-[100vh]">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold font-headline">Admin Login</h1>
            <p className="text-balance text-muted-foreground">
              Login ke dasbor admin untuk mengelola website.
            </p>
          </div>
          
          <form onSubmit={handleEmailLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@desa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isUserLoading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isUserLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || isUserLoading}>
                {(isLoading || isUserLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Bukan admin?{' '}
            <a href="/dashboard" className="underline">
              Kembali ke dasbor publik
            </a>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            data-ai-hint={loginImage.imageHint}
            width="1280"
            height="1920"
            className="h-full w-full object-cover dark:brightness-[0.3] dark:grayscale"
          />
        )}
      </div>
    </div>
  );
}
