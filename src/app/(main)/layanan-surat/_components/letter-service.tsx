'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { letterTypes } from '@/lib/data';
import { SktmForm } from './forms/sktm-form';
import { SkckForm } from './forms/skck-form';
import { PindahForm } from './forms/pindah-form';
import { SkuForm } from './forms/sku-form';
import { KelahiranForm } from './forms/kelahiran-form';
import { KematianForm } from './forms/kematian-form';
import { BelumMenikahForm } from './forms/belum-menikah-form';
import { DomisiliForm } from './forms/domisili-form';
import { IjinKeramaianForm } from './forms/ijin-keramaian-form';
import { MoyangForm } from './forms/moyang-form';
import { PemakamanForm } from './forms/pemakaman-form';
import { WaliForm } from './forms/wali-form';
import { ReaktivasiBpjsForm } from './forms/reaktivasi-bpjs-form';
import { PengantarUmumForm } from './forms/pengantar-umum-form';

export function LetterService() {
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderForm = () => {
    switch (selectedLetter) {
      case 'Surat Keterangan Tidak Mampu':
        return <SktmForm />;
      case 'Surat Pengantar SKCK':
        return <SkckForm />;
      case 'Surat Pengantar Pindah':
        return <PindahForm />;
      case 'Surat Keterangan Usaha':
        return <SkuForm />;
      case 'Surat Keterangan Lahir':
        return <KelahiranForm />;
      case 'Surat Keterangan Kematian':
        return <KematianForm />;
      case 'Surat Keterangan Belum Menikah':
        return <BelumMenikahForm />;
      case 'Surat Keterangan Domisili':
        return <DomisiliForm />;
      case 'Surat Ijin Keramaian':
        return <IjinKeramaianForm />;
      case 'Surat Keterangan Moyang':
        return <MoyangForm />;
      case 'Surat Keterangan Pemakaman':
        return <PemakamanForm />;
      case 'Surat Keterangan Wali':
        return <WaliForm />;
      case 'Surat Keterangan Reaktivasi BPJS Kesehatan':
        return <ReaktivasiBpjsForm />;
      case 'Surat Pengantar Umum':
        return <PengantarUmumForm />;
      default:
        return (
          <div className="text-center text-muted-foreground mt-8 py-10 border border-dashed rounded-[2rem]">
            <p className="px-6">Silakan pilih jenis surat untuk menampilkan formulir pengajuan.</p>
          </div>
        );
    }
  };

  if (!mounted) return null;

  return (
    <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 p-6 md:p-10">
        <CardTitle className="text-xl md:text-2xl font-black">Formulir Pengajuan Surat</CardTitle>
        <CardDescription className="text-sm">Pilih jenis surat yang ingin Anda ajukan dan isi formulir yang tersedia di bawah ini.</CardDescription>
      </CardHeader>
      <CardContent className="p-6 md:p-10">
        <div className="mb-8">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 block">Jenis Surat Resmi</label>
          <Select onValueChange={setSelectedLetter} value={selectedLetter}>
            <SelectTrigger className="w-full h-14 rounded-2xl border-slate-200 focus:ring-accent text-slate-900 font-bold">
              <SelectValue placeholder="Klik untuk memilih jenis surat..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl">
              {letterTypes.map((type) => (
                <SelectItem key={type} value={type} className="rounded-xl py-3 font-medium">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderForm()}
        </div>
      </CardContent>
    </Card>
  );
}
