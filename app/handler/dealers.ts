import { Handler } from "aws-lambda";
import { DealersController } from "../controller/dealers";
import { Dealer } from "../model";

const dealersController = new DealersController(Dealer);

export const create: Handler = (event: any) => {
  return dealersController.create(event);
};

export const update: Handler = (event: any) => dealersController.update(event);

export const find: Handler = () => {
  return dealersController.find();
};

export const findOne: Handler = (event: any) => {
  return dealersController.findOne(event);
};

export const deleteOne: Handler = (event: any) =>
  dealersController.deleteOne(event);
