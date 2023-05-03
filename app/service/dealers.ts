import { Model } from "mongoose";
import { CreateDealer } from "../model/validator/input//dealer/createDealer";
import { UpdateDealer } from "../model/validator/input//dealer/updateDealer";

export class DealersService {
  private dealers: Model<any>;
  constructor(dealers: Model<any>) {
    this.dealers = dealers;
  }

  /**
   * Create dealer
   * @param data
   */
  protected async createDealer(data: CreateDealer): Promise<object> {
    try {
      const result = await this.dealers.create(data);

      return result;
    } catch (err) {
      console.error(err);

      throw err;
    }
  }

  /**
   * Update a dealer by id
   * @param id
   * @param data
   */
  protected updateDealers(_id: string, data: UpdateDealer) {
    return this.dealers.findOneAndUpdate({ _id }, data, {
      new: true,
    });
  }

  /**
   * Find dealers
   */
  protected findDealers() {
    return this.dealers.find();
  }

  /**
   * Query dealer by id
   * @param id
   */
  protected findOneDealerById(_id: string) {
    return this.dealers.findOne({ _id });
  }

  /**
   * Delete dealer by id
   * @param id
   */
  protected deleteOneDealerById(_id: string) {
    return this.dealers.findOneAndDelete({ _id });
  }
}
