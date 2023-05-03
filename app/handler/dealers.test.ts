import lambdaTester from "lambda-tester";
import { create, deleteOne, find, findOne, update } from "./dealers";
import { Dealer } from "../model/dealer";
import {
  clearDatabase,
  closeDatabase,
  connectDatabase,
} from "../utils/tests/db";
import { mockDealer } from "../utils/tests/dealers.mock";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { createDealerValidator } from "../model/validator/input//dealer/createDealer";
import { zodKeys } from "../utils/helpers";

describe("dealers handler tests", () => {
  const createDealerRequiredFields = zodKeys(createDealerValidator);

  beforeAll(async () => await connectDatabase());

  afterEach(async () => await clearDatabase());

  afterAll(async () => await closeDatabase());

  describe("create dealer", () => {
    describe("using sufficient and valid data", () => {
      it("creates dealer correctly", async () => {
        const dealer = mockDealer();

        await lambdaTester(create)
          .event({ body: JSON.stringify(dealer) })
          .expectResult(async (result: any) => {
            const body = JSON.parse(result.body);

            const expectObj = {
              name: dealer.name,
            };

            const dealerFromDB = await Dealer.findOne({ name: dealer.name });

            const dealerRes = body.data;

            expect(dealerFromDB).toMatchObject(expectObj);

            expect(dealerRes).toMatchObject(expectObj);
          });
      });
    });

    describe.each(createDealerRequiredFields)(
      "missing a required field '%p'",
      (field) => {
        it("returns input validation error", async () => {
          const dealer = mockDealer();
          await lambdaTester(create)
            .event({
              body: JSON.stringify({
                ...dealer,
                [field]: undefined,
              }),
            })
            .expectResult(async (result: any) => {
              const body = JSON.parse(result.body);

              const errorMsgParsed = JSON.parse(body.message)[0].message;

              expect(errorMsgParsed).toEqual("Required");
            });
        });
      }
    );

    describe("with an invalid field", () => {
      it("creates dealer correctly without invalid field", async () => {
        const dealer = mockDealer();

        const invalidField = "invalid-field";

        await lambdaTester(create)
          .event({
            body: JSON.stringify({
              ...dealer,
              [invalidField]: invalidField,
            }),
          })
          .expectResult(async (result: any) => {
            const body = JSON.parse(result.body);

            const dealerFromDB = await Dealer.findOne({ name: dealer.name });

            const dealerRes = body.data;

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

        await lambdaTester(findOne)
          .event({ pathParameters: { id: String(dealer._id) } })
          .expectResult((result: any) => {
            const body = JSON.parse(result.body);
            const dealerRes = body.data;

            expect(dealerRes).toMatchObject({
              _id: String(dealer._id),
              name: dealer.name,
            });
          });
      });
    });

    describe("using non-existent id", () => {
      it("returns null", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        await lambdaTester(findOne)
          .event({
            pathParameters: { id: String(new mongoose.Types.ObjectId()) },
          })
          .expectResult((result: any) => {
            const body = JSON.parse(result.body);
            const dealerRes = body.data;

            expect(dealerRes).toBeNull();
          });
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        await lambdaTester(findOne)
          .event({
            pathParameters: { id: "invalid-id" },
          })
          .expectResult((result: any) => {
            const body = JSON.parse(result.body);

            const errorMsgParsed = JSON.parse(body.message)[0].message;

            expect(errorMsgParsed).toEqual("Invalid input");
          });
      });
    });
  });

  describe("find dealers", () => {
    it("returns all dealers correctly", async () => {
      const dealer1 = await Dealer.create(mockDealer());
      const dealer2 = await Dealer.create(mockDealer());
      const dealer3 = await Dealer.create(mockDealer());

      await lambdaTester(find)
        .event({})
        .expectResult((result: any) => {
          const body = JSON.parse(result.body);

          const dealersRes = body.data;

          const dealer1Res = dealersRes.find(
            (eachItem) => eachItem._id === String(dealer1._id)
          );

          const dealer2Res = dealersRes.find(
            (eachItem) => eachItem._id === String(dealer2._id)
          );

          const dealer3Res = dealersRes.find(
            (eachItem) => eachItem._id === String(dealer3._id)
          );

          expect(dealersRes).toHaveLength(3);

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
  });

  describe("deleteOne dealer", () => {
    describe("using valid and existing id", () => {
      it("deletes dealer correctly", async () => {
        const dealer = await Dealer.create(mockDealer());

        await lambdaTester(deleteOne)
          .event({ pathParameters: { id: String(dealer._id) } })
          .expectResult(async (result: any) => {
            const dealerFromDB = await Dealer.findOne({ _id: dealer._id });

            expect(dealerFromDB).toBeNull();

            const body = JSON.parse(result.body);

            const res = body.data;

            expect(res).toMatchObject({ name: dealer.name });
          });
      });
    });

    describe("using non-existent id", () => {
      it("returns not found error", async () => {
        await Dealer.create(mockDealer());

        await lambdaTester(deleteOne)
          .event({
            pathParameters: { id: String(new mongoose.Types.ObjectId()) },
          })
          .expectResult(async (result: any) => {
            const body = JSON.parse(result.body);

            expect(body).toMatchObject({
              code: 1010,
              message: "The data was not found! May have been deleted!",
            });
          });
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        await lambdaTester(findOne)
          .event({
            pathParameters: { id: "invalid-id" },
          })
          .expectResult((result: any) => {
            const body = JSON.parse(result.body);

            const errorMsgParsed = JSON.parse(body.message)[0].message;

            expect(errorMsgParsed).toEqual("Invalid input");
          });
      });
    });
  });

  describe("update dealer", () => {
    const updateData = {
      name: faker.company.name(),
    };
    describe("using valid and existing id", () => {
      it("updates dealer correctly", async () => {
        const dealer = await Dealer.create(mockDealer());

        await lambdaTester(update)
          .event({
            pathParameters: { id: String(dealer._id) },
            body: JSON.stringify(updateData),
          })
          .expectResult(async (result: any) => {
            const dealerFromDB = await Dealer.findOne({ _id: dealer._id });

            expect(dealerFromDB).toMatchObject(updateData);

            const body = JSON.parse(result.body);

            const dealerRes = body.data;

            expect(dealerRes).toMatchObject(updateData);
          });
      });
    });

    describe("using non-existent id", () => {
      it("returns not found error", async () => {
        await Dealer.create(mockDealer());

        await lambdaTester(update)
          .event({
            pathParameters: {
              id: String(new mongoose.Types.ObjectId()),
            },
            body: JSON.stringify(updateData),
          })
          .expectResult(async (result: any) => {
            const body = JSON.parse(result.body);

            expect(body).toMatchObject({
              code: 1010,
              message: "The data was not found!",
            });
          });
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const dealer = await Dealer.create(mockDealer());

        expect(dealer._id).toBeDefined();

        await lambdaTester(findOne)
          .event({
            pathParameters: { id: "invalid-id" },
            body: JSON.stringify(updateData),
          })
          .expectResult((result: any) => {
            const body = JSON.parse(result.body);

            const errorMsgParsed = JSON.parse(body.message)[0].message;

            expect(errorMsgParsed).toEqual("Invalid input");
          });
      });
    });
  });
});
