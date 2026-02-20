'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Upload } from 'lucide-react';

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
import { agamaOptions, jenisKelaminOptions, kewarganegaraanOptions, skckPurposeOptions } from '@/lib/options';
import { SubmissionSuccess } from '../submission-success';
import { addSubmission } from '@/lib/submissions';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { getResidentByNik } from '@/lib/residents';

const formSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit.'),
  purpose: z.string().min(1, 'Keperluan wajib dipilih.'),
  name: z.string().min(1, 'Nama lengkap wajib diisi.'),
  gender: z.string().min(1, 'Jenis kelamin wajib dipilih.'),
  birthPlace: z.string().min(1, 'Tempat lahir wajib diisi.'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi.'),
  nationality: z.string().min(1, 'Kewarganegaraan wajib dipilih.'),
  religion: z.string().min(1, 'Agama wajib dipilih.'),
  job: z.string().min(1, 'Pekerjaan wajib diisi.'),
  address: z.string().min(1, 'Alamat wajib diisi.'),
  attachmentKtp: z.any().optional(),
});

export function SkckForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [ktpFile, setKtpFile] = useState<FileList | null>(null);
  
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nik: '',
      purpose: '',
      name: '',
      gender: '',
      birthPlace: '',
      birthDate: '',
      nationality: 'WNI',
      religion: '',
      job: '',
      address: '',
    },
  });

  const nikValue = form.watch('nik');

  useEffect(() => {
    const fetchResident = async () => {
      if (nikValue?.length === 16 && firestore) {
        setIsSearching(true);
        try {
          const res = await getResidentByNik(firestore, nikValue);
          if (res) {
            form.setValue('name', res.fullName.toUpperCase());
            form.setValue('gender', res.gender);
            form.setValue('birthPlace', res.placeOfBirth);
            form.setValue('birthDate', res.dateOfBirth);
            form.setValue('religion', res.religion);
            form.setValue('job', res.occupation);
            form.setValue('address', res.address + (res.rtRw ? `, RT/RW: ${res.rtRw}` : ''));
            toast({ title: "Data Berhasil Dimuat" });
          } else {
            toast({ title: "NIK Tidak Terdaftar", variant: "destructive" });
          }
        } catch (error: any) {
          toast({ title: "Kuota Habis / Gangguan", description: error.message, variant: "destructive" });
        } finally {
          setIsSearching(false);
        }
      }
    };
    fetchResident();
  }, [nikValue, firestore, form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({ title: "Gagal Mengajukan", description: "Layanan database tidak tersedia.", variant: "destructive" });
      return;
    }

    const filesToUpload: { fieldName: string; file: File }[] = [];
    if (ktpFile?.[0]) {
      filesToUpload.push({ fieldName: 'KTP Pemohon', file: ktpFile[0] });
    } else {
      toast({
        title: 'Berkas Tidak Lengkap',
        description: 'Harap unggah file scan/foto KTP Anda.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const docRef = await addSubmission(firestore, user.uid, {
        requesterName: values.name,
        nik: values.nik,
        letterType: 'Surat Pengantar SKCK',
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
    setKtpFile(null);
  };

  if (isSubmitted) return <SubmissionSuccess ticketNumber={ticketNumber} onReset={handleReset} />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nik"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-bold text-primary">NIK Pemohon (16 Digit)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Masukkan NIK untuk mengisi otomatis..." {...field} disabled={isSubmitting} maxLength={16} />
                  {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keperluan SKCK</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <FormControl><SelectTrigger><SelectValue placeholder="Pilih Keperluan" /></SelectTrigger></FormControl>
                <SelectContent>{skckPurposeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-3xl border shadow-sm">
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input className="uppercase" {...field} disabled={isSubmitting} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="gender" render={({ field }) => (
            <FormItem><FormLabel>Jenis Kelamin</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}><FormControl><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger></FormControl><SelectContent>{jenisKelaminOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></FormItem>
          )} />
          <FormField control={form.control} name="birthPlace" render={({ field }) => (<FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input {...field} disabled={isSubmitting} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="birthDate" render={({ field }) => (<FormItem><FormLabel>Tanggal Lahir</FormLabel><FormControl><Input placeholder="DD-MM-YYYY" {...field} disabled={isSubmitting} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="religion" render={({ field }) => (
            <FormItem><FormLabel>Agama</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}><FormControl><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger></FormControl><SelectContent>{agamaOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select></FormItem>
          )} />
          <FormField control={form.control} name="job" render={({ field }) => (<FormItem><FormLabel>Pekerjaan</FormLabel><FormControl><Input {...field} disabled={isSubmitting} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="address" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Alamat Sesuai KTP</FormLabel><FormControl><Textarea {...field} disabled={isSubmitting} /></FormControl></FormItem>)} />
        </div>

        {/* BAGIAN UNGGUH BERKAS */}
        <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Unggah Dokumen Lampiran
          </h3>
          <FormField
            control={form.control}
            name="attachmentKtp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold">Scan / Foto KTP Asli</FormLabel>
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/jpeg,image/png,application/pdf" 
                    onChange={(e) => setKtpFile(e.target.files)} 
                    disabled={isSubmitting}
                    className="bg-white"
                  />
                </FormControl>
                <FormDescription>Format file: JPG, PNG, atau PDF. Maksimal 2MB.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-primary hover:bg-slate-800 font-black uppercase tracking-widest text-xs">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Memproses Pengajuan...
            </>
          ) : 'Ajukan Pengantar SKCK'}
        </Button>
      </form>
    </Form>
  );
}
