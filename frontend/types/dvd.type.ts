export interface DVD {
  _id: string;
  eanCode: string;
  title: string;
  comments?: string;
  imageUrl?: string;
  releaseYear?: number;
  director?: string;
  brand?: string;
}
