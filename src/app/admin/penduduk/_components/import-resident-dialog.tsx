'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, CheckCircle2, Save, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ImportResidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportResidentDialog({ open, onOpenChange }: ImportResidentDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [importCount, setImportCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setImportCount(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({ title: "Peringatan", description: "Silakan pilih file terlebih dahulu.", variant: "destructive" });
      return;
    }

    if (!firestore) {
        toast({ title: "Database Error", description: "Koneksi database belum siap.", variant: "destructive" });
        return;
    }

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as any[];

        if (json.length === 0) throw new Error("File Excel kosong.");

        const findValue = (row: any, aliases: string[]) => {
            const keys = Object.keys(row);
            const match = keys.find(k => 
                aliases.some(alias => k.toLowerCase().trim().replace(/[\W_]+/g, "") === alias.toLowerCase().trim().replace(/[\W_]+/g, ""))
            );
            return match ? String(row[match]).trim() : '';
        };

        let count = 0;
        const chunks = [];
        for (let i = 0; i < json.length; i += 500) chunks.push(json.slice(i, i + 500));

        for (const chunk of chunks) {
            const batch = writeBatch(firestore);
            chunk.forEach((row) => {
                const nik = findValue(row, ['NIK', 'Nomor Induk']);
                const fullName = findValue(row, ['NAMA', 'Nama Lengkap']);
                
                if (nik && fullName && nik.length === 16) {
                    // PENTING: Gunakan NIK sebagai Document ID
                    const docRef = doc(firestore, 'residents', nik);
                    const residentData = {
                        nik,
                        fullName: fullName.toUpperCase(),
                        gender: findValue(row, ['JENIS KELAMIN', 'JK', 'Gender']),
                        placeOfBirth: findValue(row, ['TEMPAT LAHIR']),
                        dateOfBirth: findValue(row, ['TANGGAL LAHIR']),
                        address: findValue(row, ['ALAMAT']),
                        rtRw: findValue(row, ['RT/RW']),
                        relationshipToHeadOfFamily: findValue(row, ['SHDK']),
                        religion: findValue(row, ['AGAMA']),
                        occupation: findValue(row, ['PEKERJAAN']),
                        maritalStatus: findValue(row, ['STATUS KAWIN']),
                        educationLevel: findValue(row, ['PENDIDIKAN']),
                        updatedAt: serverTimestamp(),
                        createdAt: serverTimestamp(),
                    };
                    batch.set(docRef, residentData, { merge: true });
                    count++;
                }
            });
            await batch.commit();
        }

        setImportCount(count);
        toast({ title: "Impor Berhasil", description: `${count} data penduduk disimpan.` });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impor Data Penduduk</DialogTitle>
          <DialogDescription>Gunakan NIK sebagai ID Dokumen untuk efisiensi sistem.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Label htmlFor="file">Pilih File Excel</Label>
          <Input id="file" type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={isProcessing} />
          {isProcessing && <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Memproses...</div>}
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          {importCount !== null && <Alert className="bg-green-50 text-green-700 border-green-200"><AlertDescription>{importCount} data berhasil diimpor.</AlertDescription></Alert>}
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={isProcessing || !selectedFile}>Mulai Impor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
