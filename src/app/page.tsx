'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ArrowRight, ShieldCheck, Zap, Users, FileCheck, Phone, Mail, MapPin, Facebook, Instagram, MessageSquareWarning } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* HEADER / NAVIGATION */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/layanan-surat" className="text-sm font-bold text-slate-600 hover:text-primary">Layanan</Link>
            <Link href="/pengumuman" className="text-sm font-bold text-slate-600 hover:text-primary">Pengumuman</Link>
            <Link href="/login">
              <Button variant="outline" className="border-primary text-primary font-bold">Login Admin</Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-primary hover:bg-slate-800 text-white font-bold px-6">Masuk Portal</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative h-[80vh] flex items-center overflow-hidden">
        <Image 
          src="https://images.unsplash.com/photo-1602989106211-81de671c23a9?q=80&w=2000"
          alt="Desa Karanggintung"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="container mx-auto px-4 relative z-10 text-white">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 text-accent backdrop-blur-sm">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-widest">Transformasi Digital Desa</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
              Selamat Datang di Portal Resmi <span className="text-accent italic font-serif">Karanggintung</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl font-medium leading-relaxed">
              Mewujudkan tata kelola pemerintahan desa yang modern, transparan, dan melayani sepenuh hati melalui inovasi digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/layanan-surat">
                <Button size="lg" className="bg-accent hover:bg-yellow-600 text-slate-900 font-black h-14 px-10 text-lg rounded-2xl gold-glow transition-all active:scale-95">
                  Mulai Layanan Mandiri
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pengaduan">
                <Button size="lg" variant="outline" className="border-white/30 text-slate-900 bg-white hover:bg-slate-100 font-bold h-14 px-10 text-lg rounded-2xl transition-all">
                  <MessageSquareWarning className="mr-2 h-5 w-5" />
                  Sistem Pengaduan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VISI MISI SECTION */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="w-12 h-1 bg-accent mx-auto rounded-full" />
            <h2 className="text-sm font-black text-accent uppercase tracking-[0.3em]">Komitmen Kami</h2>
            <blockquote className="text-3xl md:text-4xl font-serif italic text-slate-800 leading-relaxed">
              "Desa Karanggintung berkomitmen memberikan pelayanan publik berbasis digital yang cepat, transparan, dan akuntabel untuk seluruh masyarakat."
            </blockquote>
            <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Pemerintah Desa Karanggintung</p>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { label: 'Total Penduduk', value: '4.852+', icon: Users, color: 'text-blue-600' },
              { label: 'Surat Terproses', value: '1.200+', icon: FileCheck, color: 'text-accent' },
              { label: 'Transparansi', value: '100%', icon: ShieldCheck, color: 'text-emerald-600' },
              { label: 'Kecepatan', value: '24/7', icon: Zap, color: 'text-amber-500' },
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-4 group">
                <div className={`mx-auto w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-white`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-20 mt-auto border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Column 1 */}
            <div className="space-y-6">
              <div className="bg-white/10 p-3 rounded-2xl inline-block">
                <Logo />
              </div>
              <div className="space-y-2">
                <p className="text-white font-black text-lg">Pemerintah Desa Karanggintung</p>
                <p className="text-sm">Kecamatan Gandrungmangu, Kabupaten Cilacap</p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Kontak Resmi</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-accent shrink-0" />
                  <span>Jl Pelita Km 02, Desa Karanggintung, Kec. Gandrungmangu, Cilacap</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-accent shrink-0" />
                  <span>0852 1800 0668</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-accent shrink-0" />
                  <span>karanggintungdesa@gmail.com</span>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Jam Pelayanan</h4>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <p className="text-white font-bold text-sm">Senin - Jumat</p>
                  <p className="text-xs mt-1 opacity-80">08.00 - 16.00 WIB</p>
                </div>
                <p className="text-[10px] italic">Sabtu, Minggu & Tanggal Merah Libur</p>
              </div>
            </div>

            {/* Column 4 */}
            <div className="space-y-6">
              <h4 className="text-white font-bold uppercase tracking-widest text-xs">Media Sosial</h4>
              <div className="flex gap-4">
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-slate-900 transition-all">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-slate-900 transition-all">
                  <Instagram className="h-5 w-5" />
                </Link>
              </div>
              <p className="text-xs leading-relaxed">
                Ikuti perkembangan informasi terbaru melalui kanal media sosial resmi kami.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
            <p>© 2026 Pemerintah Desa Karanggintung</p>
            <p>Website Resmi Pemerintahan Desa • Transformasi Digital</p>
          </div>
        </div>
      </footer>
    </div>
  );
}