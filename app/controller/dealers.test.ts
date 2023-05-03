import { DealersController } from "./dealers";
import { Dealer } from "../model/dealer";
import {
  clearDatabase,
  closeDatabase,
  connectDatabase,
} from "../utils/tests/db";
import { mockDealer } from "../utils/tests/dealers.mock";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { zodKeys } from "../utils/helpers";
import { createDealerValidator } from "../model/validator/input//dealer/createDealer";

describe("dealers controller tests", () => {
  const createDealerRequiredFields = zodKeys(createDealerValidator);

  const dealersController = new DealersController(Dealer);

  beforeAll(async () => await connectDatabase());

  afterEach(async () => await clearDatabase());

  afterAll(async () => await closeDatabase());

  describe("create dealer", () => {
    describe("using sufficient and valid data", () => {
      it("creates dealer successfully", async () => {
        const dealer = mockDealer();

        const expectObj = {
          name: dealer.name,
        };

        const dealerRes = await dealersController.create({
          body: JSON.stringify(dealer),
        });

        const dealerFromDB = await Dealer.findOne({ name: dealer.name });

        expect(dealerFromDB).toMatchObject(expectObj);

        const dealerResBody = JSON.parse(dealerRes.body);

        expect(dealerResBody.data).toMatchObject(expectObj);
      });

      describe.each(createDealerRequiredFields)(
        "missing a required field '%p'",
        (field) => {
          it("returns input validation error", async () => {
            const dealer = mockDealer();

            const dealerRes = await dealersController.create({
              body: JSON.stringify({
                ...dealer,
                [field]: undefined,
              }),
            });
            const body = JSON.parse(dealerRes.body);

            const errorMsgParsed = JSON.parse(body.message)[0].message;

            expect(errorMsgParsed).toEqual("Required");
          });
        }
      );

      describe("with an invalid field", () => {
        it("creates dealer correctly without invalid field", async () => {
          const dealer = mockDealer();

          const invalidField = "invalid-field";

          const res = await dealersController.create({
            body: JSON.stringify({
              ...dealer,
              [invalidField]: "invalidField",
            }),
          });

          const dealerFromDB = await Dealer.findOne({ name: dealer.name });

          const dealerRes = JSON.parse(res.body).data;

          expect(dealerRes).toMatchObject({
            name: dealerFromDB.name,
          });

          expect(dealerRes).toMatchObject({
            name: dealer.name,
          });

          expect(dealerFromDB[invalidField]).toBeUndefined();
        });
      });
    });
  });

  describe("findOne dealer", () => {
    describe("using valid and existing id", () => {
      it("returns one dealer correctly", async () => {
        const dealer = await Dealer.create(mockDealer());

        const dealerRes = await dealersController.findOne({
          pathParameters: {
            id: String(dealer._id),
          },
        });

        const dealerResBody = JSON.parse(dealerRes.body);

        expect(dealerResBody.data).toMatchObject({
          _id: String(dealer._id),
          name: dealer.name,
        });
      });
    });

    describe("using non-existent id", () => {
      it("returns null", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        const dealerRes = await dealersController.findOne({
          pathParameters: { id: String(new mongoose.Types.ObjectId()) },
        });

        const dealerResBody = JSON.parse(dealerRes.body);

        expect(dealerResBody.data).toBeNull();
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        const dealerRes = await dealersController.findOne({
          pathParameters: { id: "invalid-id" },
        });

        const dealerResBody = JSON.parse(dealerRes.body);

        const errorMsgParsed = JSON.parse(dealerResBody.message)[0].message;

        expect(errorMsgParsed).toEqual("Invalid input");
      });
    });
  });

  describe("find dealers", () => {
    it("returns all dealers correctly", async () => {
      const dealer1 = await Dealer.create(mockDealer());
      const dealer2 = await Dealer.create(mockDealer());
      const dealer3 = await Dealer.create(mockDealer());

      const dealersRes = await dealersController.find();

      const dealersResBody = JSON.parse(dealersRes.body);

      const dealersResData = dealersResBody.data;

      const dealer1Res = dealersResData.find(
        (eachItem) => eachItem._id === String(dealer1._id)
      );

      const dealer2Res = dealersResData.find(
        (eachItem) => eachItem._id === String(dealer2._id)
      );

      const dealer3Res = dealersResData.find(
        (eachItem) => eachItem._id === String(dealer3._id)
      );

      expect(dealersResData).toHaveLength(3);

      expect(dealer1Res).toMatchObject({
        _id: String(dealer1._id),
        name: dealer1.name,
      });
      expect(dealer2Res).toMatchObject({
        _id: String(dealer2._id),
        name: dealer2.name,
      });
      expect(dealer3Res).toMatchObject({
        _id: String(dealer3._id),
        name: dealer3.name,
      });
    });
  });

  describe("deleteOne dealer", () => {
    describe("using valid and existing id", () => {
      it("deletes dealer successfully", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        const dealerRes = await dealersController.deleteOne({
          pathParameters: { id: String(dealer._id) },
        });

        const dealerFromDB = await Dealer.findOne({ _id: dealer._id });

        expect(dealerFromDB).toBeNull();

        const dealerResBody = JSON.parse(dealerRes.body);

        expect(dealerResBody.data).toMatchObject({ name: dealer.name });
      });
    });

    describe("using non-existent id", () => {
      it("returns not found error", async () => {
        await Dealer.create(mockDealer());

        const dealerRes = await dealersController.deleteOne({
          pathParameters: { id: String(new mongoose.Types.ObjectId()) },
        });

        const dealerResBody = JSON.parse(dealerRes.body);

        expect(dealerResBody).toMatchObject({
          code: 1010,
          message: "The data was not found! May have been deleted!",
        });
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        const dealerRes = await dealersController.deleteOne({
          pathParameters: {
            id: "invalid-id",
          },
        });

        const dealerResBody = JSON.parse(dealerRes.body);

        const errorMsgParsed = JSON.parse(dealerResBody.message)[0].message;

        expect(errorMsgParsed).toEqual("Invalid input");
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

        const dealerRes = await dealersController.update({
          pathParameters: { id: String(dealer._id) },
          body: JSON.stringify(updateData),
        });

        const dealerFromDB = await Dealer.findOne({ _id: dealer._id });

        expect(dealerFromDB).toMatchObject(updateData);

        const dealerResBody = JSON.parse(dealerRes.body);

        expect(dealerResBody.data).toMatchObject(updateData);
      });
    });

    describe("using non-existent id", () => {
      it("returns not found error", async () => {
        await Dealer.create(mockDealer());

        const dealerRes = await dealersController.update({
          pathParameters: { id: String(new mongoose.Types.ObjectId()) },
          body: JSON.stringify(updateData),
        });

        const dealerResBody = JSON.parse(dealerRes.body);

        expect(dealerResBody).toMatchObject({
          code: 1010,
          message: "The data was not found!",
        });
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        await Dealer.create(mockDealer());

        const dealerRes = await dealersController.update({
          pathParameters: { id: "invalid-id" },
          body: JSON.stringify(updateData),
        });

        const dealerResBody = JSON.parse(dealerRes.body);

        const errorMsgParsed = JSON.parse(dealerResBody.message)[0].message;

        expect(errorMsgParsed).toEqual("Invalid input");
      });
    });
  });
});
