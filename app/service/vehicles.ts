import { Model } from "mongoose";
import { CreateVehicle } from "../model/validator/input/vehicle/createVehicle";
import { UpdateVehicle } from "../model/validator/input/vehicle/updateVehicle";

export class VehiclesService {
  private vehicles: Model<any>;
  constructor(vehicles: Model<any>) {
    this.vehicles = vehicles;
  }

  /**
   * Create vehicle
   * @param data
   */
  protected async createVehicle(data: CreateVehicle): Promise<object> {
    try {
      const result = await this.vehicles.create(data);

      return result;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  /**
   * Update a vehicle by id
   * @param id
   * @param data
   */
  protected updateVehicles(_id: string, data: UpdateVehicle) {
    return this.vehicles.findOneAndUpdate({ _id }, data, {
      new: true,
    });
  }

  /**
   * Find vehicles
   */
  protected findVehicles() {
    return this.vehicles.find();
  }

  /**
   * Query vehicle by id
   * @param id
   */
  protected findOneVehicleById(_id: string) {
    return this.vehicles.findOne({ _id });
  }

  /**
   * Delete vehicle by id
   * @param id
   */
  protected deleteOneVehicleById(_id: string) {
    return this.vehicles.findOneAndDelete({ _id });
  }

  /**
   * Find vehicles by dealer id
   */
  protected findVehiclesByDealerId(id: string) {
    return this.vehicles.find({ dealer: id });
  }
}
