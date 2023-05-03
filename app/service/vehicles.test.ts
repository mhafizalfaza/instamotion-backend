import { VehiclesService } from "./vehicles";
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
import { UpdateVehicle } from "../model/validator/input/vehicle/updateVehicle";
import { CreateVehicle } from "../model/validator/input/vehicle/createVehicle";

// For accessing protected methods
class VehiclesServicePublic extends VehiclesService {
  public createVehicle(data: CreateVehicle) {
    return super.createVehicle(data);
  }

  public findVehicles() {
    return super.findVehicles();
  }

  public findOneVehicleById(id: string) {
    return super.findOneVehicleById(id);
  }

  public updateVehicles(id: string, data: UpdateVehicle) {
    return super.updateVehicles(id, data);
  }

  public deleteOneVehicleById(id: string) {
    return super.deleteOneVehicleById(id);
  }

  public findVehiclesByDealerId(id: string) {
    return super.findVehiclesByDealerId(id);
  }
}

describe("vehicles service tests", () => {
  const vehiclesService = new VehiclesServicePublic(Vehicle);

  beforeAll(async () => await connectDatabase());

  afterEach(async () => await clearDatabase());

  afterAll(async () => await closeDatabase());

  describe("createVehicle", () => {
    describe("using sufficient and valid data", () => {
      it("creates vehicle successfully", async () => {
        const vehicle = await mockVehicle();

        const vehicleRes = await vehiclesService.createVehicle(vehicle);

        const expectObj = {
          maker: vehicle.maker,
          model: vehicle.model,
        };

        const vehicleFromDB = await Vehicle.findOne(expectObj);

        expect(vehicleFromDB).toMatchObject(expectObj);

        expect(vehicleRes).toMatchObject(expectObj);
      });
    });
  });

  describe("findOne vehicle", () => {
    describe("using valid and existing id", () => {
      it("returns one vehicle correctly", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        const vehicleRes = await vehiclesService.findOneVehicleById(
          String(vehicle._id)
        );

        expect(vehicleRes).toMatchObject({
          maker: vehicle.maker,
          model: vehicle.model,
          transmission: vehicle.transmission,
          fuelType: vehicle.fuelType,
          mileage: vehicle.mileage,
          vehicleType: vehicle.vehicleType,
        });
      });
    });

    describe("using non-existent id", () => {
      it("returns null", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        const vehicleRes = await vehiclesService.findOneVehicleById(
          String(new mongoose.Types.ObjectId())
        );

        expect(vehicleRes).toBeNull();
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        await expect(
          vehiclesService.findOneVehicleById("invalid-id")
        ).rejects.toThrow(
          'Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Vehicle"'
        );
      });
    });
  });

  describe("find vehicles", () => {
    it("returns all vehicles correctly", async () => {
      const vehicle1 = await Vehicle.create(await mockVehicle());
      const vehicle2 = await Vehicle.create(await mockVehicle());
      const vehicle3 = await Vehicle.create(await mockVehicle());

      const vehiclesRes = await vehiclesService.findVehicles();

      const vehicle1Res = vehiclesRes.find(
        (eachItem) => String(eachItem._id) === String(vehicle1._id)
      );

      const vehicle2Res = vehiclesRes.find(
        (eachItem) => String(eachItem._id) === String(vehicle2._id)
      );

      const vehicle3Res = vehiclesRes.find(
        (eachItem) => String(eachItem._id) === String(vehicle3._id)
      );

      expect(vehiclesRes).toHaveLength(3);

      expect(vehicle1Res).toMatchObject({
        maker: vehicle1.maker,
        model: vehicle1.model,
        transmission: vehicle1.transmission,
        fuelType: vehicle1.fuelType,
        mileage: vehicle1.mileage,
        vehicleType: vehicle1.vehicleType,
      });
      expect(vehicle2Res).toMatchObject({
        maker: vehicle2.maker,
        model: vehicle2.model,
        transmission: vehicle2.transmission,
        fuelType: vehicle2.fuelType,
        mileage: vehicle2.mileage,
        vehicleType: vehicle2.vehicleType,
      });
      expect(vehicle3Res).toMatchObject({
        maker: vehicle3.maker,
        model: vehicle3.model,
        transmission: vehicle3.transmission,
        fuelType: vehicle3.fuelType,
        mileage: vehicle3.mileage,
        vehicleType: vehicle3.vehicleType,
      });
    });
  });

  describe("deleteOne vehicle", () => {
    describe("using valid and existing id", () => {
      it("deletes vehicle successfully", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        const vehicleRes = await vehiclesService.deleteOneVehicleById(
          String(vehicle._id)
        );

        const vehicleFromDB = await Vehicle.findOne({ _id: vehicle._id });

        expect(vehicleFromDB).toBeNull();

        expect(vehicleRes).toMatchObject({
          maker: vehicle.maker,
          model: vehicle.model,
          transmission: vehicle.transmission,
          fuelType: vehicle.fuelType,
          mileage: vehicle.mileage,
          vehicleType: vehicle.vehicleType,
        });
      });
    });

    describe("using non-existent id", () => {
      it("returns not found error", async () => {
        await Vehicle.create(await mockVehicle());

        const vehicleRes = await vehiclesService.deleteOneVehicleById(
          String(new mongoose.Types.ObjectId())
        );

        expect(vehicleRes).toBeNull();
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        await expect(
          vehiclesService.deleteOneVehicleById("invalid-id")
        ).rejects.toThrow(
          'Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Vehicle"'
        );
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

        const vehicleRes = await vehiclesService.updateVehicles(
          String(vehicle._id),
          updateData
        );

        const vehicleFromDB = await Vehicle.findOne({ _id: vehicle._id });

        expect(vehicleFromDB).toMatchObject(updateData);

        expect(vehicleRes).toMatchObject(updateData);
      });
    });

    describe("using non-existent id", () => {
      it("returns not found error", async () => {
        await Vehicle.create(await mockVehicle());

        const vehicleRes = await vehiclesService.updateVehicles(
          String(new mongoose.Types.ObjectId()),
          updateData
        );

        expect(vehicleRes).toBeNull();
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        await Vehicle.create(await mockVehicle());

        await expect(
          vehiclesService.updateVehicles("invalid-id", updateData)
        ).rejects.toThrow(
          'Cast to ObjectId failed for value "invalid-id" (type string) at path "_id" for model "Vehicle"'
        );
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

        const vehiclesRes = await vehiclesService.findVehiclesByDealerId(
          dealerId
        );

        const vehicle1Res = vehiclesRes.find(
          (eachItem) => String(eachItem._id) === String(vehicle1._id)
        );

        const vehicle2Res = vehiclesRes.find(
          (eachItem) => String(eachItem._id) === String(vehicle2._id)
        );

        const vehicle3Res = vehiclesRes.find(
          (eachItem) => String(eachItem._id) === String(vehicle3._id)
        );

        // It should return only 3 vehicles despite the 4th vehicle created
        expect(vehiclesRes).toHaveLength(3);

        expect(vehicle1Res).toMatchObject({
          maker: vehicle1.maker,
          model: vehicle1.model,
          transmission: vehicle1.transmission,
          fuelType: vehicle1.fuelType,
          mileage: vehicle1.mileage,
          vehicleType: vehicle1.vehicleType,
        });
        expect(vehicle2Res).toMatchObject({
          maker: vehicle2.maker,
          model: vehicle2.model,
          transmission: vehicle2.transmission,
          fuelType: vehicle2.fuelType,
          mileage: vehicle2.mileage,
          vehicleType: vehicle2.vehicleType,
        });
        expect(vehicle3Res).toMatchObject({
          maker: vehicle3.maker,
          model: vehicle3.model,
          transmission: vehicle3.transmission,
          fuelType: vehicle3.fuelType,
          mileage: vehicle3.mileage,
          vehicleType: vehicle3.vehicleType,
        });
      });
    });

    describe("using non-existent id", () => {
      it("returns empty array", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        const vehiclesRes = await vehiclesService.findVehiclesByDealerId(
          String(new mongoose.Types.ObjectId())
        );

        expect(vehiclesRes).toHaveLength(0);
      });
    });

    describe("using invalid id", () => {
      it("returns invalid input error", async () => {
        const vehicle = await Vehicle.create(await mockVehicle());

        expect(vehicle._id).toBeDefined();

        await expect(
          vehiclesService.findVehiclesByDealerId("invalid-id")
        ).rejects.toThrow(
          'Cast to ObjectId failed for value "invalid-id" (type string) at path "dealer" for model "Vehicle"'
        );
      });
    });
  });
});
