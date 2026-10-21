import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto {
  photoReference: string;
  width: number;
  height: number;
  htmlAttributions: string[];
  photoUrl: string;
}

export interface IPlace extends Document {
  placeId: string;
  name: string;
  formattedAddress: string;
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  phoneNumber?: string;
  website?: string;
  googleMapsUrl: string;
  photos: IPhoto[];
  lastFetchedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema<IPhoto>({
  photoReference: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  htmlAttributions: [{ type: String }],
  photoUrl: { type: String, required: true },
});

const PlaceSchema = new Schema<IPlace>(
  {
    placeId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    formattedAddress: { type: String, required: true },
    types: [{ type: String }],
    rating: { type: Number },
    userRatingsTotal: { type: Number },
    phoneNumber: { type: String },
    website: { type: String },
    googleMapsUrl: { type: String, required: true },
    photos: [PhotoSchema],
    lastFetchedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL: cached data expires after 7 days to stay fresh
PlaceSchema.index({ lastFetchedAt: 1 }, { expireAfterSeconds: 604800 });

export const Place = mongoose.model<IPlace>('Place', PlaceSchema);
