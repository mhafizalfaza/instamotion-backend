import {
  Dealer,
  FuelType,
  VehicleTransmission,
  VehicleType,
} from "../../model";
import { mockDealer } from "./dealers.mock";

export const mockVehicle = async (values?: { dealer: string }) => {
  const dealerId =
    values?.dealer || String((await Dealer.create(mockDealer()))._id);

  return {
    maker: "Honda",
    model: "CRV",
    transmission: VehicleTransmission.AutomaticTransmission,
    fuelType: FuelType.Petrol,
    mileage: 10000,
    vehicleType: VehicleType.SUV,
    dealer: dealerId,
  };
};
