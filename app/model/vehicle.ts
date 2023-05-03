import mongoose, { Schema } from "mongoose";

export enum VehicleTransmission {
  ManualGearbox = "Manual gearbox",
  SemiAutomatic = "Semi-automatic",
  AutomaticTransmission = "Automatic transmission",
}

export enum FuelType {
  Petrol = "Petrol",
  Diesel = "Diesel",
  Electric = "Electric",
  LPG = "LPG",
  Hybrid = "Hybrid",
}

export enum VehicleType {
  Cabriolet = "Cabriolet",
  Coupe = "Coupe",
  EstateCar = "Estate car",
  SUV = "SUV",
  Saloon = "Saloon",
  Van = "Van",
  SmallCar = "Small car",
  Other = "Other",
}

export type VehicleDocument = mongoose.Document & {
  maker: string;
  model: string;
  transmission: VehicleTransmission;
  fuelType: FuelType;
  mileage: number;
  vehicleType: VehicleType;
  dealer: string;
  createdAt: Date;
  updatedAt: Date;
};

const VehicleSchema = new mongoose.Schema(
  {
    maker: { type: String, required: true },
    model: { type: String, required: true },
    transmission: {
      type: String,
      enum: [
        VehicleTransmission.ManualGearbox,
        VehicleTransmission.SemiAutomatic,
        VehicleTransmission.AutomaticTransmission,
      ],
      required: true,
    },
    fuelType: {
      type: String,
      enum: [
        FuelType.Petrol,
        FuelType.Diesel,
        FuelType.Electric,
        FuelType.LPG,
        FuelType.Hybrid,
      ],
      required: true,
    },
    mileage: { type: Number, required: true },
    vehicleType: {
      type: String,
      enum: [
        VehicleType.Cabriolet,
        VehicleType.Coupe,
        VehicleType.EstateCar,
        VehicleType.SUV,
        VehicleType.Saloon,
        VehicleType.Van,
        VehicleType.SmallCar,
        VehicleType.Other,
      ],
      required: true,
    },
    dealer: {
      type: Schema.Types.ObjectId,
      ref: "Dealer",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Vehicle =
  (mongoose.models.Vehicle as mongoose.Model<VehicleDocument>) ||
  mongoose.model<VehicleDocument>(
    "Vehicle",
    VehicleSchema,
    process.env.DB_VEHICLES_COLLECTION
  );
