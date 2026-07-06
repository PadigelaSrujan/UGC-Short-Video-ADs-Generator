export type Project = {
  id: string;

  // Media
  generatedImage?: string | null;
  generatedVideo?: string | null;
  uploadedImages?: string[];

  // Metadata
  name?: string;
  productName?: string;
  productDescription?: string;
  userPrompt?: string;
  aspectRatio: "9:16" | "16:9" | string;

  // Status flags
  isGenerating?: boolean;
  isPublished?: boolean;

  // Timestamps
  createdAt: string | Date;
  updatedAt?: string | Date;
};

