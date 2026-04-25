
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

interface LetterServiceProps {
  isAdmin?: boolean;
}

export function LetterService({ isAdmin = false }: LetterServiceProps) {
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const renderForm = () => {
    const props = { isAdmin };
    switch (selectedLetter) {
      case 'Surat Keterangan Tidak Mampu':
        return <SktmForm {...props} />;
      case 'Surat Pengantar SKCK':
        return <SkckForm {...props} />;
      case 'Surat Pengantar Pindah':
        return <PindahForm {...props} />;
      case 'Surat Keterangan Usaha':
        return <SkuForm {...props} />;
      case 'Surat Keterangan Lahir':
        return <KelahiranForm {...props} />;
      case 'Surat Keterangan Kematian':
        return <KematianForm {...props} />;
      case 'Surat Keterangan Belum Menikah':
        return <BelumMenikahForm {...props} />;
      case 'Surat Keterangan Domisili':
        return <DomisiliForm {...props} />;
      case 'Surat Ijin Keramaian':
        return <IjinKeramaianForm {...props} />;
      case 'Surat Keterangan Moyang':
        return <MoyangForm {...props} />;
      case 'Surat Keterangan Pemakaman':
        return <PemakamanForm {...props} />;
      case 'Surat Keterangan Wali':
        return <WaliForm {...props} />;
      case 'Surat Keterangan Reaktivasi BPJS Kesehatan':
        return <ReaktivasiBpjsForm {...props} />;
      case 'Surat Pengantar Umum':
        return <PengantarUmumForm {...props} />;
      default:
        return (
          <div className="text-center text-muted-foreground mt-8 py-10 border border-dashed rounded-lg">
            <p>Silakan pilih jenis surat untuk menampilkan formulir pengajuan.</p>
          </div>
        );
    }
  };

  if (!mounted) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulir Pengajuan Surat {isAdmin ? '(Admin)' : ''}</CardTitle>
        <CardDescription>Pilih jenis surat yang ingin Anda ajukan dan isi formulir yang tersedia di bawah ini.</CardDescription>
      </CardHeader>
      <CardContent>
        <Select onValueChange={setSelectedLetter} value={selectedLetter}>
          <SelectTrigger className="w-full sm:w-[350px] mb-8">
            <SelectValue placeholder="Pilih jenis surat..." />
          </SelectTrigger>
          <SelectContent>
            {letterTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {renderForm()}
      </CardContent>
    </Card>
  );
}
