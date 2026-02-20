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
} from 'lucide-react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useEffect } from 'react';

const adminNavItems = [
  { href: '/admin/surat', icon: FileCheck, label: 'Kelola Surat' },
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Gagal logout:', error);
    }
  };

  useEffect(() => {
    if (
      !isUserLoading &&
      (!user || user.email !== 'karanggintungdesa@gmail.com')
    ) {
      router.replace('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user || user.email !== 'karanggintungdesa@gmail.com') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Memverifikasi akses...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
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
