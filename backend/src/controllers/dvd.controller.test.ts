import axios, { AxiosError } from "axios";
import { Request, Response } from "express";
import DVD from "../models/dvd.model";
import { cleanTitleForSearch } from "../utils/cleanTitle.utils";
import {
  addDVDFromTMDB,
  addManualDVD,
  createDVD,
  deleteDVD,
  getAllDVDs,
  getDVDById,
  getDVDByTitle,
  scanDVD,
  updateDVD,
} from "./dvd.controller";

// Mock dependencies
jest.mock("../models/dvd.model");
jest.mock("axios");
jest.mock("../utils/cleanTitle.utils");

const mockedDVD = DVD as jest.Mocked<typeof DVD>;
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedCleanTitleForSearch = cleanTitleForSearch as jest.Mock;

describe("DVD Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let resStatus: jest.Mock;
  let resJson: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    resJson = jest.fn();
    resStatus = jest.fn().mockReturnValue({ json: resJson });
    res = {
      status: resStatus,
    };
    req = {};
  });

  describe("createDVD", () => {
    it("should create a new DVD and return 201", async () => {
      const newDVDData = { title: "Test DVD", eanCode: "12345" };
      req.body = newDVDData;

      const savedDVD = { ...newDVDData, _id: "someId" };
      mockedDVD.prototype.save = jest.fn().mockResolvedValue(savedDVD);

      await createDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(201);
      expect(resJson).toHaveBeenCalledWith(savedDVD);
    });

    it("should return 409 if DVD with EAN code already exists", async () => {
      req.body = { title: "Test DVD", eanCode: "12345" };
      const error = { code: 11000, message: "Duplicate key" };
      mockedDVD.prototype.save = jest.fn().mockRejectedValue(error);

      await createDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(409);
      expect(resJson).toHaveBeenCalledWith({
        message: "A DVD with this EAN code already exists",
      });
    });

    it("should return 500 for other errors", async () => {
      req.body = { title: "Test DVD", eanCode: "12345" };
      const error = new Error("Something went wrong");
      mockedDVD.prototype.save = jest.fn().mockRejectedValue(error);

      await createDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(500);
      expect(resJson).toHaveBeenCalledWith({
        message: "Internal Server Error",
        error: "Something went wrong",
      });
    });
  });

  describe("getAllDVDs", () => {
    it("should return all DVDs with status 200", async () => {
      const dvds = [{ title: "DVD 1" }, { title: "DVD 2" }];
      (mockedDVD.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockResolvedValue(dvds),
      });

      await getAllDVDs(req as Request, res as Response);

      expect(mockedDVD.find).toHaveBeenCalledWith({});
      expect(resStatus).toHaveBeenCalledWith(200);
      expect(resJson).toHaveBeenCalledWith(dvds);
    });
  });

  describe("getDVDById", () => {
    it("should return a DVD by ID with status 200", async () => {
      const dvd = { _id: "1", title: "Test DVD" };
      req.params = { id: "1" };
      (mockedDVD.findById as jest.Mock).mockResolvedValue(dvd);

      await getDVDById(req as Request, res as Response);

      expect(mockedDVD.findById).toHaveBeenCalledWith("1");
      expect(resStatus).toHaveBeenCalledWith(200);
      expect(resJson).toHaveBeenCalledWith(dvd);
    });

    it("should return 404 if DVD not found", async () => {
      req.params = { id: "1" };
      (mockedDVD.findById as jest.Mock).mockResolvedValue(null);

      await getDVDById(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(404);
      expect(resJson).toHaveBeenCalledWith({ message: "DVD not found" });
    });
  });

  describe("updateDVD", () => {
    it("should update a DVD and return 200", async () => {
      const id = "1";
      const updatedData = { title: "Updated Title" };
      req.params = { id };
      req.body = updatedData;

      (mockedDVD.findById as jest.Mock).mockResolvedValue({ _id: id });
      (mockedDVD.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: id,
        ...updatedData,
      });

      await updateDVD(req as Request, res as Response);

      expect(mockedDVD.findById).toHaveBeenCalledWith(id);
      expect(mockedDVD.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updatedData,
        {
          new: true,
        }
      );
      expect(resStatus).toHaveBeenCalledWith(200);
      expect(resJson).toHaveBeenCalledWith(updatedData);
    });

    it("should return 404 if DVD to update is not found", async () => {
      req.params = { id: "1" };
      (mockedDVD.findById as jest.Mock).mockResolvedValue(null);

      await updateDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(404);
      expect(resJson).toHaveBeenCalledWith({ message: "DVD not found" });
    });
  });

  describe("deleteDVD", () => {
    it("should delete a DVD and return 200", async () => {
      const id = "1";
      req.params = { id };

      (mockedDVD.findById as jest.Mock).mockResolvedValue({ _id: id });
      (mockedDVD.findByIdAndDelete as jest.Mock).mockResolvedValue({});

      await deleteDVD(req as Request, res as Response);

      expect(mockedDVD.findById).toHaveBeenCalledWith(id);
      expect(mockedDVD.findByIdAndDelete).toHaveBeenCalledWith(id);
      expect(resStatus).toHaveBeenCalledWith(200);
      expect(resJson).toHaveBeenCalledWith({
        message: "DVD deleted successfully",
      });
    });
  });

  describe("scanDVD", () => {
    it("should return 400 if eanCode is missing", async () => {
      req.body = {};
      await scanDVD(req as Request, res as Response);
      expect(resStatus).toHaveBeenCalledWith(400);
      expect(resJson).toHaveBeenCalledWith({
        message: "EAN code is required.",
      });
    });

    it("should return 409 if EAN code already exists", async () => {
      req.body = { eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue({ eanCode: "123" });

      await scanDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(409);
      expect(resJson).toHaveBeenCalledWith({
        message: "A DVD with this EAN code already exists.",
      });
    });

    it("should successfully scan and return movie results", async () => {
      req.body = { eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);

      mockedAxios.get
        .mockResolvedValueOnce({
          data: { items: [{ title: "Test Movie Title" }] },
        })
        .mockResolvedValueOnce({
          data: {
            results: [
              {
                id: 1,
                title: "Test Movie",
                release_date: "2023-01-01",
                poster_path: "/poster.jpg",
              },
            ],
          },
        });

      mockedCleanTitleForSearch.mockReturnValue("Test Movie Title");

      await scanDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(200);
      expect(resJson).toHaveBeenCalledWith([
        {
          tmdbId: 1,
          title: "Test Movie",
          releaseYear: "2023",
          imageUrl: "https://image.tmdb.org/t/p/w200/poster.jpg",
        },
      ]);
    });

    it("should handle Axios errors", async () => {
      req.body = { eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);
      const error = new Error("Network Error") as AxiosError;
      error.isAxiosError = true;
      error.response = {
        status: 503,
        data: "Service Unavailable",
        statusText: "Service Unavailable",
        headers: {},
        config: {} as any,
      };
      mockedAxios.get.mockRejectedValue(error);

      await scanDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(503);
      expect(resJson).toHaveBeenCalledWith({
        message: "External API Error",
        details: "Network Error",
      });
    });
  });

  describe("addDVDFromTMDB", () => {
    it("should add a DVD from TMDB data and return 200", async () => {
      req.body = { tmdbId: 1, eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);

      mockedAxios.get
        .mockResolvedValueOnce({
          // Movie details
          data: {
            title: "Test Movie",
            poster_path: "/poster.jpg",
            release_date: "2023-01-01",
            production_companies: [{ name: "Test Studios" }],
          },
        })
        .mockResolvedValueOnce({
          // Credits
          data: {
            crew: [{ job: "Director", name: "Test Director" }],
          },
        });

      const savedDVD = { _id: "someId" };
      mockedDVD.prototype.save = jest.fn().mockResolvedValue(savedDVD);

      await addDVDFromTMDB(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(200);
      expect(resJson).toHaveBeenCalledWith(savedDVD);
      expect(mockedDVD.prototype.save).toHaveBeenCalled();
    });
  });

  describe("addManualDVD", () => {
    it("should manually add a DVD and return 201", async () => {
      const manualData = {
        eanCode: "manual123",
        title: "Manual Movie",
        releaseYear: 2020,
      };
      req.body = manualData;

      const savedDVD = { ...manualData, _id: "manualId" };
      mockedDVD.prototype.save = jest.fn().mockResolvedValue(savedDVD);

      await addManualDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(201);
      expect(resJson).toHaveBeenCalledWith(savedDVD);
    });
  });

  describe("getDVDByTitle", () => {
    it("should return a DVD by title with status 200", async () => {
      const dvd = { _id: "1", title: "Finding Nemo" };
      req.params = { title: "Finding Nemo" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(dvd);

      await getDVDByTitle(req as Request, res as Response);

      expect(mockedDVD.findOne).toHaveBeenCalledWith({ title: "Finding Nemo" });
      expect(resStatus).toHaveBeenCalledWith(200);
      expect(resJson).toHaveBeenCalledWith(dvd);
    });

    it("should return 404 if DVD not found by title", async () => {
      req.params = { title: "Non Existent" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);

      await getDVDByTitle(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(404);
      expect(resJson).toHaveBeenCalledWith({ message: "DVD not found" });
    });
  });
});
