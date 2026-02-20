'use client';

import { Firestore, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { Resident } from './types';

/**
 * MENCARI DATA PENDUDUK (OPTIMIZED)
 * Menggunakan query 'where' untuk mencari NIK di dalam koleksi.
 * Firestore hanya menghitung 1 Read jika hanya 1 dokumen yang ditemukan.
 */
export const getResidentByNik = async (db: Firestore, nik: string): Promise<Resident | null> => {
  if (!nik || nik.length !== 16) return null;
  
  try {
    const residentsRef = collection(db, 'residents');
    const q = query(residentsRef, where('nik', '==', nik), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const d = querySnapshot.docs[0];
      return { id: d.id, ...d.data() } as Resident;
    }
    
    return null;
  } catch (error: any) {
    console.error("Error fetching resident by NIK:", error);
    throw error;
  }
};
