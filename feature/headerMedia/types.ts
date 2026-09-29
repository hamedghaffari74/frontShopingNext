export type HeaderMediaType = "Image" | "Gif" | "Video" | string;

export interface HeaderMedia {
  id: number;
  title?: string | null;
  description?: string | null;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  mediaType: HeaderMediaType;
  linkUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface HeaderMediaInput {
  file?: File;
  title?: string;
  description?: string;
  linkUrl?: string;
  isActive: boolean;
  displayOrder: number;
}
