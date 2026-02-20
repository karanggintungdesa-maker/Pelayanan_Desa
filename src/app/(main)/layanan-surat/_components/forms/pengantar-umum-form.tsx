'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, User } from 'lucide-react';

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
import { jenisKelaminOptions } from '@/lib/options';
import { SubmissionSuccess } from '../submission-success';
import { addSubmission } from '@/lib/submissions';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { getResidentByNik } from '@/lib/residents';

const formSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit.'),
  name: z.string().min(1, 'Nama lengkap wajib diisi.'),
  gender: z.string().min(1, 'Jenis kelamin wajib dipilih.'),
  birthPlace: z.string().min(1, 'Tempat lahir wajib diisi.'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi.'),
  job: z.string().min(1, 'Pekerjaan wajib diisi.'),
  purpose: z.string().min(1, 'Keperluan wajib diisi.'),
  address: z.string().min(1, 'Alamat wajib diisi.'),
});

export function PengantarUmumForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nik: '',
      name: '',
      gender: '',
      birthPlace: '',
      birthDate: '',
      job: '',
      purpose: '',
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
            form.setValue('job', res.occupation);
            form.setValue('address', res.address + (res.rtRw ? `, RT/RW: ${res.rtRw}` : ''));
            toast({ title: "Data Ditemukan" });
          }
        } finally {
          setIsSearching(false);
        }
      }
    };
    fetchResident();
  }, [nikValue, firestore, form, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) return;
    setIsSubmitting(true);
    try {
      const docRef = await addSubmission(firestore, user.uid, {
        requesterName: values.name,
        nik: values.nik,
        letterType: 'Surat Pengantar Umum',
        formData: values,
      });
      setTicketNumber(docRef.id);
      setIsSubmitted(true);
    } catch (error: any) {
      toast({ title: "Gagal Mengajukan", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) return <SubmissionSuccess ticketNumber={ticketNumber} onReset={() => setIsSubmitted(false)} />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6 rounded-md border p-4 md:p-6 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b pb-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Data Identitas Pemohon</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nik"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="font-bold text-primary">NIK (16 Digit)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="3301xxxxxxxxxxxx" {...field} disabled={isSubmitting} maxLength={16} />
                      {isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />}
                    </div>
                  </FormControl>
                  <FormDescription>Gunakan NIK untuk memuat data otomatis.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input className="uppercase" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="gender" render={({ field }) => (
              <FormItem><FormLabel>Jenis Kelamin</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger></FormControl><SelectContent>{jenisKelaminOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="birthPlace" render={({ field }) => (
                <FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="birthDate" render={({ field }) => (
                <FormItem><FormLabel>Tgl Lahir</FormLabel><FormControl><Input placeholder="DD-MM-YYYY" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="job" render={({ field }) => (
              <FormItem><FormLabel>Pekerjaan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="purpose" render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel className="font-bold text-primary">Keperluan Surat</FormLabel>
                <FormControl><Input placeholder="Contoh: Pengurusan Jamsostek / Persyaratan Kerja" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem className="md:col-span-2"><FormLabel>Alamat Lengkap Sesuai KTP</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
            )} />
          </div>
        </div>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Ajukan Surat Pengantar Umum'}
        </Button>
      </form>
    </Form>
  );
}
