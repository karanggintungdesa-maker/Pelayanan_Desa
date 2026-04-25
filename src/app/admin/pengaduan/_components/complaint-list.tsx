'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Complaint } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Lightbulb, MessageSquare, Tag, Calendar, Trash2 } from 'lucide-react';
import { updateComplaintResponse, deleteComplaint } from '@/lib/complaints';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AdminResponseForm({ complaintId, existingResponse }: { complaintId: string, existingResponse?: string }) {
    const [response, setResponse] = useState(existingResponse || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleSubmit = async () => {
        if (!response.trim() || !firestore) return;
        
        setIsSubmitting(true);
        try {
            await updateComplaintResponse(firestore, complaintId, response);
            toast({
                title: "Jawaban Terkirim",
                description: "Tanggapan Anda telah disimpan dan akan ditampilkan kepada warga.",
            });
        } catch (error) {
             toast({
                title: "Gagal Mengirim Jawaban",
                description: "Terjadi kesalahan saat mengirim tanggapan.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="mt-4 space-y-2">
            <Textarea 
                placeholder="Tulis jawaban atau tanggapan Anda di sini..." 
                rows={4}
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                disabled={isSubmitting}
            />
            <Button onClick={handleSubmit} disabled={isSubmitting || !response.trim()}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {existingResponse ? 'Perbarui Jawaban' : 'Kirim Jawaban'}
            </Button>
        </div>
    );
}

export function ComplaintList() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const complaintsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'complaints'), orderBy('submissionDate', 'desc'), limit(100));
  }, [firestore, user]);

  const { data: complaints, isLoading: isLoadingComplaints } = useCollection<Complaint>(complaintsQuery);
  
  const handleDelete = async (complaintId: string) => {
    if (!firestore) return;

    try {
        await deleteComplaint(firestore, complaintId);
        toast({
            title: "Pengaduan Dihapus",
            description: "Pengaduan telah berhasil dihapus dari sistem.",
        });
    } catch (error) {
        toast({
            title: "Gagal Menghapus",
            description: "Terjadi kesalahan saat menghapus pengaduan.",
            variant: "destructive",
        });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Pengaduan Masuk</CardTitle>
        <CardDescription>Klik pada setiap aduan untuk melihat detail dan memberikan jawaban (Maks. 100 terbaru).</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingComplaints || !user ? (
             <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
             </div>
        ) : (
            <Accordion
            type="single"
            collapsible
            className="w-full space-y-4"
            >
            {complaints?.length === 0 && <p className="text-center text-muted-foreground p-8">Belum ada pengaduan yang masuk.</p>}
            {complaints?.map((complaint) => (
                <AccordionItem
                value={complaint.id}
                key={complaint.id}
                className="border rounded-xl px-4"
                >
                <AccordionTrigger className="py-4 hover:no-underline">

                    <div className="flex flex-col gap-2 text-left w-full">
                    <div className="flex justify-between items-start gap-4">
                        <p className="text-sm font-medium text-foreground line-clamp-2">
                        {complaint.description}
                        </p>

                        <Badge
                        variant={complaint.adminResponse ? 'default' : 'secondary'}
                        className="capitalize shrink-0"
                        >
                        {complaint.adminResponse ? 'Dijawab' : 'Baru'}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {complaint.submissionDate?.toDate().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'})}
                    </div>
                    </div>

                </AccordionTrigger>

                <AccordionContent className="space-y-6 pt-4">

                    <div>
                      <p className="font-semibold mb-2 flex items-center gap-2 text-sm">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Aduan Warga
                      </p>
                      <blockquote className="border-l-4 pl-4 text-muted-foreground italic text-sm">
                          {complaint.description}
                      </blockquote>
                    </div>

                    <div className="p-4 rounded-xl border bg-muted/40 space-y-4">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                          <Lightbulb className="w-4 h-4 text-amber-500" />
                          Analisis AI
                      </h4>
                      <div>
                          <p className="font-medium text-xs">Ringkasan</p>
                          <p className="text-muted-foreground text-sm">
                              {complaint.summaryLLM}
                          </p>
                      </div>
                      <div>
                          <p className="font-medium text-xs">Topik Utama</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                              {complaint.keywords?.map((kw, i) => (
                              <Badge key={i} variant="secondary" className="font-normal">
                                  <Tag className="mr-1.5 h-3 w-3" />
                                  {kw}
                              </Badge>
                              ))}
                          </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <AdminResponseForm complaintId={complaint.id} existingResponse={complaint.adminResponse} />
                      <div className="flex justify-end mt-4">
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Hapus Aduan
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Tindakan ini tidak dapat dibatalkan. Aduan ini akan dihapus secara permanen dari server.
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(complaint.id)}>
                                      Ya, Hapus
                                  </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    </div>

                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
