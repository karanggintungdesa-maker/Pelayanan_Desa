'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, CheckCircle, XCircle, Printer, Trash2, Eye, Loader2, FileSignature, Download, Phone, Mail, FileDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LetterSubmission, UploadedFile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import {
  getLetterRequestsQuery,
  updateSubmissionStatus,
  deleteSubmission,
  setSubmissionDocumentNumber,
} from '@/lib/submissions';
import { Skeleton } from '@/components/ui/skeleton';
import { generateDocumentNumber } from '@/ai/flows/generate-document-number-flow';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Helper to open Google Drive file download link
const openGoogleDriveDownloadLink = (fileId: string) => {
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    window.open(url, '_blank');
};


export function SubmissionList() {
  const [selectedSubmission, setSelectedSubmission] = useState<LetterSubmission | null>(null);
  const [manualNumberSubmission, setManualNumberSubmission] = useState<LetterSubmission | null>(null);
  const [manualNumberInput, setManualNumberInput] = useState<string>('');
  const [isSubmittingManualNumber, setIsSubmittingManualNumber] = useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const query = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return getLetterRequestsQuery(firestore);
  }, [firestore, user]);

  const { data: submissionsData, isLoading } = useCollection<LetterSubmission>(query);

  const submissions = useMemo(() => {
    if (!submissionsData) return [];
    return submissionsData.map(sub => ({
        ...sub,
        formData: sub.submissionData ? JSON.parse(sub.submissionData) : {},
        date: sub.createdAt?.toDate()?.toISOString() ?? new Date().toISOString(),
    }))
  }, [submissionsData]);

  const handleDownload = (file: UploadedFile) => {
    openGoogleDriveDownloadLink(file.fileId);
  };

  const handleManualNumberSubmit = async () => {
    if (!manualNumberSubmission || !manualNumberInput) return;

    const manualNumber = parseInt(manualNumberInput, 10);
    if (isNaN(manualNumber) || manualNumber <= 0) {
        toast({
            title: "Nomor Tidak Valid",
            description: "Silakan masukkan nomor surat yang valid.",
            variant: "destructive",
        });
        return;
    }

    setIsSubmittingManualNumber(true);
    try {
        const formattedNumber = await generateDocumentNumber({ manualNumber });
        await setSubmissionDocumentNumber(firestore, manualNumberSubmission.id, formattedNumber);

        toast({
            title: "Nomor Surat Dibuat",
            description: `Nomor baru ${formattedNumber} telah disimpan.`,
        });

    } catch (e: any) {
        toast({
            title: "Gagal Membuat Nomor",
            description: e.message,
            variant: "destructive",
        });
    } finally {
        setIsSubmittingManualNumber(false);
        setManualNumberInput('');
        setManualNumberSubmission(null);
    }
  };

  const handleStatusChange = (id: string, status: 'approved' | 'rejected') => {
    updateSubmissionStatus(firestore, id, status);
    toast({
        title: `Status Diperbarui`,
        description: `Pengajuan telah ${status === 'approved' ? 'Disetujui' : 'Ditolak'}.`,
    });
  };
  
  const handlePrint = (submission: LetterSubmission) => {
    window.open(`/print/${submission.id}`, '_blank');
  };

  const handleDelete = (id: string) => {
    deleteSubmission(firestore, id);
    toast({
        title: `Pengajuan Dihapus`,
        variant: 'destructive',
    });
  };

  const formatLabel = (key: string) => {
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  const formatValue = (value: any) => {
    if (value instanceof Date) {
      return value.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    }
    if (typeof value === 'object' && value !== null && 'name' in value) return value.name;
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  const statusVariant = {
    pending: 'secondary',
    approved: 'default',
    rejected: 'destructive',
    processing: 'secondary',
  } as const;

  const statusText = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    processing: 'Memproses',
  };

  if (isLoading || !user) {
      return (
          <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
          </div>
      )
  }

  return (
    <>
      <div className="rounded-[2rem] border overflow-hidden bg-white shadow-sm overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="px-6 py-5">Pemohon</TableHead>
              <TableHead className="hidden sm:table-cell px-6">Jenis Surat</TableHead>
              <TableHead className="px-6">Nomor Surat</TableHead>
              <TableHead className="hidden md:table-cell px-6">Tanggal</TableHead>
              <TableHead className="text-center px-6">Status</TableHead>
              <TableHead className="text-right px-6">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="h-48 text-center text-muted-foreground">Belum ada pengajuan masuk.</TableCell></TableRow>
            ) : (
                submissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-slate-50 transition-colors border-b last:border-0">
                    <TableCell className="px-6 py-4">
                    <div className="font-bold text-slate-900">{submission.requesterName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{submission.nik}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs font-medium px-6">{submission.letterType}</TableCell>
                    <TableCell className="px-6">
                        {submission.documentNumber ? (
                            <span className="font-mono text-xs font-black text-primary px-2 py-1 bg-slate-100 rounded-md border">{submission.documentNumber}</span>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setManualNumberSubmission(submission)}
                                disabled={submission.status !== 'approved'}
                                className="h-8 text-[10px] rounded-full border-slate-200"
                            >
                                <FileSignature className="mr-1 h-3 w-3" />
                                Buat Nomor
                            </Button>
                        )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-slate-500 px-6">{new Date(submission.date).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-center px-6">
                    <Badge variant={statusVariant[submission.status]} className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                        {submission.status === 'processing' && <Loader2 className="mr-1 h-2 w-2 animate-spin" />}
                        {statusText[submission.status]}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl shadow-xl border-slate-100 min-w-[180px]">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 px-4 py-3">Kelola Berkas</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSelectedSubmission(submission)} className="rounded-xl px-4 py-3 mx-1 font-bold"><Eye className="mr-2 h-4 w-4" /><span>Lihat Detail</span></DropdownMenuItem>
                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'approved')} className="rounded-xl px-4 py-3 mx-1 font-bold text-emerald-600"><CheckCircle className="mr-2 h-4 w-4" /><span>Setujui</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(submission.id, 'rejected')} className="rounded-xl px-4 py-3 mx-1 font-bold text-red-600"><XCircle className="mr-2 h-4 w-4" /><span>Tolak</span></DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrint(submission)} disabled={submission.status !== 'approved' || !submission.documentNumber} className="rounded-xl px-4 py-3 mx-1 font-bold"><Printer className="mr-2 h-4 w-4" /><span>Cetak Dokumen</span></DropdownMenuItem>
                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem onClick={() => handleDelete(submission.id)} className="text-red-500 focus:text-red-500 rounded-xl px-4 py-3 mx-1 font-bold"><Trash2 className="mr-2 h-4 w-4" /><span>Hapus Permanen</span></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedSubmission} onOpenChange={(isOpen) => !isOpen && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-2xl rounded-[2.5rem] p-8 md:p-12">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{selectedSubmission?.letterType}</DialogTitle>
            <DialogDescription className="font-mono text-[10px] uppercase tracking-widest opacity-60">ID: {selectedSubmission?.id}</DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2 space-y-8">
              {/* KONTAK WARGA */}
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col sm:flex-row gap-6 justify-around">
                  <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <Phone className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">WhatsApp</p>
                          <p className="text-sm font-black text-slate-900">{selectedSubmission.phoneNumber || 'Tidak ada'}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-2xl shadow-sm">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Email</p>
                          <p className="text-sm font-black text-slate-900">{selectedSubmission.email || 'Tidak ada'}</p>
                      </div>
                  </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-2">Data Formulir Isian</h4>
                <div className="border rounded-3xl overflow-hidden bg-white">
                  <Table>
                      <TableBody>
                      {Object.entries(selectedSubmission.formData).map(([key, value]) => (
                          <TableRow key={key} className="border-b last:border-0">
                            <TableCell className="font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50/50 w-1/3 px-6 py-4">{formatLabel(key)}</TableCell>
                            <TableCell className="text-sm font-bold text-slate-900 px-6 py-4">{formatValue(value)}</TableCell>
                          </TableRow>
                      ))}
                      </TableBody>
                  </Table>
                </div>
              </div>

              {selectedSubmission.fileLinks && selectedSubmission.fileLinks.length > 0 && (
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 px-2">Berkas Lampiran (Scan/Foto)</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedSubmission.fileLinks.map((file) => (
                        <Button key={file.fileId} variant="outline" className="justify-start h-auto py-4 px-6 rounded-2xl border-slate-200 hover:bg-slate-50 transition-all group" onClick={() => handleDownload(file)}>
                           <Download className="mr-3 h-4 w-4 text-accent transition-transform group-hover:translate-y-1" />
                           <span className="truncate font-bold text-xs">{formatLabel(file.fieldName)}</span>
                        </Button>
                        ))}
                    </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-8">
            <Button variant="secondary" onClick={() => setSelectedSubmission(null)} className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] h-12">Tutup Detail</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!manualNumberSubmission} onOpenChange={(isOpen) => !isOpen && setManualNumberSubmission(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] p-10">
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Buat Nomor Surat</DialogTitle>
              <DialogDescription className="text-xs">Nomor akan otomatis diformat sesuai standar desa.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6">
                <div className="space-y-2">
                    <Label htmlFor="manual-number" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nomor Urut Surat</Label>
                    <Input id="manual-number" type="number" value={manualNumberInput} onChange={(e) => setManualNumberInput(e.target.value)} placeholder="Contoh: 152" disabled={isSubmittingManualNumber} className="h-14 rounded-2xl font-bold text-lg" />
                </div>
            </div>
            <DialogFooter>
              <Button onClick={handleManualNumberSubmit} disabled={isSubmittingManualNumber || !manualNumberInput} className="w-full h-14 rounded-2xl bg-primary hover:bg-slate-800 font-black uppercase tracking-widest text-[10px]">
                {isSubmittingManualNumber ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSignature className="mr-2 h-4 w-4" />}
                Simpan & Format Nomor
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
