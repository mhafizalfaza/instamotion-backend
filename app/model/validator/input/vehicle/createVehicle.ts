import mongoose from "mongoose";
import * as z from "zod";
import { FuelType, VehicleTransmission, VehicleType } from "../../../vehicle";

export const createVehicleValidator = z.object({
  maker: z.string(),
  model: z.string(),
  transmission: z.nativeEnum(VehicleTransmission),
  fuelType: z.nativeEnum(FuelType),
  mileage: z.number(),
  vehicleType: z.nativeEnum(VehicleType),
  dealer: z.string().refine((val) => {
    return mongoose.Types.ObjectId.isValid(val);
  }),
});

export type CreateVehicle = z.infer<typeof createVehicleValidator>;
