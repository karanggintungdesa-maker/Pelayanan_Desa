'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2, Store, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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

const FormSection = ({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) => (
  <div className="space-y-6 rounded-md border p-4 md:p-6 bg-white shadow-sm">
    <div className="flex items-center gap-2 border-b pb-2">
      <Icon className="h-5 w-5 text-primary" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const formSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit.'),
  purpose: z.string().min(1, 'Keperluan wajib diisi.'),
  name: z.string().min(1, 'Nama wajib diisi.'),
  birthPlace: z.string().min(1, 'Tempat lahir wajib diisi.'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi.'),
  gender: z.string().min(1, 'Jenis kelamin wajib dipilih.'),
  address: z.string().min(1, 'Alamat wajib diisi.'),
  job: z.string().min(1, 'Pekerjaan wajib diisi.'),
  businessName: z.string().min(1, 'Nama usaha wajib diisi.'),
  businessType: z.string().min(1, 'Jenis usaha wajib diisi.'),
  businessAddress: z.string().min(1, 'Alamat usaha wajib diisi.'),
  businessSince: z.string().min(1, 'Tahun berdiri wajib diisi.'),
});

export function SkuForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nik: '', purpose: '', name: '', birthPlace: '', birthDate: '', gender: '', address: '', job: '', businessName: '', businessType: '', businessAddress: '', businessSince: '',
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
            toast({ title: "Data Pemohon Ditemukan" });
          }
        } finally { setIsSearching(false); }
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
        letterType: 'Surat Keterangan Usaha',
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
        <FormSection title="Data Pemohon" icon={User}>
          <FormField control={form.control} name="nik" render={({ field }) => (
            <FormItem className="md:col-span-2"><FormLabel className="font-bold text-primary">NIK Pemohon</FormLabel><FormControl><div className="relative"><Input placeholder="3301xxxxxxxxxxxx" {...field} maxLength={16} />{isSearching && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />}</div></FormControl></FormItem>
          )} />
          <FormField control={form.control} name="purpose" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Keperluan Pengajuan</FormLabel><FormControl><Input placeholder="Contoh: Pengajuan KUR" {...field} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input className="uppercase" {...field} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="job" render={({ field }) => (<FormItem><FormLabel>Pekerjaan</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="address" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Alamat Lengkap</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
        </FormSection>

        <FormSection title="Data Usaha" icon={Store}>
          <FormField control={form.control} name="businessName" render={({ field }) => (<FormItem><FormLabel>Nama Usaha</FormLabel><FormControl><Input className="uppercase" {...field} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="businessType" render={({ field }) => (<FormItem><FormLabel>Jenis Usaha</FormLabel><FormControl><Input placeholder="Contoh: Perdagangan" {...field} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="businessAddress" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Alamat Usaha</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>)} />
          <FormField control={form.control} name="businessSince" render={({ field }) => (<FormItem><FormLabel>Berdiri Sejak Tahun</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>)} />
        </FormSection>

        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">Ajukan Surat Keterangan Usaha</Button>
      </form>
    </Form>
  );
}
