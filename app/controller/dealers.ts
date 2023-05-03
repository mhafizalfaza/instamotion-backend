import { Model } from "mongoose";
import { createDealerValidator } from "../model/validator/input//dealer/createDealer";
import { updateDealerValidator } from "../model/validator/input//dealer/updateDealer";
import { objectIdValidator } from "../model/validator/objectId";
import { DealersService } from "../service/dealers";
import { httpErrorCode } from "../utils/helpers";
import { MessageUtil } from "../utils/message";

export class DealersController extends DealersService {
  constructor(dealers: Model<any>) {
    super(dealers);
  }

  /**
   * Create dealer
   * @param {*} event
   */
  async create(event: any) {
    let json: unknown = JSON.parse(event.body);

    try {
      const createDealerParsed = createDealerValidator.parse(json);
      const result = await this.createDealer(createDealerParsed);

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message, httpErrorCode(err));
    }
  }

  /**
   * Update a dealer by id
   * @param event
   */
  async update(event: any) {
    const { id } = event.pathParameters;
    const body = JSON.parse(event.body);

    try {
      const idParsed = objectIdValidator.parse(id);
      const bodyParsed = updateDealerValidator.parse(body);
      const result = await this.updateDealers(idParsed, bodyParsed);

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
   * Find dealer list
   */
  async find() {
    try {
      const result = await this.findDealers();

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message, httpErrorCode(err));
    }
  }

  /**
   * Query dealer by id
   * @param event
   */
  async findOne(event: any) {
    const { id } = event.pathParameters;

    try {
      const idParsed = objectIdValidator.parse(id);
      const result = await this.findOneDealerById(idParsed);

      return MessageUtil.success(result);
    } catch (err) {
      console.error(err);

      return MessageUtil.error(err.code, err.message, httpErrorCode(err));
    }
  }

  /**
   * Delete dealer by id
   * @param event
   */
  async deleteOne(event: any) {
    const { id } = event.pathParameters;

    try {
      const idParsed = objectIdValidator.parse(id);
      const result = await this.deleteOneDealerById(idParsed);

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
}
