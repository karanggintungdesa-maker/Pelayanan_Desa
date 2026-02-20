'use client';

import { Button } from '@/components/ui/button';
import { LetterSubmission, KopSuratInfo } from '@/lib/types';
import { Loader2, Printer, FileDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PrintLayoutProps {
  submission: LetterSubmission;
  children: React.ReactNode;
  requesterLabel?: string; 
  requesterNameOverride?: string;
  additionalFooter?: React.ReactNode; 
  hideRequesterSignature?: boolean;
  reverseSignatures?: boolean;
}

const fallbackKopInfo: KopSuratInfo = {
  letterheadImageUrl: "https://placehold.co/1200x240/f0f0f0/333333?text=Kop+Surat+Belum+Diatur"
};

const parseDateInput = (dateInput: any): Date | null => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'object' && 'toDate' in dateInput) return dateInput.toDate();
  
  if (typeof dateInput === 'string') {
    const separators = /[-/]/;
    const parts = dateInput.split(separators);

    if (parts.length === 3) {
      let d, m, y;
      if (parts[0].length === 4) { // YYYY-MM-DD
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        d = parseInt(parts[2], 10);
      } else { // DD-MM-YYYY
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        let p2 = parseInt(parts[2], 10);
        
        if (p2 < 100) {
          const currentYearShort = new Date().getFullYear() % 100;
          p2 += (p2 > currentYearShort + 2) ? 1900 : 2000;
        }

        if (p0 > 12) { d = p0; m = p1 - 1; y = p2; }
        else if (p1 > 12) { m = p0 - 1; d = p1; y = p2; }
        else { d = p0; m = p1 - 1; y = p2; }
      }
      const date = new Date(y, m, d);
      return isNaN(date.getTime()) ? null : date;
    }
    const parsed = new Date(dateInput);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

export const formatTTL = (place: string, dateInput: any) => {
  const dateObj = parseDateInput(dateInput);
  const city = place ? place.toUpperCase() : '';
  
  if (!dateObj) return city || '-';

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return `${city}, ${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
};

export const formatFullDate = (dateInput: any) => {
  const dateObj = parseDateInput(dateInput);
  if (!dateObj) return dateInput || '-';

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayName = days[dateObj.getDay()];
  const dayNum = String(dateObj.getDate()).padStart(2, '0');
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${dayName}, ${dayNum} ${monthName} ${year}`;
};

export function PrintLayout({ 
  submission, 
  children, 
  requesterLabel = "Pemohon", 
  requesterNameOverride,
  additionalFooter,
  hideRequesterSignature = false,
  reverseSignatures = false
}: PrintLayoutProps) {
  const [kopInfo, setKopInfo] = useState<KopSuratInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const firestore = useFirestore();
  const { toast } = useToast();
  const printAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchKopInfo = async () => {
      if (!firestore) return;
      setIsLoading(true);
      try {
        const kopSuratRef = doc(firestore, 'kopSurat', 'default');
        const docSnap = await getDoc(kopSuratRef);
        if (docSnap.exists()) {
          setKopInfo(docSnap.data() as KopSuratInfo);
        } else {
          setKopInfo(fallbackKopInfo);
        }
      } catch (error) {
        setKopInfo(fallbackKopInfo);
      } finally {
        setIsLoading(false);
      }
    };
    fetchKopInfo();
  }, [firestore]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    
    setIsDownloading(true);
    try {
      // PRE-CAPTURE: Force clean styles
      const originalBoxShadow = printAreaRef.current.style.boxShadow;
      const originalBorder = printAreaRef.current.style.border;
      
      printAreaRef.current.style.boxShadow = 'none';
      printAreaRef.current.style.border = 'none';

      // Capture full element height
      const dataUrl = await toPng(printAreaRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true,
      });

      // RESTORE STYLE
      printAreaRef.current.style.boxShadow = originalBoxShadow;
      printAreaRef.current.style.border = originalBorder;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      const pageHeight = pdf.internal.pageSize.getHeight();
      let heightLeft = pdfHeight;
      let position = 0;

      // Add first page
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Add subsequent pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `${submission.letterType.replace(/\s+/g, '_')}_${submission.requesterName.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Berhasil Mengunduh",
        description: "Dokumen PDF telah disimpan. Mendukung multi-halaman jika diperlukan.",
      });
    } catch (error) {
      console.error('PDF Generation Error:', error);
      toast({
        title: "Gagal Mengunduh",
        description: "Terjadi kesalahan saat merender file PDF.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  if (isLoading) {
      return (
          <div className="flex h-screen w-full items-center justify-center bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Memuat templat kop...</p>
          </div>
      )
  }

  const formattedDate = new Date(submission.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const displayRequesterName = requesterNameOverride || submission.requesterName;

  return (
    <div className="bg-slate-200 text-black font-arial-print min-h-screen py-10 print:bg-white print:p-0 flex flex-col items-center">
        {/* Container Capture: Fixed A4 Width, Flexible Height */}
        <div 
            ref={printAreaRef} 
            className="bg-white print:border-none shadow-2xl print:shadow-none" 
            style={{ 
                width: '210mm', 
                minHeight: '297mm',
                boxSizing: 'border-box',
                position: 'relative',
                margin: '0',
                padding: '0',
                display: 'block'
            }}
        >
            <header className="w-full">
              {kopInfo?.letterheadImageUrl && (
                <img
                  src={kopInfo.letterheadImageUrl}
                  alt="Kop Surat"
                  className="w-full h-auto"
                  crossOrigin="anonymous"
                />
              )}
            </header>

            {/* Adjusted Margins: Left 2.5cm, Right 2cm */}
            <main className="pl-[2.5cm] pr-[2cm] text-base pt-4">
              <div className="text-center mb-6">
                  <p className="font-bold underline text-lg tracking-wider">{submission.letterType.toUpperCase()}</p>
                  <p>Nomor : {submission.documentNumber}</p>
              </div>

              {children}
            </main>
            
            <footer className="pl-[2.5cm] pr-[2cm] pb-16 pt-8">
                <div className={cn("flex justify-between text-center items-start", reverseSignatures && "flex-row-reverse")}>
                    {/* Tanda Tangan Blok 1 */}
                    <div className={`w-64 ${hideRequesterSignature ? 'invisible' : ''}`}>
                        {reverseSignatures ? (
                            <p className="mb-1">Karanggintung, {formattedDate}</p>
                        ) : (
                            <p className="invisible mb-1">Karanggintung, 00 Bulan 0000</p> 
                        )}
                        <p>{requesterLabel}</p>
                        <div className="h-24"></div>
                        <p className="font-bold underline tracking-wider uppercase">
                            {displayRequesterName}
                        </p>
                    </div>

                    {/* Tanda Tangan Blok 2 */}
                    <div className="w-72">
                        {!reverseSignatures ? (
                            <p className="mb-1">Karanggintung, {formattedDate}</p>
                        ) : (
                            <p className="invisible mb-1">Karanggintung, 00 Bulan 0000</p>
                        )}
                        <p>Kepala Desa Karanggintung</p>
                        <div className="h-24"></div>
                        <p className="font-bold underline tracking-wider">TURMONO</p>
                    </div>
                </div>

                {additionalFooter && (
                  <div className="mt-8">
                    {additionalFooter}
                  </div>
                )}
            </footer>
        </div>

      <div className="fixed bottom-4 right-4 flex flex-col sm:flex-row gap-2 print:hidden">
        <Button onClick={handleDownloadPdf} variant="secondary" size="lg" disabled={isDownloading} className="rounded-full shadow-lg h-14 px-8">
          {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2" />}
          Unduh PDF
        </Button>
        <Button onClick={handlePrint} size="lg" className="rounded-full shadow-lg h-14 px-8 bg-slate-900 text-white hover:bg-slate-800">
          <Printer className="mr-2" />
          Cetak Dokumen
        </Button>
      </div>

      <style jsx global>{`
        .font-arial-print {
            font-family: Arial, sans-serif;
        }
        @media print {
          @page {
            size: A4;
            margin-top: 0;
            margin-bottom: 0;
            margin-left: 2.5cm;
            margin-right: 2cm;
          }
          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .fixed {
            display: none !important;
          }
          .bg-slate-200 {
            background: white !important;
          }
          .page-wrapper {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export const DataRow = ({ label, value }: { label: string; value: any }) => {
    const displayValue = value || '-';
    return (
        <tr>
            <td className="w-2/5 py-1 align-top">{label}</td>
            <td className="w-[2%] py-1 align-top text-center">:</td>
            <td className="py-1 align-top pl-2 font-bold">{displayValue}</td>
        </tr>
    );
};
