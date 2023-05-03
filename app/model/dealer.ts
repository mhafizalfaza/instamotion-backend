import mongoose, { Schema } from "mongoose";

export type DealerDocument = mongoose.Document & {
  name: string;
};

const DealerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    vehicles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Vehicle",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Dealer =
  (mongoose.models.Dealer as mongoose.Model<DealerDocument>) ||
  mongoose.model<DealerDocument>(
    "Dealer",
    DealerSchema,
    process.env.DB_DEALERS_COLLECTION
  );
