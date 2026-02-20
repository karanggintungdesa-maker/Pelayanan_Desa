'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, UserCheck, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { jenisKelaminOptions, tempatDilahirkanOptions, kelahiranKeOptions, penolongKelahiranOptions } from '@/lib/options';
import { SubmissionSuccess } from '../submission-success';
import { addSubmission } from '@/lib/submissions';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { getResidentByNik } from '@/lib/residents';

const FormSection = ({ title, icon: Icon, children }: { title: string; icon?: any; children: React.ReactNode }) => (
  <div className="space-y-6 rounded-md border p-4 md:p-6 bg-white shadow-sm">
    <div className="flex items-center gap-2 border-b pb-2">
      {Icon && <Icon className="h-5 w-5 text-primary" />}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const formSchema = z.object({
  // NIK Pemohon (Ibu) untuk Auto-fill awal
  motherNik: z.string().length(16, 'NIK ibu harus 16 digit.'),

  // Anak
  childName: z.string().min(1, 'Nama anak wajib diisi.'),
  childGender: z.string().min(1, 'Jenis kelamin wajib dipilih.'),
  childNik: z.string().optional(),
  childBirthPlace: z.string().min(1, 'Tempat lahir wajib diisi.'),
  childBirthDate: z.string().min(1, 'Tanggal lahir wajib diisi.'),
  childBirthTime: z.string().min(1, 'Waktu lahir wajib diisi.'),
  childBirthLocation: z.string().min(1, 'Tempat dilahirkan wajib dipilih.'),
  childAddress: z.string().min(1, 'Alamat wajib diisi.'),
  childOrder: z.string().min(1, 'Kelahiran ke- wajib dipilih.'),
  birthAssistant: z.string().min(1, 'Penolong kelahiran wajib dipilih.'),
  birthWeight: z.string().min(1, 'Berat bayi wajib diisi.'),
  birthLength: z.string().min(1, 'Panjang bayi wajib diisi.'),
  
  // Ibu
  motherName: z.string().min(1, 'Nama ibu wajib diisi.'),
  motherBirthPlace: z.string().min(1, 'Tempat lahir ibu wajib diisi.'),
  motherBirthDate: z.string().min(1, 'Tanggal lahir ibu wajib diisi.'),
  motherJob: z.string().min(1, 'Pekerjaan ibu wajib diisi.'),
  motherAddress: z.string().min(1, 'Alamat ibu wajib diisi.'),

  // Ayah
  fatherNik: z.string().length(16, 'NIK ayah harus 16 digit.'),
  fatherName: z.string().min(1, 'Nama ayah wajib diisi.'),
  fatherBirthPlace: z.string().min(1, 'Tempat lahir ayah wajib diisi.'),
  fatherBirthDate: z.string().min(1, 'Tanggal lahir ayah wajib diisi.'),
  fatherJob: z.string().min(1, 'Pekerjaan ayah wajib diisi.'),
  fatherAddress: z.string().min(1, 'Alamat ayah wajib diisi.'),

  // Pelapor
  reporterNik: z.string().length(16, 'NIK pelapor harus 16 digit.'),
  reporterName: z.string().min(1, 'Nama pelapor wajib diisi.'),
  reporterAge: z.string().min(1, 'Umur pelapor wajib diisi.'),
  reporterJob: z.string().min(1, 'Pekerjaan pelapor wajib diisi.'),
  reporterAddress: z.string().min(1, 'Alamat pelapor wajib diisi.'),

  // Saksi 1
  witness1Nik: z.string().length(16, 'NIK saksi 1 harus 16 digit.'),
  witness1Name: z.string().min(1, 'Nama saksi 1 wajib diisi.'),
  witness1Age: z.string().min(1, 'Umur saksi 1 wajib diisi.'),
  witness1Job: z.string().min(1, 'Pekerjaan saksi 1 wajib diisi.'),
  witness1Address: z.string().min(1, 'Alamat saksi 1 wajib diisi.'),

  // Saksi 2
  witness2Nik: z.string().length(16, 'NIK saksi 2 harus 16 digit.'),
  witness2Name: z.string().min(1, 'Nama saksi 2 wajib diisi.'),
  witness2Age: z.string().min(1, 'Umur saksi 2 wajib diisi.'),
  witness2Job: z.string().min(1, 'Pekerjaan saksi 2 wajib diisi.'),
  witness2Address: z.string().min(1, 'Alamat saksi 2 wajib diisi.'),

  attachmentKtpIbu: z.any().optional(),
  attachmentKkIbu: z.any().optional(),
  attachmentSuratRs: z.any().optional(),
});

export function KelahiranForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [ktpIbuFile, setKtpIbuFile] = useState<FileList | null>(null);
  const [kkIbuFile, setKkIbuFile] = useState<FileList | null>(null);
  const [suratRsFile, setSuratRsFile] = useState<FileList | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      motherNik: '',
      childName: '',
      childGender: '',
      childNik: '',
      childBirthPlace: 'Cilacap',
      childBirthDate: '',
      childBirthTime: '',
      childBirthLocation: '',
      childAddress: 'Desa Karanggintung',
      childOrder: '',
      birthAssistant: '',
      birthWeight: '',
      birthLength: '',
      motherName: '',
      motherBirthPlace: '',
      motherBirthDate: '',
      motherJob: '',
      motherAddress: '',
      fatherNik: '',
      fatherName: '',
      fatherBirthPlace: '',
      fatherBirthDate: '',
      fatherJob: '',
      fatherAddress: '',
      reporterNik: '',
      reporterName: '',
      reporterAge: '',
      reporterJob: '',
      reporterAddress: '',
      witness1Nik: '',
      witness1Name: '',
      witness1Age: '',
      witness1Job: '',
      witness1Address: '',
      witness2Nik: '',
      witness2Name: '',
      witness2Age: '',
      witness2Job: '',
      witness2Address: '',
    },
  });

  const watchMotherNik = form.watch('motherNik');
  const watchFatherNik = form.watch('fatherNik');
  const watchReporterNik = form.watch('reporterNik');
  const watchWitness1Nik = form.watch('witness1Nik');
  const watchWitness2Nik = form.watch('witness2Nik');

  const calculateAge = (birthDateStr: string) => {
    try {
      const parts = birthDateStr.split('-');
      if (parts.length !== 3) return '';
      const birthYear = parseInt(parts[2], 10);
      const currentYear = new Date().getFullYear();
      return (currentYear - birthYear).toString();
    } catch {
      return '';
    }
  };

  const handleAutoFill = async (nik: string, prefix: string) => {
    if (nik.length === 16 && firestore) {
      try {
        const resident = await getResidentByNik(firestore, nik);
        if (resident) {
          form.setValue(`${prefix}Name` as any, resident.fullName.toUpperCase());
          
          if (prefix === 'mother' || prefix === 'father') {
            form.setValue(`${prefix}BirthPlace` as any, resident.placeOfBirth);
            form.setValue(`${prefix}BirthDate` as any, resident.dateOfBirth);
          }
          
          form.setValue(`${prefix}Job` as any, resident.occupation);
          form.setValue(`${prefix}Address` as any, resident.address + (resident.rtRw ? `, RT/RW: ${resident.rtRw}` : ''));
          
          if (prefix === 'reporter' || prefix === 'witness1' || prefix === 'witness2') {
            form.setValue(`${prefix}Age` as any, calculateAge(resident.dateOfBirth));
          }

          toast({ title: `Data ${prefix === 'mother' ? 'Ibu' : prefix === 'father' ? 'Ayah' : prefix} Ditemukan` });
        }
      } catch (e) {
        console.error("Auto-fill error:", e);
      }
    }
  };

  useEffect(() => { handleAutoFill(watchMotherNik, 'mother'); }, [watchMotherNik, firestore]);
  useEffect(() => { handleAutoFill(watchFatherNik, 'father'); }, [watchFatherNik, firestore]);
  useEffect(() => { handleAutoFill(watchReporterNik, 'reporter'); }, [watchReporterNik, firestore]);
  useEffect(() => { handleAutoFill(watchWitness1Nik, 'witness1'); }, [watchWitness1Nik, firestore]);
  useEffect(() => { handleAutoFill(watchWitness2Nik, 'witness2'); }, [watchWitness2Nik, firestore]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({ title: "Gagal Mengajukan", description: "Database error.", variant: "destructive" });
      return;
    }

    const filesToUpload: { fieldName: string; file: File }[] = [];
    if (ktpIbuFile?.[0]) filesToUpload.push({ fieldName: 'KTP Ibu', file: ktpIbuFile[0] });
    if (kkIbuFile?.[0]) filesToUpload.push({ fieldName: 'KK Ibu', file: kkIbuFile[0] });
    if (suratRsFile?.[0]) filesToUpload.push({ fieldName: 'Surat Lahir RS', file: suratRsFile[0] });

    if (filesToUpload.length < 3) {
      toast({ title: 'Berkas Tidak Lengkap', description: 'Harap unggah KTP, KK, dan Surat Lahir RS.', variant: 'destructive' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const docRef = await addSubmission(firestore, user.uid, {
          requesterName: values.motherName,
          nik: values.motherNik,
          letterType: 'Surat Keterangan Lahir',
          formData: values,
          files: filesToUpload,
      });
      setTicketNumber(docRef.id);
      setIsSubmitted(true);
    } catch (error: any) {
      toast({ title: "Gagal Mengajukan", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleReset = () => {
    form.reset();
    setIsSubmitted(false);
    setTicketNumber('');
    setKtpIbuFile(null);
    setKkIbuFile(null);
    setSuratRsFile(null);
  };

  if (isSubmitted) {
    return <SubmissionSuccess ticketNumber={ticketNumber} onReset={handleReset} />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection title="Data Ibu (Pemohon)">
            <FormField
                control={form.control}
                name="motherNik"
                render={({ field }) => (
                <FormItem className="md:col-span-2">
                    <FormLabel className="font-bold">NIK Ibu</FormLabel>
                    <FormControl><Input placeholder="3301xxxxxxxxxxxx" {...field} disabled={isSubmitting} maxLength={16} /></FormControl>
                    <FormDescription>Masukkan NIK Ibu untuk pengisian otomatis data identitas.</FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField control={form.control} name="motherName" render={({ field }) => (
              <FormItem><FormLabel>Nama Ibu</FormLabel><FormControl><Input placeholder="Nama Lengkap" {...field} disabled={isSubmitting} className="uppercase" /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="motherBirthPlace" render={({ field }) => (
                    <FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input placeholder="Kota" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="motherBirthDate" render={({ field }) => (
                    <FormItem><FormLabel>Tgl Lahir</FormLabel><FormControl><Input placeholder="DD-MM-YYYY" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            <FormField control={form.control} name="motherJob" render={({ field }) => (
              <FormItem><FormLabel>Pekerjaan</FormLabel><FormControl><Input placeholder="Contoh: IRT" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="motherAddress" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Alamat Sesuai KTP</FormLabel><FormControl><Textarea placeholder="Alamat lengkap" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
            )} />
        </FormSection>

        <FormSection title="Data Anak">
          <FormField control={form.control} name="childName" render={({ field }) => (
              <FormItem><FormLabel>Nama Anak</FormLabel><FormControl><Input placeholder="Nama Lengkap Anak" {...field} disabled={isSubmitting} className="uppercase" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="childGender" render={({ field }) => (
              <FormItem><FormLabel>Jenis Kelamin</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}><FormControl><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger></FormControl><SelectContent>{jenisKelaminOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="childBirthPlace" render={({ field }) => (
              <FormItem><FormLabel>Tempat Lahir Anak</FormLabel><FormControl><Input placeholder="Cilacap" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="childBirthDate" render={({ field }) => (
              <FormItem><FormLabel>Tanggal Lahir Anak</FormLabel><FormControl><Input placeholder="DD-MM-YYYY" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="childBirthTime" render={({ field }) => (
              <FormItem><FormLabel>Waktu Lahir</FormLabel><FormControl><Input placeholder="Pukul 08.00 WIB" {...field} disabled={isSubmitting} /></FormControl><FormDescription>Format: Jam.Menit WIB (24 jam)</FormDescription><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="childBirthLocation" render={({ field }) => (
              <FormItem><FormLabel>Tempat Dilahirkan</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Lokasi" /></SelectTrigger></FormControl><SelectContent>{tempatDilahirkanOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="childOrder" render={({ field }) => (
              <FormItem><FormLabel>Kelahiran Ke-</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Urutan" /></SelectTrigger></FormControl><SelectContent>{kelahiranKeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="birthAssistant" render={({ field }) => (
              <FormItem><FormLabel>Penolong Kelahiran</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Penolong" /></SelectTrigger></FormControl><SelectContent>{penolongKelahiranOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="birthWeight" render={({ field }) => (
                <FormItem><FormLabel>Berat Bayi</FormLabel><FormControl><Input placeholder="Contoh: 3,5 kg" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="birthLength" render={({ field }) => (
                <FormItem><FormLabel>Panjang Bayi</FormLabel><FormControl><Input placeholder="Contoh: 49 cm" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
          <FormField control={form.control} name="childAddress" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Alamat Domisili Anak</FormLabel><FormControl><Textarea placeholder="Alamat lengkap" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
        </FormSection>

        <FormSection title="Data Ayah">
          <FormField control={form.control} name="fatherNik" render={({ field }) => (
              <FormItem><FormLabel className="font-bold">NIK Ayah</FormLabel><FormControl><Input placeholder="3301xxxxxxxxxxxx" {...field} disabled={isSubmitting} maxLength={16} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="fatherName" render={({ field }) => (
              <FormItem><FormLabel>Nama Ayah</FormLabel><FormControl><Input placeholder="Nama Lengkap" {...field} disabled={isSubmitting} className="uppercase" /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="fatherBirthPlace" render={({ field }) => (
                <FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input placeholder="Kota" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="fatherBirthDate" render={({ field }) => (
                <FormItem><FormLabel>Tanggal Lahir</FormLabel><FormControl><Input placeholder="DD-MM-YYYY" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
           <FormField control={form.control} name="fatherJob" render={({ field }) => (
              <FormItem><FormLabel>Pekerjaan</FormLabel><FormControl><Input placeholder="Contoh: Wiraswasta" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
           <FormField control={form.control} name="fatherAddress" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Alamat Sesuai KTP</FormLabel><FormControl><Textarea placeholder="Alamat lengkap" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
        </FormSection>

        <FormSection title="Pelapor" icon={UserCheck}>
          <FormField control={form.control} name="reporterNik" render={({ field }) => (
              <FormItem><FormLabel className="font-bold">NIK Pelapor</FormLabel><FormControl><Input placeholder="3301xxxxxxxxxxxx" {...field} disabled={isSubmitting} maxLength={16} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="reporterName" render={({ field }) => (
              <FormItem><FormLabel>Nama Pelapor</FormLabel><FormControl><Input placeholder="Nama Lengkap" {...field} disabled={isSubmitting} className="uppercase" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="reporterAge" render={({ field }) => (
              <FormItem><FormLabel>Umur</FormLabel><FormControl><Input placeholder="Contoh: 30" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="reporterJob" render={({ field }) => (
              <FormItem><FormLabel>Pekerjaan</FormLabel><FormControl><Input placeholder="Pekerjaan" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="reporterAddress" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Alamat</FormLabel><FormControl><Textarea placeholder="Alamat lengkap" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
        </FormSection>

        <FormSection title="Saksi 1" icon={Users}>
          <FormField control={form.control} name="witness1Nik" render={({ field }) => (
              <FormItem><FormLabel className="font-bold">NIK Saksi 1</FormLabel><FormControl><Input placeholder="3301xxxxxxxxxxxx" {...field} disabled={isSubmitting} maxLength={16} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="witness1Name" render={({ field }) => (
              <FormItem><FormLabel>Nama Saksi 1</FormLabel><FormControl><Input placeholder="Nama Lengkap" {...field} disabled={isSubmitting} className="uppercase" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="witness1Age" render={({ field }) => (
              <FormItem><FormLabel>Umur</FormLabel><FormControl><Input placeholder="Contoh: 45" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="witness1Job" render={({ field }) => (
              <FormItem><FormLabel>Pekerjaan</FormLabel><FormControl><Input placeholder="Pekerjaan" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="witness1Address" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Alamat</FormLabel><FormControl><Textarea placeholder="Alamat lengkap" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
        </FormSection>

        <FormSection title="Saksi 2" icon={Users}>
          <FormField control={form.control} name="witness2Nik" render={({ field }) => (
              <FormItem><FormLabel className="font-bold">NIK Saksi 2</FormLabel><FormControl><Input placeholder="3301xxxxxxxxxxxx" {...field} disabled={isSubmitting} maxLength={16} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="witness2Name" render={({ field }) => (
              <FormItem><FormLabel>Nama Saksi 2</FormLabel><FormControl><Input placeholder="Nama Lengkap" {...field} disabled={isSubmitting} className="uppercase" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="witness2Age" render={({ field }) => (
              <FormItem><FormLabel>Umur</FormLabel><FormControl><Input placeholder="Contoh: 50" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="witness2Job" render={({ field }) => (
              <FormItem><FormLabel>Pekerjaan</FormLabel><FormControl><Input placeholder="Pekerjaan" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="witness2Address" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Alamat</FormLabel><FormControl><Textarea placeholder="Alamat lengkap" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
          )} />
        </FormSection>

        <FormSection title="Unggah Berkas">
            <FormField control={form.control} name="attachmentKtpIbu" render={({ field }) => (
                <FormItem><FormLabel>Scan/Foto KTP Ibu</FormLabel><FormControl><Input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setKtpIbuFile(e.target.files)} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="attachmentKkIbu" render={({ field }) => (
                <FormItem><FormLabel>Scan/Foto Kartu Keluarga</FormLabel><FormControl><Input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setKkIbuFile(e.target.files)} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="attachmentSuratRs" render={({ field }) => (
                <FormItem><FormLabel>Surat Kelahiran dari RS/Bidan</FormLabel><FormControl><Input type="file" accept="image/jpeg,image/png,application/pdf" onChange={(e) => setSuratRsFile(e.target.files)} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>
            )} />
        </FormSection>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto px-12">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Mengajukan...' : 'Ajukan Surat'}
        </Button>
      </form>
    </Form>
  );
}
