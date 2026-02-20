'use client';

import { useEffect, useState } from 'react';
import { DashboardStats } from './_components/dashboard-stats';
import { DocumentSummarizer } from './_components/document-summarizer';
import { 
  Calendar, 
  Bell, 
  ChevronRight, 
  Activity, 
  Zap, 
  Info, 
  FileText, 
  MessageSquareWarning, 
  Megaphone,
  UserCircle,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const quickLinks = [
  { href: '/layanan-surat', icon: FileText, label: 'Layanan Surat', desc: 'Ajukan surat resmi online', color: 'bg-blue-600' },
  { href: '/pengaduan', icon: MessageSquareWarning, label: 'Pengaduan', desc: 'Sampaikan aspirasi warga', color: 'bg-amber-600' },
  { href: '/pengumuman', icon: Megaphone, label: 'Info Terbaru', desc: 'Berita & pengumuman desa', color: 'bg-emerald-600' },
  { href: '/portal', icon: UserCircle, label: 'Data Kontak', desc: 'Perbarui nomor WhatsApp', color: 'bg-indigo-600' },
];

export default function DashboardPage() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Selamat Pagi');
    else if (hour < 17) setGreeting('Selamat Siang');
    else setGreeting('Selamat Malam');
  }, []);

  return (
    <div className="space-y-8 md:space-y-12 pb-16">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-[0.3em]">
            <Activity className="h-3 w-3" />
            Sistem Informasi Digital
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900">
            {greeting}, Warga 👋
          </h1>
          <p className="text-slate-500 font-medium text-sm md:text-base">Panel akses layanan mandiri Desa Karanggintung.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border shadow-sm self-start md:self-auto">
          <div className="p-3 bg-slate-100 rounded-xl">
            <Zap className="h-5 w-5 text-slate-600" />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Status Sistem</p>
            <p className="text-sm font-black text-emerald-600">AKTIF & STABIL</p>
          </div>
        </div>
      </div>

      {/* NAVIGASI PORTAL - GRID 2x2 FOR MOBILE */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-accent rounded-full" />
          <h2 className="text-lg font-black uppercase tracking-widest text-slate-800">
            Navigasi Portal
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {quickLinks.map((link, i) => (
            <Link key={i} href={link.href} className="group">
              <Card className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 bg-white h-full flex flex-col">
                <CardContent className="p-6 md:p-10 flex flex-col h-full items-center text-center">
                  <div className={cn(
                    "w-16 h-16 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center text-white mb-6 md:mb-8 shadow-2xl transition-transform duration-500 group-hover:rotate-[10deg] group-hover:scale-110",
                    link.color
                  )}>
                    <link.icon className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-black text-slate-900 mb-2 md:mb-3 leading-tight">
                    {link.label}
                  </h3>
                  <p className="text-[10px] md:text-sm text-slate-400 font-medium leading-relaxed mb-6 md:mb-8 flex-1">
                    {link.desc}
                  </p>
                  <div className="flex items-center gap-2 text-accent text-[10px] md:text-xs font-black uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                    Buka <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              <h2 className="text-lg font-black uppercase tracking-widest text-slate-800">
                Statistik & Transparansi
              </h2>
            </div>
            <DashboardStats />
          </section>

          <section className="bg-white rounded-[2.5rem] border shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">Ringkasan Dokumen AI</h2>
                <p className="text-xs md:text-sm text-slate-500 font-medium italic">Gunakan kecerdasan buatan untuk merangkum surat resmi.</p>
              </div>
            </div>
            <DocumentSummarizer />
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] border-none bg-slate-900 text-white overflow-hidden shadow-2xl">
            <CardContent className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg flex items-center gap-3">
                  <Bell className="h-5 w-5 text-accent" />
                  Info Publik
                </h3>
                <span className="text-[10px] font-black bg-accent text-slate-900 px-3 py-1 rounded-full uppercase">Update</span>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Layanan Mandiri', status: 'Online', color: 'bg-emerald-500' },
                  { title: 'Antrian Loket', status: 'Lancar', color: 'bg-blue-500' },
                  { title: 'Validasi NIK', status: 'Otomatis', color: 'bg-accent' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-sm text-slate-200">{item.title}</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.color} animate-pulse`} />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.status}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/20" />
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-accent" />
                  <p className="text-sm font-black uppercase tracking-widest">Bantuan</p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Jika mengalami kesulitan dalam pengajuan surat, silakan hubungi tim teknis kami melalui WhatsApp.
                </p>
                <button className="w-full py-4 bg-accent text-slate-900 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-yellow-600 transition-all active:scale-95">
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

import { cn } from '@/lib/utils';
