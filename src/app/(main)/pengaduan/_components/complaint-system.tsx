'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { summarizeComplaintFeedback } from '@/ai/flows/summarize-complaint-feedback-flow';
import { Complaint } from '@/lib/types';
import {
  Loader2,
  Send,
  Lightbulb,
  MessageSquare,
  Tag,
  ThumbsDown,
  ThumbsUp,
  Meh,
  Calendar,
  CornerDownRight,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

const sentimentIcons = {
  positive: <ThumbsUp className="h-4 w-4 text-green-500" />,
  negative: <ThumbsDown className="h-4 w-4 text-red-500" />,
  neutral: <Meh className="h-4 w-4 text-yellow-500" />,
};

export function ComplaintSystem() {
  const [newComplaintText, setNewComplaintText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  // Ensure user is signed in (even anonymously) before querying protected complaints collection
  const complaintsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'complaints'), orderBy('submissionDate', 'desc'), limit(100));
  }, [firestore, user]);

  const { data: complaints, isLoading: isLoadingComplaints } = useCollection<Complaint>(complaintsQuery);

  const handleSubmit = async () => {
    if (!newComplaintText.trim()) {
      toast({
        title: 'Pengaduan Kosong',
        description: 'Tuliskan pengaduan atau masukan Anda.',
        variant: 'destructive',
      });
      return;
    }

    if (!firestore) {
      toast({
        title: 'Gagal Mengirim',
        description: 'Koneksi ke database gagal. Coba lagi nanti.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { summary, sentiment, keywords } =
        await summarizeComplaintFeedback({
          complaintText: newComplaintText,
        });

      const complaintData = {
        description: newComplaintText,
        summaryLLM: summary,
        sentiment: sentiment,
        keywords: keywords,
        submitterAuthUid: user ? user.uid : null,
        status: 'New',
        category: 'Umum',
        submissionDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await addDoc(collection(firestore, 'complaints'), complaintData);

      setNewComplaintText('');

      toast({
        title: 'Pengaduan Terkirim',
        description: 'Terima kasih atas masukan Anda.',
      });
    } catch (error) {
      toast({
        title: 'Gagal Mengirim',
        description: 'Terjadi kesalahan. Coba lagi nanti.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">

      {/* FORM */}
      <div className="lg:col-span-1">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Formulir Pengaduan</CardTitle>
            <CardDescription>
              Tuliskan keluhan atau masukan Anda di sini.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Contoh: Lampu jalan di depan rumah saya mati..."
              rows={6}
              value={newComplaintText}
              onChange={(e) => setNewComplaintText(e.target.value)}
              disabled={isSubmitting}
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Kirim
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* DAFTAR */}
      <div className="lg:col-span-2">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle>Daftar Pengaduan</CardTitle>
            <CardDescription>
              Pengaduan yang telah diterima (Maks. 100 terbaru).
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-2">
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
                            variant={
                                complaint.sentiment === 'negative'
                                ? 'destructive'
                                : complaint.sentiment === 'positive'
                                ? 'default'
                                : 'secondary'
                            }
                            className="capitalize shrink-0 flex items-center gap-1"
                            >
                            {sentimentIcons[complaint.sentiment]}
                            {complaint.sentiment}
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
                            Teks Aduan Lengkap
                        </p>
                        <blockquote className="border-l-4 pl-4 text-muted-foreground italic text-sm">
                            {complaint.description}
                        </blockquote>
                        </div>

                        <div className="p-4 rounded-xl border bg-muted/40">
                        <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Analisis AI
                        </h4>

                        <div className="space-y-4 text-sm">

                            <div>
                            <p className="font-medium">
                                Ringkasan:
                            </p>
                            <p className="text-muted-foreground">
                                {complaint.summaryLLM}
                            </p>
                            </div>

                            <div>
                            <p className="font-medium">
                                Topik Utama:
                            </p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {complaint.keywords?.map((kw, i) => (
                                <Badge
                                    key={i}
                                    variant="secondary"
                                    className="font-normal"
                                >
                                    <Tag className="mr-1.5 h-3 w-3" />
                                    {kw}
                                </Badge>
                                ))}
                            </div>
                            </div>

                        </div>
                        </div>

                        {complaint.adminResponse && (
                            <div className="p-4 rounded-xl border border-green-200 bg-green-50/50">
                                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm text-green-800">
                                    <CornerDownRight className="w-4 h-4" />
                                    Tanggapan dari Admin Desa
                                </h4>
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{complaint.adminResponse}</p>
                            </div>
                        )}

                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
