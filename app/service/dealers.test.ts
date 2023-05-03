import { DealersService } from "./dealers";
import { Dealer } from "../model/dealer";
import {
  clearDatabase,
  closeDatabase,
  connectDatabase,
} from "../utils/tests/db";
import { mockDealer } from "../utils/tests/dealers.mock";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { UpdateDealer } from "../model/validator/input//dealer/updateDealer";
import { CreateDealer } from "../model/validator/input//dealer/createDealer";

// For accessing protected methods
class DealersServicePublic extends DealersService {
  public createDealer(data: CreateDealer) {
    return super.createDealer(data);
  }

  public findDealers() {
    return super.findDealers();
  }

  public findOneDealerById(id) {
    return super.findOneDealerById(id);
  }

  public updateDealers(id: string, data: UpdateDealer) {
    return super.updateDealers(id, data);
  }

  public deleteOneDealerById(id: string) {
    return super.deleteOneDealerById(id);
  }
}

describe("dealers service tests", () => {
  const dealersService = new DealersServicePublic(Dealer);

  beforeAll(async () => await connectDatabase());

  afterEach(async () => await clearDatabase());

  afterAll(async () => await closeDatabase());

  describe("createDealer", () => {
    describe("using sufficient and valid data", () => {
      it("creates dealer successfully", async () => {
        const dealer = mockDealer();

        const expectObj = {
          name: dealer.name,
        };

        const dealerRes = await dealersService.createDealer(dealer);

        const dealerFromDB = await Dealer.findOne({ name: dealer.name });

        expect(dealerFromDB).toMatchObject(expectObj);

        expect(dealerRes).toMatchObject(expectObj);
      });
    });
    
  });

  describe("findOne dealer", () => {
    describe("using valid and existing id", () => {
      it("returns one dealer correctly", async () => {
        const dealer = await Dealer.create(mockDealer());

        const dealerRes = await dealersService.findOneDealerById(
          String(dealer._id)
        );

        expect(dealerRes).toMatchObject({
          _id: dealer._id,
          name: dealer.name,
        });
      });
    });

    describe("using non-existent id", () => {
      it("returns null", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        const dealerRes = await dealersService.findOneDealerById(
          String(new mongoose.Types.ObjectId())
        );

        expect(dealerRes).toBeNull();
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        await expect(
          dealersService.findOneDealerById("invalid-id")
        ).rejects.toThrow(
          'Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Dealer"'
        );
      });
    });
  });

  describe("find dealers", () => {
    it("returns all dealers correctly", async () => {
      const dealer1 = await Dealer.create(mockDealer());
      const dealer2 = await Dealer.create(mockDealer());
      const dealer3 = await Dealer.create(mockDealer());

      const dealersRes = await dealersService.findDealers();

      const dealer1Res = dealersRes.find(
        (eachItem) => String(eachItem._id) === String(dealer1._id)
      );

      const dealer2Res = dealersRes.find(
        (eachItem) => String(eachItem._id) === String(dealer2._id)
      );

      const dealer3Res = dealersRes.find(
        (eachItem) => String(eachItem._id) === String(dealer3._id)
      );

      expect(dealersRes).toHaveLength(3);

      expect(dealer1Res).toMatchObject({
        name: dealer1.name,
      });
      expect(dealer2Res).toMatchObject({
        name: dealer2.name,
      });
      expect(dealer3Res).toMatchObject({
        name: dealer3.name,
      });
    });
  });

  describe("deleteOne dealer", () => {
    describe("using valid and existing id", () => {
      it("deletes dealer successfully", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        const dealerRes = await dealersService.deleteOneDealerById(
          String(dealer._id)
        );

        const dealerFromDB = await Dealer.findOne({ _id: dealer._id });

        expect(dealerFromDB).toBeNull();

        expect(dealerRes).toMatchObject({ name: dealer.name });
      });
    });

    describe("using non-existent id", () => {
      it("returns null", async () => {
        await Dealer.create(mockDealer());

        const dealerRes = await dealersService.deleteOneDealerById(
          String(new mongoose.Types.ObjectId())
        );

        expect(dealerRes).toBeNull();
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        await expect(
          dealersService.deleteOneDealerById("invalid-id")
        ).rejects.toThrow(
          'Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Dealer"'
        );
      });
    });
  });

  describe("update dealer", () => {
    const updateData = {
      name: faker.company.name(),
    };
    describe("using valid and existing id", () => {
      it("updates dealer successfully", async () => {
        const dealer = await Dealer.create(mockDealer());

        const dealerRes = await dealersService.updateDealers(
          String(dealer._id),
          updateData
        );

        const dealerFromDB = await Dealer.findOne({ _id: dealer._id });

        expect(dealerFromDB).toMatchObject(updateData);

        expect(dealerRes).toMatchObject(updateData);
      });
    });

    describe("using non-existent id", () => {
      it("returns null", async () => {
        await Dealer.create(mockDealer());

        const dealerRes = await dealersService.updateDealers(
          String(new mongoose.Types.ObjectId()),
          updateData
        );

        expect(dealerRes).toBeNull();
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        await Dealer.create(mockDealer());

        await expect(
          dealersService.updateDealers("invalid-id", updateData)
        ).rejects.toThrow(
          'Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Dealer"'
        );
      });
    });
  });
});
