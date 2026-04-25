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
} from '@/components/ui/sidebar';

import { Logo } from '@/components/logo';
import {
  FileCheck,
  Megaphone,
  LogOut,
  Settings,
  LayoutDashboard,
  Loader2,
  MessageSquare,
  Users,
  FilePlus,
  Files,
  ChevronDown
} from 'lucide-react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const adminNavItems = [
  { href: '/admin/penduduk', icon: Users, label: 'Data Penduduk' },
  { href: '/admin/pengaduan', icon: MessageSquare, label: 'Jawab Pengaduan' },
  { href: '/admin/pengumuman', icon: Megaphone, label: 'Kelola Pengumuman' },
  { href: '/admin/settings', icon: Settings, label: 'Pengaturan' },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isSuratOpen, setIsSuratOpen] = useState(pathname.startsWith('/admin/surat'));

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Gagal logout:', error);
    }
  };

  // This useEffect is the ultimate gatekeeper.
  // It waits until loading is complete to make a decision.
  useEffect(() => {
    if (!isUserLoading) {
      // If loading is done and the user is NOT the valid admin, redirect.
      if (!user || user.email !== 'karanggintungdesa@gmail.com') {
        router.replace('/login');
      }
    }
  }, [isUserLoading, user, router]);

  const isCertainAndValid = !isUserLoading && user && user.email === 'karanggintungdesa@gmail.com';

  // If we are not yet certain that the user is a valid admin, show a loading screen.
  // This covers the `isUserLoading` case and the brief moment after loading
  // before the user object is confirmed. The useEffect above will handle redirection
  // if the final state is invalid.
  if (!isCertainAndValid) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memverifikasi akses...</p>
      </div>
    );
  }

  // Only render the children if we are certain the user is the valid admin.
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            <Collapsible
              open={isSuratOpen}
              onOpenChange={setIsSuratOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Manajemen Surat" isActive={pathname.startsWith('/admin/surat')}>
                    <Files />
                    <span>Manajemen Surat</span>
                    <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${isSuratOpen ? "rotate-180" : ""}`} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenu className="ml-6 mt-1 border-l pl-2 border-slate-200">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/surat'}>
                        <Link href="/admin/surat">
                          <FileCheck className="h-4 w-4" />
                          <span>Kelola Surat</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname === '/admin/surat/input'}>
                        <Link href="/admin/surat/input">
                          <FilePlus className="h-4 w-4" />
                          <span>Pengajuan Surat</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => router.push('/dashboard')}
                tooltip="Kembali ke Dashboard Publik"
              >
                <LayoutDashboard />
                <span>Dashboard Publik</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Logout"
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
