'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  agamaOptions,
  jenisKelaminOptions,
  pekerjaanOptions,
  statusKawinOptions,
} from '@/lib/options';
import { useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Resident } from '@/lib/types';

const shdkOptions = ['KEPALA KELUARGA', 'ISTRI', 'ANAK', 'MERTUA', 'ORANG TUA', 'CUCU', 'FAMILI LAIN'];
const pendidikanOptions = [
  'Tidak/Belum Sekolah',
  'Tamat SD / Sederajat',
  'SLTP / Sederajat',
  'SLTA / Sederajat',
  'Diploma I / II',
  'Akademi / Diploma III / S. Muda',
  'Diploma IV / Strata I',
  'Strata II',
  'Strata III',
];

const formSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit.'),
  fullName: z.string().min(1, 'Nama lengkap wajib diisi.'),
  gender: z.string().min(1, 'Jenis kelamin wajib dipilih.'),
  placeOfBirth: z.string().min(1, 'Tempat lahir wajib diisi.'),
  dateOfBirth: z.string().min(1, 'Tanggal lahir wajib diisi.'),
  address: z.string().min(1, 'Alamat wajib diisi.'),
  rtRw: z.string().min(1, 'RT/RW wajib diisi.'),
  relationshipToHeadOfFamily: z.string().min(1, 'SHDK wajib dipilih.'),
  religion: z.string().min(1, 'Agama wajib dipilih.'),
  occupation: z.string().min(1, 'Pekerjaan wajib dipilih.'),
  maritalStatus: z.string().min(1, 'Status perkawinan wajib dipilih.'),
  educationLevel: z.string().min(1, 'Pendidikan wajib dipilih.'),
});

interface ResidentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident?: Resident | null;
}

export function ResidentForm({ open, onOpenChange, resident }: ResidentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nik: '',
      fullName: '',
      gender: '',
      placeOfBirth: '',
      dateOfBirth: '',
      address: '',
      rtRw: '',
      relationshipToHeadOfFamily: '',
      religion: '',
      occupation: '',
      maritalStatus: '',
      educationLevel: '',
    },
  });

  useEffect(() => {
    if (resident) {
      form.reset({
        nik: resident.nik,
        fullName: resident.fullName,
        gender: resident.gender,
        placeOfBirth: resident.placeOfBirth,
        dateOfBirth: resident.dateOfBirth,
        address: resident.address,
        rtRw: resident.rtRw || '',
        relationshipToHeadOfFamily: resident.relationshipToHeadOfFamily || '',
        religion: resident.religion,
        occupation: resident.occupation,
        maritalStatus: resident.maritalStatus,
        educationLevel: resident.educationLevel,
      });
    } else {
      form.reset({
        nik: '',
        fullName: '',
        gender: '',
        placeOfBirth: '',
        dateOfBirth: '',
        address: 'Desa Karanggintung',
        rtRw: '',
        relationshipToHeadOfFamily: '',
        religion: '',
        occupation: '',
        maritalStatus: '',
        educationLevel: '',
      });
    }
  }, [resident, form, open]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      // PENTING: Gunakan NIK sebagai ID Dokumen agar O(1) lookup
      const docRef = doc(firestore, 'residents', values.nik);
      
      await setDoc(docRef, {
        ...values,
        fullName: values.fullName.toUpperCase(),
        updatedAt: serverTimestamp(),
        ...(resident ? {} : { createdAt: serverTimestamp() })
      }, { merge: true });

      toast({ title: resident ? "Data Diperbarui" : "Data Ditambahkan" });
      onOpenChange(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>{resident ? 'Edit Data Penduduk' : 'Tambah Penduduk Baru'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="nik" render={({ field }) => (
                <FormItem><FormLabel>NIK</FormLabel><FormControl><Input {...field} disabled={!!resident} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input className="uppercase" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              {/* Sisa field formulir tetap sama... */}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 animate-spin h-4 w-4" />} Simpan</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
