'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { getLetterRequestsCollection } from '@/lib/submissions';
import { LetterSubmission } from '@/lib/types';
import { isToday, isThisMonth } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { query, orderBy, limit } from 'firebase/firestore';

interface Stats {
  today: { approved: number; rejected: number };
  thisMonth: { approved: number; rejected: number };
  total: number;
}

export function DashboardStats() {
  const { user } = useUser();
  const firestore = useFirestore();
  
  const statsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(getLetterRequestsCollection(firestore), orderBy('createdAt', 'desc'), limit(500));
  }, [firestore, user]);

  const { data: submissionsData, isLoading } = useCollection<LetterSubmission>(statsQuery);

  const stats: Stats = useMemo(() => {
    const initialStats: Stats = {
      today: { approved: 0, rejected: 0 },
      thisMonth: { approved: 0, rejected: 0 },
      total: 0,
    };

    if (!submissionsData) return initialStats;

    return submissionsData.reduce((acc, sub) => {
      acc.total++;
      if (!sub.createdAt?.toDate) return acc;
      
      const submissionDate = sub.createdAt.toDate();

      if (isToday(submissionDate)) {
        if (sub.status === 'approved') acc.today.approved++;
        if (sub.status === 'rejected') acc.today.rejected++;
      }

      if (isThisMonth(submissionDate)) {
        if (sub.status === 'approved') acc.thisMonth.approved++;
        if (sub.status === 'rejected') acc.thisMonth.rejected++;
      }

      return acc;
    }, initialStats);
  }, [submissionsData]);

  const chartData = [
    { name: 'Disetujui', value: stats.thisMonth.approved, fill: 'hsl(var(--primary))' },
    { name: 'Ditolak', value: stats.thisMonth.rejected, fill: 'hsl(var(--destructive))' },
  ];

  const chartConfig = {
    value: {
      label: "Jumlah",
    }
  };

  if (isLoading || !user) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-36 rounded-3xl w-full" />
        <Skeleton className="h-36 rounded-3xl w-full" />
        <Skeleton className="h-36 rounded-3xl w-full" />
        <Skeleton className="h-36 rounded-3xl w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden group w-full">
          <CardContent className="p-5 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl group-hover:scale-110 transition-transform">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Hari Ini</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">{stats.today.approved}</div>
              <p className="text-xs text-muted-foreground font-medium">Surat Disetujui</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden group w-full">
          <CardContent className="p-5 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-100 text-red-700 rounded-2xl group-hover:scale-110 transition-transform">
                <XCircle className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Hari Ini</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">{stats.today.rejected}</div>
              <p className="text-xs text-muted-foreground font-medium">Surat Ditolak</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden group w-full">
          <CardContent className="p-5 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-2xl group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Bulan Ini</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">{stats.thisMonth.approved}</div>
              <p className="text-xs text-muted-foreground font-medium">Total Disetujui</p>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all overflow-hidden group w-full">
          <CardContent className="p-5 flex flex-col h-full justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl group-hover:scale-110 transition-transform">
                <Clock className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Database</span>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground font-medium">Total Pengajuan</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-none shadow-sm overflow-hidden bg-white w-full">
        <div className="p-5 sm:p-6 border-b bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold">Ringkasan Performa Bulan Ini</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Perbandingan surat disetujui vs ditolak</p>
          </div>
        </div>
        <CardContent className="p-2 sm:p-6">
          <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <YAxis hide />
                <ChartTooltip cursor={{ fill: 'transparent' }} content={<ChartTooltipContent indicator="dot" />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
