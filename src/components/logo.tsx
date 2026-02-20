'use client';

import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { VillageLogoInfo } from '@/lib/types';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { Mountain } from "lucide-react";
import { Skeleton } from './ui/skeleton';

export function Logo() {
  const firestore = useFirestore();
  const logoRef = useMemoFirebase(() => {
    if (!firestore) return null; // Important: return null if firestore is not ready
    return doc(firestore, 'villageLogo', 'default');
  }, [firestore]);
  
  // useDoc is designed to handle a null ref gracefully
  const { data: logoData, isLoading } = useDoc<VillageLogoInfo>(logoRef);

  return (
    <div className="flex items-center gap-3 font-semibold font-headline">
      {isLoading ? (
        <Skeleton className="h-8 w-8 rounded-md" />
      ) : logoData?.logoImageUrl && logoData.logoImageUrl.startsWith('data:image') ? (
         <Image 
            src={logoData.logoImageUrl}
            alt="Logo Desa"
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
         />
      ) : (
        <Mountain className="h-6 w-6 text-primary" />
      )}
      <span>PELAYANAN DESA KARANGGINTUNG</span>
    </div>
  );
}
