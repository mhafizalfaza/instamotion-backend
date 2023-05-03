import { Handler } from "aws-lambda";
import { VehiclesController } from "../controller/vehicles";
import { Vehicle } from "../model";

const vehiclesController = new VehiclesController(Vehicle);

export const create: Handler = (event: any) => {
  return vehiclesController.create(event);
};

export const update: Handler = (event: any) => vehiclesController.update(event);

export const find: Handler = () => {
  return vehiclesController.find();
};

export const findOne: Handler = (event: any) => {
  return vehiclesController.findOne(event);
};

export const deleteOne: Handler = (event: any) =>
  vehiclesController.deleteOne(event);

export const findByDealerId: Handler = (event: any) => {
  return vehiclesController.findByDealerId(event);
};
