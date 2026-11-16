export interface User {
  id: number;
  username: string;
  hasProfileImage: boolean;
  email: string;
  bio: string;
  profileImageUrl?: string;
}

export interface Message {
  id?: number;              // from backend after save
  clientId?: string;        // frontend-only for dedup and keying
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: string;        // ISO format (e.g., 2025-05-15T18:21:00Z)
}

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  mimeType: string;
  url: string;
  expiresAt: string;
}
