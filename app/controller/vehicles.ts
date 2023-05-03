import { Model } from "mongoose";
import { MessageUtil } from "../utils/message";
import { VehiclesService } from "../service/vehicles";
import { createVehicleValidator } from "../model/validator/input//vehicle/createVehicle";
import { objectIdValidator } from "../model/validator/objectId";
import { updateVehicleValidator } from "../model/validator/input//vehicle/updateVehicle";
import { httpErrorCode } from "../utils/helpers";

export class VehiclesController extends VehiclesService {
  constructor(vehicles: Model<any>) {
    super(vehicles);
  }

  /**
   * Create vehicle
   * @param {*} event
   */
  async create(event: any) {
    let json: unknown = JSON.parse(event.body);

    try {
      const createVehicleParsed = createVehicleValidator.parse(json);
      const result = await this.createVehicle(createVehicleParsed);

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message, httpErrorCode(err));
    }
  }

  /**
   * Update a vehicle by id
   * @param event
   */
  async update(event: any) {
    const { id } = event.pathParameters;
    const body: object = JSON.parse(event.body);

    try {
      const idParsed = objectIdValidator.parse(id);
      const bodyParsed = updateVehicleValidator.parse(body);
      const result = await this.updateVehicles(idParsed, bodyParsed);

      if (!result) {
        return MessageUtil.error(1010, "The data was not found!");
      }

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message, httpErrorCode(err));
    }
  }

  /**
   * Find vehicle list
   */
  async find() {
    try {
      const result = await this.findVehicles();

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message, httpErrorCode(err));
    }
  }

  /**
   * Query vehicle by id
   * @param event
   */
  async findOne(event: any) {
    const { id } = event.pathParameters;

    try {
      const idParsed = objectIdValidator.parse(id);
      const result = await this.findOneVehicleById(idParsed);

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message, httpErrorCode(err));
    }
  }

  /**
   * Delete vehicle by id
   * @param event
   */
  async deleteOne(event: any) {
    const { id } = event.pathParameters;

    try {
      const idParsed = objectIdValidator.parse(id);
      const result = await this.deleteOneVehicleById(idParsed);

      if (!result) {
        return MessageUtil.error(
          1010,
          "The data was not found! May have been deleted!"
        );
      }

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message, httpErrorCode(err));
    }
  }

  /**
   * Find vehicles by dealer id
   * @param event
   */
  async findByDealerId(event: any) {
    const { id } = event.pathParameters;

    try {
      const idParsed = objectIdValidator.parse(id);
      const result = await this.findVehiclesByDealerId(idParsed);

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message, httpErrorCode(err));
    }
  }
}
