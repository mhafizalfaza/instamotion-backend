import lambdaTester from "lambda-tester";
import {
  create,
  deleteOne,
  find,
  findByDealerId,
  findOne,
  update,
} from "./vehicles";
import {
  FuelType,
  Vehicle,
  VehicleTransmission,
  VehicleType,
} from "../../app/model/vehicle";
import {
  clearDatabase,
  closeDatabase,
  connectDatabase,
} from "../utils/tests/db";
import { mockVehicle } from "../utils/tests/vehicles.mock";
import mongoose from "mongoose";
import { zodKeys } from "../utils/helpers";
import { createVehicleValidator } from "../model/validator/input/vehicle/createVehicle";

describe("vehicles handler tests", () => {
  const createVehicleRequiredFields = zodKeys(createVehicleValidator);
  const createVehicleEnumFields = zodKeys(createVehicleValidator, {
    enumOnly: true,
  });

  beforeAll(async () => await connectDatabase());

  afterEach(async () => await clearDatabase());

  afterAll(async () => await closeDatabase());

  describe("create vehicle", () => {
    describe("using sufficient and valid data", () => {
      it("creates vehicle correctly", async () => {
        const vehicle = await mockVehicle();

        await lambdaTester(create)
          .event({ body: JSON.stringify(vehicle) })
          .expectResult(async (result: any) => {
            const body = JSON.parse(result.body);

            const expectObj = {
              maker: vehicle.maker,
              model: vehicle.model,
            };

            const vehicleFromDB = await Vehicle.findOne(expectObj);

            const vehicleRes = body.data;

            expect(vehicleFromDB).toMatchObject(expectObj);

            expect(vehicleRes).toMatchObject(expectObj);
          });
      });
    });

    describe.each(createVehicleRequiredFields)(
      "missing a required field '%p'",
      (field) => {
        it("returns input validation error", async () => {
          const vehicle = await mockVehicle();
          await lambdaTester(create)
            .event({
              body: JSON.stringify({
                ...vehicle,
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

    describe.each(createVehicleEnumFields)(
      "using an invalid enum value '%p'",
      (field) => {
        it("returns input validation error", async () => {
          const vehicle = await mockVehicle();
          await lambdaTester(create)
            .event({
              body: JSON.stringify({
                ...vehicle,
                [field]: "invalid-enum",
              }),
            })
            .expectResult(async (result: any) => {
              const body = JSON.parse(result.body);

              const errorMsgParsed = JSON.parse(body.message)[0].message;

              expect(errorMsgParsed).toContain("Invalid enum value");
            });
        });
      }
    );

    describe("with an invalid field", () => {
      it("creates vehicle correctly without invalid field", async () => {
        const vehicle = await mockVehicle();

        const invalidField = "invalid-field";

        await lambdaTester(create)
          .event({
            body: JSON.stringify({
              ...vehicle,
              [invalidField]: invalidField,
            }),
          })
          .expectResult(async (result: any) => {
            const body = JSON.parse(result.body);

            const vehicleFromDB = await Vehicle.findOne({
              maker: vehicle.maker,
              model: vehicle.model,
            });

            const vehicleRes = body.data;

            expect(vehicleRes).toMatchObject({
              maker: vehicleFromDB.maker,
              model: vehicleFromDB.model,
            });

            expect(vehicleRes).toMatchObject({
              maker: vehicle.maker,
              model: vehicle.model,
            });

            expect(vehicleFromDB[invalidField]).toBeUndefined();
          });
      });
    });
  });

  describe("findOne vehicle", () => {
    describe("using valid and existing id", () => {
      it("returns one vehicle correctly", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        await lambdaTester(findOne)
          .event({ pathParameters: { id: String(vehicle._id) } })
          .expectResult((result: any) => {
            const body = JSON.parse(result.body);
            const vehicleRes = body.data;

            expect(vehicleRes).toMatchObject({
              _id: String(vehicle._id),
              maker: vehicle.maker,
              model: vehicle.model,
              transmission: vehicle.transmission,
              fuelType: vehicle.fuelType,
              mileage: vehicle.mileage,
              vehicleType: vehicle.vehicleType,
              dealer: String(vehicle.dealer),
            });
          });
      });
    });

    describe("using non-existent id", () => {
      it("returns null", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        await lambdaTester(findOne)
          .event({
            pathParameters: { id: String(new mongoose.Types.ObjectId()) },
          })
          .expectResult((result: any) => {
            const body = JSON.parse(result.body);
            const vehicleRes = body.data;

            expect(vehicleRes).toBeNull();
          });
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

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

  describe("find vehicles", () => {
    it("returns all vehicles correctly", async () => {
      const vehicle1 = await Vehicle.create(await mockVehicle());
      const vehicle2 = await Vehicle.create(await mockVehicle());
      const vehicle3 = await Vehicle.create(await mockVehicle());

      await lambdaTester(find)
        .event({})
        .expectResult((result: any) => {
          const body = JSON.parse(result.body);

          const vehiclesRes = body.data;

          const vehicle1Res = vehiclesRes.find(
            (eachItem) => eachItem._id === String(vehicle1._id)
          );

          const vehicle2Res = vehiclesRes.find(
            (eachItem) => eachItem._id === String(vehicle2._id)
          );

          const vehicle3Res = vehiclesRes.find(
            (eachItem) => eachItem._id === String(vehicle3._id)
          );

          expect(vehiclesRes).toHaveLength(3);

          expect(vehicle1Res).toMatchObject({
            _id: String(vehicle1._id),
            maker: vehicle1.maker,
            model: vehicle1.model,
            transmission: vehicle1.transmission,
            fuelType: vehicle1.fuelType,
            mileage: vehicle1.mileage,
            vehicleType: vehicle1.vehicleType,
            dealer: String(vehicle1.dealer),
          });
          expect(vehicle2Res).toMatchObject({
            _id: String(vehicle2._id),
            maker: vehicle2.maker,
            model: vehicle2.model,
            transmission: vehicle2.transmission,
            fuelType: vehicle2.fuelType,
            mileage: vehicle2.mileage,
            vehicleType: vehicle2.vehicleType,
            dealer: String(vehicle2.dealer),
          });
          expect(vehicle3Res).toMatchObject({
            _id: String(vehicle3._id),
            maker: vehicle3.maker,
            model: vehicle3.model,
            transmission: vehicle3.transmission,
            fuelType: vehicle3.fuelType,
            mileage: vehicle3.mileage,
            vehicleType: vehicle3.vehicleType,
            dealer: String(vehicle3.dealer),
          });
        });
    });
  });

  describe("find vehicles by dealer id", () => {
    describe("using existing and valid dealer id", () => {
      it("returns vehicles of a specific dealer correctly", async () => {
        const vehicle1 = await Vehicle.create(await mockVehicle());

        const dealerId = String(vehicle1.dealer);

        const vehicle2 = await Vehicle.create(
          await mockVehicle({ dealer: dealerId })
        );
        const vehicle3 = await Vehicle.create(
          await mockVehicle({ dealer: dealerId })
        );

        // This 4th vehicle should not be returned due to different dealer
        await Vehicle.create(await mockVehicle());

        await lambdaTester(findByDealerId)
          .event({ pathParameters: { id: dealerId } })
          .expectResult((result: any) => {
            const body = JSON.parse(result.body);

            const vehiclesRes = body.data;

            const vehicle1Res = vehiclesRes.find(
              (eachItem) => eachItem._id === String(vehicle1._id)
            );

            const vehicle2Res = vehiclesRes.find(
              (eachItem) => eachItem._id === String(vehicle2._id)
            );

            const vehicle3Res = vehiclesRes.find(
              (eachItem) => eachItem._id === String(vehicle3._id)
            );

            // It should return only 3 vehicles despite the 4th vehicle created
            expect(vehiclesRes).toHaveLength(3);

            expect(vehicle1Res).toMatchObject({
              _id: String(vehicle1._id),
              maker: vehicle1.maker,
              model: vehicle1.model,
              transmission: vehicle1.transmission,
              fuelType: vehicle1.fuelType,
              mileage: vehicle1.mileage,
              vehicleType: vehicle1.vehicleType,
              dealer: String(vehicle1.dealer),
            });
            expect(vehicle2Res).toMatchObject({
              _id: String(vehicle2._id),
              maker: vehicle2.maker,
              model: vehicle2.model,
              transmission: vehicle2.transmission,
              fuelType: vehicle2.fuelType,
              mileage: vehicle2.mileage,
              vehicleType: vehicle2.vehicleType,
              dealer: String(vehicle2.dealer),
            });
            expect(vehicle3Res).toMatchObject({
              _id: String(vehicle3._id),
              maker: vehicle3.maker,
              model: vehicle3.model,
              transmission: vehicle3.transmission,
              fuelType: vehicle3.fuelType,
              mileage: vehicle3.mileage,
              vehicleType: vehicle3.vehicleType,
              dealer: String(vehicle3.dealer),
            });
          });
      });
    });

    describe("using non-existent id", () => {
      it("returns empty array", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        await lambdaTester(findByDealerId)
          .event({
            pathParameters: { id: String(new mongoose.Types.ObjectId()) },
          })
          .expectResult((result: any) => {
            const body = JSON.parse(result.body);
            const vehicleRes = body.data;

            expect(vehicleRes).toHaveLength(0);
          });
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        await lambdaTester(findByDealerId)
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

  describe("deleteOne vehicle", () => {
    describe("using valid and existing id", () => {
      it("deletes vehicle correctly", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        await lambdaTester(deleteOne)
          .event({ pathParameters: { id: String(vehicle._id) } })
          .expectResult(async (result: any) => {
            const vehicleFromDB = await Vehicle.findOne({ _id: vehicle._id });

            expect(vehicleFromDB).toBeNull();

            const body = JSON.parse(result.body);

            const res = body.data;

            expect(res).toMatchObject({
              maker: vehicle.maker,
              model: vehicle.model,
              transmission: vehicle.transmission,
              fuelType: vehicle.fuelType,
              mileage: vehicle.mileage,
              vehicleType: vehicle.vehicleType,
              dealer: String(vehicle.dealer),
            });
          });
      });
    });

    describe("using non-existent id", () => {
      it("returns not found error", async () => {
        await Vehicle.create(await mockVehicle());

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
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

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

  describe("update vehicle", () => {
    const updateData = {
      maker: "Test Car Maker",
      model: "Test Car Model",
      transmission: VehicleTransmission.ManualGearbox,
      fuelType: FuelType.Electric,
      mileage: 50000,
      vehicleType: VehicleType.EstateCar,
    };
    describe("using valid and existing id", () => {
      it("updates vehicle correctly", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        await lambdaTester(update)
          .event({
            pathParameters: { id: String(vehicle._id) },
            body: JSON.stringify(updateData),
          })
          .expectResult(async (result: any) => {
            const vehicleFromDB = await Vehicle.findOne({ _id: vehicle._id });

            expect(vehicleFromDB).toMatchObject(updateData);

            const body = JSON.parse(result.body);

            const vehicleRes = body.data;

            expect(vehicleRes).toMatchObject(updateData);
          });
      });

      describe.each(createVehicleEnumFields)(
        "using an invalid enum value '%p'",
        (field) => {
          it("returns input validation error", async () => {
            const vehicle = await Vehicle.create(await mockVehicle());
            await lambdaTester(update)
              .event({
                pathParameters: { id: String(vehicle._id) },
                body: JSON.stringify({
                  ...updateData,
                  [field]: "invalid-enum",
                }),
              })
              .expectResult(async (result: any) => {
                const body = JSON.parse(result.body);

                const errorMsgParsed = JSON.parse(body.message)[0].message;

                expect(errorMsgParsed).toContain("Invalid enum value");
              });
          });
        }
      );
    });

    describe("using non-existent id", () => {
      it("returns not found error", async () => {
        await Vehicle.create(await mockVehicle());

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
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

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
