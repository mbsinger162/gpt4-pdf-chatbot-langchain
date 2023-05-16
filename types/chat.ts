import { Document } from 'langchain/document';

export type Message = {
  type: 'apiMessage' | 'userMessage';
  message: string;
  isStreaming?: boolean;
  sourceDocs?: Document[];
  imageUrl?: string; // Add this line
  imageSource?: string; // Add this line
};

