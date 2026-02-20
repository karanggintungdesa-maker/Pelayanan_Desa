
'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Users,
  FileUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Resident } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { 
  collection, 
  query, 
  deleteDoc, 
  doc, 
  getDocs, 
  where, 
  limit, 
  getCountFromServer,
  getDoc
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ResidentForm } from './resident-form';
import { ImportResidentDialog } from './import-resident-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function ResidentList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  
  const firestore = useFirestore();
  const { toast } = useToast();

  // Load total count saja saat mount, JANGAN load dokumennya.
  useEffect(() => {
    const fetchTotalCount = async () => {
      if (!firestore) return;
      try {
        const coll = collection(firestore, 'residents');
        const snapshot = await getCountFromServer(coll);
        setTotalCount(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching count:", error);
      }
    };
    fetchTotalCount();
  }, [firestore]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!firestore) return;
    
    const term = searchTerm.trim();
    if (!term) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const residentsCol = collection(firestore, 'residents');
      
      // OPTIMASI 1: Cek apakah input adalah NIK (16 digit angka)
      if (/^\d{16}$/.test(term)) {
        // Cek langsung berdasarkan Document ID (Paling hemat)
        const docRef = doc(firestore, 'residents', term);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setResidents([{ id: docSnap.id, ...docSnap.data() } as Resident]);
          setIsSearching(false);
          return;
        }
        
        // Jika ID bukan NIK, coba query field nik
        const qNik = query(residentsCol, where('nik', '==', term), limit(1));
        const snapNik = await getDocs(qNik);
        if (!snapNik.empty) {
          const results: Resident[] = [];
          snapNik.forEach(d => results.push({ id: d.id, ...d.data() } as Resident));
          setResidents(results);
          setIsSearching(false);
          return;
        }
      }

      // OPTIMASI 2: Pencarian Nama (Prefix Search)
      // Kita batasi hanya 20 hasil untuk menghemat read.
      const nameTerm = term.toUpperCase();
      const qName = query(
        residentsCol, 
        where('fullName', '>=', nameTerm), 
        where('fullName', '<=', nameTerm + '\uf8ff'),
        limit(20)
      );

      const querySnapshot = await getDocs(qName);
      const results: Resident[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as Resident);
      });
      
      setResidents(results);
      
      if (results.length === 0) {
        toast({
          title: "Tidak Ditemukan",
          description: `Data "${term}" tidak ada di database.`,
        });
      }
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        variant: "destructive",
        title: "Gagal Mencari",
        description: "Terjadi kesalahan kuota atau jaringan."
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'residents', id));
      setResidents(residents.filter(r => r.id !== id));
      if (totalCount !== null) setTotalCount(totalCount - 1);
      toast({ title: "Data Dihapus", description: "Data warga telah dihapus." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Gagal Menghapus", description: error.message });
    }
  };

  const handleEdit = (resident: Resident) => {
    setEditingResident(resident);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingResident(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Statistik Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCount === null ? <Skeleton className="h-8 w-16" /> : totalCount.toLocaleString('id-ID')}
            </div>
            <p className="text-xs text-muted-foreground italic">Total dokumen penduduk</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>Sistem dioptimalkan untuk mencari berdasarkan <strong>NIK 16 digit</strong> atau <strong>Nama Depan</strong>. Database tidak dimuat semua sekaligus demi kecepatan dan penghematan kuota.</p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Masukkan NIK atau Nama..."
              className="pl-10 h-11"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isSearching}
            />
          </div>
          <Button type="submit" size="lg" className="px-8" disabled={isSearching}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            Cari
          </Button>
        </form>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
            <FileUp className="mr-2 h-4 w-4" />
            Impor Excel
          </Button>
          <Button variant="secondary" size="sm" onClick={handleAdd}>
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Manual
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>NIK</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>JK</TableHead>
                <TableHead>SHDK</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isSearching ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-12 w-full" /></TableCell></TableRow>
                ))
              ) : residents.length > 0 ? (
                residents.map((resident) => (
                  <TableRow key={resident.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{resident.nik}</TableCell>
                    <TableCell className="font-medium uppercase text-xs">{resident.fullName}</TableCell>
                    <TableCell className="text-xs">{resident.gender?.charAt(0) || '-'}</TableCell>
                    <TableCell className="text-[10px] font-semibold">{resident.relationshipToHeadOfFamily || '-'}</TableCell>
                    <TableCell className="text-[10px]">
                      <p className="line-clamp-1">{resident.address}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(resident)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <div className="flex w-full items-center px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-default">
                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                              </div>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                                <AlertDialogDescription>Data {resident.fullName} akan dihapus permanen.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(resident.id)} className="bg-red-600 text-white">Ya, Hapus</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    {hasSearched ? "Data tidak ditemukan." : "Gunakan pencarian untuk menampilkan data."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ResidentForm open={isFormOpen} onOpenChange={setIsFormOpen} resident={editingResident} />
      <ImportResidentDialog open={isImportOpen} onOpenChange={setIsImportOpen} />
    </div>
  );
}
