import { VehiclesController } from "./vehicles";
import {
  FuelType,
  Vehicle,
  VehicleTransmission,
  VehicleType,
} from "../model/vehicle";
import {
  clearDatabase,
  closeDatabase,
  connectDatabase,
} from "../utils/tests/db";
import { mockVehicle } from "../utils/tests/vehicles.mock";
import mongoose from "mongoose";
import { createVehicleValidator } from "../model/validator/input/vehicle/createVehicle";
import { zodKeys } from "../utils/helpers";

describe("vehicles controller tests", () => {
  const createVehicleRequiredFields = zodKeys(createVehicleValidator);
  const createVehicleEnumFields = zodKeys(createVehicleValidator, {
    enumOnly: true,
  });

  const vehiclesController = new VehiclesController(Vehicle);

  beforeAll(async () => await connectDatabase());

  afterEach(async () => await clearDatabase());

  afterAll(async () => await closeDatabase());

  describe("create vehicle", () => {
    describe("using sufficient and valid data", () => {
      it("creates vehicle successfully", async () => {
        const vehicle = await mockVehicle();

        const vehicleRes = await vehiclesController.create({
          body: JSON.stringify(vehicle),
        });

        const expectObj = {
          maker: vehicle.maker,
          model: vehicle.model,
        };

        const vehicleFromDB = await Vehicle.findOne(expectObj);

        const vehicleResBody = JSON.parse(vehicleRes.body);

        expect(vehicleFromDB).toMatchObject(expectObj);

        expect(vehicleResBody.data).toMatchObject(expectObj);
      });
    });

    describe.each(createVehicleRequiredFields)(
      "missing a required field '%p'",
      (field) => {
        it("returns input validation error", async () => {
          const vehicle = await mockVehicle();

          const vehicleRes = await vehiclesController.create({
            body: JSON.stringify({
              ...vehicle,
              [field]: undefined,
            }),
          });
          const body = JSON.parse(vehicleRes.body);

          const errorMsgParsed = JSON.parse(body.message)[0].message;

          expect(errorMsgParsed).toEqual("Required");
        });
      }
    );

    describe("with an invalid field", () => {
      it("creates vehicle correctly without invalid field", async () => {
        const vehicle = await mockVehicle();

        const invalidField = "invalid-field";

        const res = await vehiclesController.create({
          body: JSON.stringify({
            ...vehicle,
            [invalidField]: "invalidField",
          }),
        });

        const vehicleFromDB = await Vehicle.findOne({
          maker: vehicle.maker,
          model: vehicle.model,
        });

        const vehicleRes = JSON.parse(res.body).data;

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

    describe.each(createVehicleEnumFields)(
      "using an invalid enum value '%p'",
      (field) => {
        it("returns input validation error", async () => {
          const vehicle = await mockVehicle();

          const result = await vehiclesController.create({
            body: JSON.stringify({
              ...vehicle,
              [field]: "invalid-enum",
            }),
          });

          const body = JSON.parse(result.body);
          const errorMsgParsed = JSON.parse(body.message)[0].message;

          expect(errorMsgParsed).toContain("Invalid enum value");
        });
      }
    );
  });

  describe("findOne vehicle", () => {
    describe("using valid and existing id", () => {
      it("returns one vehicle correctly", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        const vehicleRes = await vehiclesController.findOne({
          pathParameters: {
            id: String(vehicle._id),
          },
        });

        const vehicleResBody = JSON.parse(vehicleRes.body);

        expect(vehicleResBody.data).toMatchObject({
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

    describe("using non-existent id", () => {
      it("returns null", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        const vehicleRes = await vehiclesController.findOne({
          pathParameters: { id: String(new mongoose.Types.ObjectId()) },
        });

        const vehicleResBody = JSON.parse(vehicleRes.body);

        expect(vehicleResBody.data).toBeNull();
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        const vehicleRes = await vehiclesController.findOne({
          pathParameters: { id: "invalid-id" },
        });

        const vehicleResBody = JSON.parse(vehicleRes.body);

        const errorMsgParsed = JSON.parse(vehicleResBody.message)[0].message;

        expect(errorMsgParsed).toEqual("Invalid input");
      });
    });
  });

  describe("find vehicles", () => {
    it("returns all vehicles correctly", async () => {
      const vehicle1 = await Vehicle.create(await mockVehicle());
      const vehicle2 = await Vehicle.create(await mockVehicle());
      const vehicle3 = await Vehicle.create(await mockVehicle());

      const vehiclesRes = await vehiclesController.find();

      const vehiclesResBody = JSON.parse(vehiclesRes.body);

      const vehiclesResData = vehiclesResBody.data;

      const vehicle1Res = vehiclesResData.find(
        (eachItem) => eachItem._id === String(vehicle1._id)
      );

      const vehicle2Res = vehiclesResData.find(
        (eachItem) => eachItem._id === String(vehicle2._id)
      );

      const vehicle3Res = vehiclesResData.find(
        (eachItem) => eachItem._id === String(vehicle3._id)
      );

      expect(vehiclesResData).toHaveLength(3);

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

  describe("deleteOne vehicle", () => {
    describe("using valid and existing id", () => {
      it("deletes vehicle successfully", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        const vehicleRes = await vehiclesController.deleteOne({
          pathParameters: { id: String(vehicle._id) },
        });

        const vehicleFromDB = await Vehicle.findOne({ _id: vehicle._id });

        expect(vehicleFromDB).toBeNull();

        const vehicleResBody = JSON.parse(vehicleRes.body);

        expect(vehicleResBody.data).toMatchObject({
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

    describe("using non-existent id", () => {
      it("returns not found error", async () => {
        await Vehicle.create(await mockVehicle());

        const vehicleRes = await vehiclesController.deleteOne({
          pathParameters: { id: String(new mongoose.Types.ObjectId()) },
        });

        const vehicleResBody = JSON.parse(vehicleRes.body);

        expect(vehicleResBody).toMatchObject({
          code: 1010,
          message: "The data was not found! May have been deleted!",
        });
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        const vehicleRes = await vehiclesController.deleteOne({
          pathParameters: {
            id: "invalid-id",
          },
        });

        const vehicleResBody = JSON.parse(vehicleRes.body);

        const errorMsgParsed = JSON.parse(vehicleResBody.message)[0].message;

        expect(errorMsgParsed).toEqual("Invalid input");
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
      it("updates vehicle successfully", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        const vehicleRes = await vehiclesController.update({
          pathParameters: { id: String(vehicle._id) },
          body: JSON.stringify(updateData),
        });

        const vehicleFromDB = await Vehicle.findOne({ _id: vehicle._id });

        expect(vehicleFromDB).toMatchObject(updateData);

        const vehicleResBody = JSON.parse(vehicleRes.body);

        expect(vehicleResBody.data).toMatchObject(updateData);
      });
    });

    describe("using non-existent id", () => {
      it("returns not found error", async () => {
        await Vehicle.create(await mockVehicle());

        const vehicleRes = await vehiclesController.update({
          pathParameters: { id: String(new mongoose.Types.ObjectId()) },
          body: JSON.stringify(updateData),
        });

        const vehicleResBody = JSON.parse(vehicleRes.body);

        expect(vehicleResBody).toMatchObject({
          code: 1010,
          message: "The data was not found!",
        });
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        await Vehicle.create(await mockVehicle());

        const vehicleRes = await vehiclesController.update({
          pathParameters: { id: "invalid-id" },
          body: JSON.stringify(updateData),
        });

        const vehicleResBody = JSON.parse(vehicleRes.body);

        const errorMsgParsed = JSON.parse(vehicleResBody.message)[0].message;

        expect(errorMsgParsed).toEqual("Invalid input");
      });
    });

    describe.each(createVehicleEnumFields)(
      "using an invalid enum value '%p'",
      (field) => {
        it("returns input validation error", async () => {
          const vehicle = await Vehicle.create(await mockVehicle());

          const result = await vehiclesController.update({
            pathParameters: { id: String(vehicle._id) },
            body: JSON.stringify({
              ...updateData,
              [field]: "invalid-enum",
            }),
          });

          const body = JSON.parse(result.body);
          const errorMsgParsed = JSON.parse(body.message)[0].message;

          expect(errorMsgParsed).toContain("Invalid enum value");
        });
      }
    );
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

        const res = await vehiclesController.findByDealerId({
          pathParameters: { id: dealerId },
        });

        const vehiclesRes = JSON.parse(res.body).data;

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

    describe("using non-existent id", () => {
      it("returns empty array", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        const res = await vehiclesController.findByDealerId({
          pathParameters: { id: String(new mongoose.Types.ObjectId()) },
        });

        const vehiclesRes = JSON.parse(res.body);

        expect(vehiclesRes.data).toHaveLength(0);
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        const res = await vehiclesController.findByDealerId({
          pathParameters: { id: "invalid-id" },
        });

        const body = JSON.parse(res.body);

        const errorMsgParsed = JSON.parse(body.message)[0].message;

        expect(errorMsgParsed).toEqual("Invalid input");
      });
    });
  });
});
