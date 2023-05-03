import mongoose from "mongoose";
import * as z from "zod";
import { FuelType, VehicleTransmission, VehicleType } from "../../../vehicle";

export const updateVehicleValidator = z.object({
  maker: z.string().optional(),
  model: z.string().optional(),
  transmission: z.nativeEnum(VehicleTransmission).optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  mileage: z.number().optional(),
  vehicleType: z.nativeEnum(VehicleType).optional(),
  dealer: z
    .string()
    .refine((val) => {
      return mongoose.Types.ObjectId.isValid(val);
    })
    .optional(),
});

export type UpdateVehicle = z.infer<typeof updateVehicleValidator>;
