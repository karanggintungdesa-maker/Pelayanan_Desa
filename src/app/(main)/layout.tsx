'use client';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  MessageSquareWarning,
  Megaphone,
  LogIn,
  Loader2,
  HelpCircle,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Home,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { getCitizenProfile } from '@/lib/citizens';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard Utama' },
  { href: '/layanan-surat', icon: FileText, label: 'Layanan Surat' },
  { href: '/pengaduan', icon: MessageSquareWarning, label: 'Pengaduan Warga' },
  { href: '/pengumuman', icon: Megaphone, label: 'Pengumuman' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { firestore, user, isUserLoading } = useFirebase();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (user?.email === 'karanggintungdesa@gmail.com') {
        setIsVerifying(false);
        return;
      }

      if (!isUserLoading && user && firestore) {
        try {
          const profile = await getCitizenProfile(firestore, user.uid);
          if (!profile) {
            router.replace('/portal');
          } else {
            setIsVerifying(false);
          }
        } catch (e) {
          console.error("Profile check error:", e);
          setIsVerifying(false);
        }
      } else if (!isUserLoading && !user) {
        setIsVerifying(false);
      }
    };

    checkProfile();
  }, [user, isUserLoading, firestore, router]);

  if (isVerifying && !isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-accent mb-4" />
          <p className="text-xs font-black tracking-[0.3em] text-slate-400 uppercase">Mengautentikasi Sesi...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-slate-800 bg-slate-950">
        <SidebarHeader className="p-8">
          <Logo />
        </SidebarHeader>
        <SidebarContent className="px-6 scrollbar-hide">
          <div className="mb-6 px-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Navigasi Portal</p>
          </div>
          <SidebarMenu className="gap-3">
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Halaman Depan" className="rounded-2xl h-12 transition-all">
                <Link href="/" className="flex items-center gap-3">
                  <Home className="text-slate-500" />
                  <span className="font-bold">Beranda Publik</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton 
                  asChild 
                  isActive={pathname === item.href} 
                  tooltip={item.label}
                  className="rounded-2xl h-12 transition-all data-[active=true]:bg-accent data-[active=true]:text-slate-900"
                >
                  <Link href={item.href} className="flex items-center gap-3">
                    <item.icon className={pathname === item.href ? 'text-slate-900' : 'text-slate-500'} />
                    <span className="font-bold">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <div className="mt-12 mb-6 px-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Dukungan</p>
          </div>
          <SidebarMenu>
             <SidebarMenuItem>
                <SidebarMenuButton className="rounded-2xl h-12 hover:bg-white/5">
                  <HelpCircle className="text-slate-500" />
                  <span className="font-bold">Pusat Bantuan</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-8">
          <div className="bg-white/5 rounded-3xl p-4 border border-white/10 space-y-4">
            <p className="text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest leading-relaxed">
              Administrasi Resmi Desa Karanggintung
            </p>
            <SidebarMenuItem className="list-none">
                <SidebarMenuButton 
                  onClick={() => router.push('/login')} 
                  className="w-full justify-center bg-accent text-slate-900 rounded-2xl hover:bg-yellow-600 transition-all font-black"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  <span>LOGIN ADMIN</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="bg-slate-50 flex flex-col min-h-screen">
        {/* MOBILE TOP BAR - Fixed for HP */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-950 text-white sticky top-0 z-40 border-b border-white/5">
          <div className="scale-75 origin-left">
            <Logo />
          </div>
          <SidebarTrigger>
            <Button variant="ghost" size="icon" className="text-accent hover:bg-white/5">
              <Menu className="h-6 w-6" />
            </Button>
          </SidebarTrigger>
        </header>

        <main className="max-w-[1400px] mx-auto w-full p-4 md:p-12 flex-1">
          {children}
        </main>

        {/* PREMIUM FOOTER */}
        <footer className="bg-slate-950 text-slate-400 py-16 border-t border-white/5 w-full">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              <div className="space-y-6">
                <Logo />
                <div className="space-y-1">
                  <p className="text-white font-bold text-sm">Pemerintah Desa Karanggintung</p>
                  <p className="text-xs">Kecamatan Gandrungmangu, Cilacap</p>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Kontak Resmi</h4>
                <ul className="space-y-3 text-xs">
                  <li className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>Jl Pelita Km 02, Desa Karanggintung</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-accent" />
                    <span>0852 1800 0668</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-accent" />
                    <span>karanggintungdesa@gmail.com</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Layanan Digital</h4>
                <ul className="space-y-3 text-xs">
                  <li><Link href="/layanan-surat" className="hover:text-accent transition-colors">Pengajuan Surat Online</Link></li>
                  <li><Link href="/pengaduan" className="hover:text-accent transition-colors">Sistem Pengaduan Warga</Link></li>
                  <li><Link href="/pengumuman" className="hover:text-accent transition-colors">Informasi & Berita</Link></li>
                </ul>
              </div>

              <div className="space-y-6">
                <h4 className="text-white font-black uppercase tracking-widest text-[10px]">Media Sosial</h4>
                <div className="flex gap-3">
                  <Link href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:text-accent transition-all">
                    <Facebook className="h-4 w-4" />
                  </Link>
                  <Link href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-slate-900 transition-all">
                    <Instagram className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-white/5 text-center md:text-left text-[10px] font-bold uppercase tracking-widest flex flex-col md:flex-row justify-between gap-4">
              <p>© 2026 Pemerintah Desa Karanggintung</p>
              <p className="text-accent">Website Resmi Pemerintahan Desa</p>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
