import { Timestamp } from "firebase/firestore";

export type Announcement = {
  id: string;
  title: string;
  content: string;
  publishDate: Timestamp;
  authorName: string;
};

export type Complaint = {
  id: string;
  description: string;
  submissionDate: Timestamp;
  summaryLLM: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keywords: string[];
  submitterAuthUid?: string;
  adminResponse?: string;
};

export type LetterSubmissionData = {
  requesterName: string;
  nik: string;
  letterType: string;
  formData: Record<string, any>;
  files?: { fieldName: string; file: File }[];
};

export type UploadedFile = {
  fieldName: string;
  fileName: string;
  fileId: string; // Diubah dari downloadURL ke fileId Google Drive
}

export type LetterSubmission = {
  id:string;
  requesterName: string;
  nik: string;
  phoneNumber?: string; // Tambahan field
  email?: string;       // Tambahan field
  letterType: string;
  date: string; // Will be ISO string from createdAt
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  formData: Record<string, any>; // The UI expects this to be an object
  documentNumber?: string;
  fileLinks?: UploadedFile[];
  // Firestore fields
  submissionData?: string; // The raw string from firestore
  requestorAuthUid?: string;
  createdAt?: any; // Firestore timestamp
  updatedAt?: any;
};

export type Resident = {
  id: string;
  nik: string;
  fullName: string;
  placeOfBirth: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  rtRw: string;
  religion: string;
  occupation: string;
  maritalStatus: string;
  educationLevel: string;
  relationshipToHeadOfFamily: string; // Ditambahkan untuk SHDK
  createdAt?: any;
  updatedAt?: any;
};

export type CitizenProfile = {
  uid: string;
  phoneNumber: string;
  email: string;
  updatedAt: any;
};

export type KopSuratInfo = {
  letterheadImageUrl: string;
};

export type VillageLogoInfo = {
  logoImageUrl: string;
};
