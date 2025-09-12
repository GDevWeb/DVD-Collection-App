import mongoose, { Document, Schema } from "mongoose";

export interface IDVD extends Document {
  eanCode: string;
  title: string;
  comments: string;
  imageUrl?: string;
  releaseYear?: number;
  brand?: string;
  director?: string;
}

export interface DVDInputData {
  eanCode: string;
  title: string;
  comments: string;
  imageUrl?: string;
  releaseYear?: number;
  director?: string;
  brand?: string;
}

const dvdSchema: Schema = new Schema({
  eanCode: { type: String, required: true, unique: true },
  title: { type: String, required: true, unique: true },
  comments: { type: String, required: false },
  imageUrl: {
    type: String,
    required: false,
    default: "https://placehold.co/300x400?text=Cover+Not+Found",
  },
  releaseYear: { type: Number, required: false },
  brand: { type: String, required: false },
  director: { type: String, required: false },
});

const DVD = mongoose.model<IDVD>("DVD", dvdSchema);

export default DVD;
