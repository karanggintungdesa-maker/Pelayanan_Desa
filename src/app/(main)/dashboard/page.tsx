
'use client';

import { useEffect, useState, cloneElement } from 'react';
import { DashboardStats } from './_components/dashboard-stats';
import { DocumentSummarizer } from './_components/document-summarizer';
import { 
  Calendar, Bell, ChevronRight, Activity, Zap, Info, 
  FileText, MessageSquare, Megaphone 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 17) setGreeting('Selamat Siang');
    else setGreeting('Selamat Malam');
  }, []);

  const quickAccessItems = [
    {
      title: 'Layanan Surat',
      icon: <FileText className="h-5 w-5" />,
      href: '/layanan-surat',
      color: 'blue' as const,
    },
    {
      title: 'Pengaduan Warga',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/pengaduan',
      color: 'green' as const,
    },
    {
      title: 'Pengumuman',
      icon: <Megaphone className="h-5 w-5" />,
      href: '/pengumuman',
      color: 'orange' as const,
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      shadow: 'shadow-blue-500/10',
      hoverShadow: 'hover:shadow-blue-500/20',
    },
    green: {
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      shadow: 'shadow-green-500/10',
      hoverShadow: 'hover:shadow-green-500/20',
    },
    orange: {
      bg: 'bg-orange-50',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      shadow: 'shadow-orange-500/10',
      hoverShadow: 'hover:shadow-orange-500/20',
    },
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header Premium Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-wider">
            <Activity className="h-3 w-3" />
            Sistem Informasi Digital
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {greeting}, Warga 👋
          </h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">Panel akses layanan mandiri Desa Karanggintung.</p>
        </div>
        
        <div className="hidden sm:flex items-center gap-3 bg-white p-2 rounded-2xl border shadow-sm">
          <div className="p-3 bg-slate-100 rounded-xl">
            <Zap className="h-5 w-5 text-slate-600" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Status Sistem</p>
            <p className="text-sm font-black text-emerald-600">AKTIF & STABIL</p>
          </div>
        </div>
      </div>

      {/* Quick Access Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quickAccessItems.map((item, index) => {
          const classes = colorClasses[item.color];
          return (
            <Link key={index} href={item.href}>
              <Card 
                className={`border-none transition-all duration-300 cursor-pointer hover:-translate-y-1 shadow-md w-full ${classes.bg} ${classes.shadow} ${classes.hoverShadow}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${classes.iconBg}`}>
                    {cloneElement(item.icon, { className: `h-5 w-5 ${classes.iconColor}` })}
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">{item.title}</h3>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 bg-accent rounded-full" />
              <h2 className="text-base font-black uppercase tracking-widest text-slate-800">
                Statistik & Transparansi
              </h2>
            </div>
            <DashboardStats />
          </section>

          <section className="bg-white rounded-3xl border shadow-[0_4px_20px_rgb(0,0,0,0.04)] p-5 sm:p-8 transition-all hover:shadow-[0_6px_25px_rgb(0,0,0,0.07)]">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Ringkasan Dokumen AI</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">Gunakan AI untuk merangkum surat resmi.</p>
              </div>
            </div>
            <DocumentSummarizer />
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-3xl border-none bg-slate-900 text-white overflow-hidden w-full">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base flex items-center gap-3">
                  <Bell className="h-5 w-5 text-accent" />
                  Info Publik
                </h3>
                <span className="text-[9px] font-black bg-accent text-slate-900 px-2 py-0.5 rounded-full uppercase">Update</span>
              </div>

              <div className="space-y-3">
                {[
                  { title: 'Layanan Mandiri', status: 'Online', color: 'bg-emerald-500' },
                  { title: 'Antrian Loket', status: 'Lancar', color: 'bg-blue-500' },
                  { title: 'Validasi NIK', status: 'Otomatis', color: 'bg-accent' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-sm text-slate-200">{item.title}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.color} animate-pulse`} />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{item.status}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/20" />
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-accent" />
                  <p className="text-xs font-black uppercase tracking-wider">Bantuan</p>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Jika mengalami kesulitan, hubungi tim teknis kami.
                </p>
                <button className="w-full py-2.5 bg-accent text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all active:scale-95">
                  Hubungi Admin
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
