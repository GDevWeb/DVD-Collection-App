import axios from "axios";
import { Request, Response } from "express";
import DVD from "../models/dvd.model";
import * as dvdService from "../services/dvd.service";
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

// Mock dependencies avec configuration complète pour axios
jest.mock("../models/dvd.model");
jest.mock("../services/dvd.service");
jest.mock("../utils/cleanTitle.utils");

// Mock axios avec une approche différente
jest.mock("axios", () => {
  const originalAxios = jest.requireActual("axios");
  return {
    ...originalAxios,
    default: {
      ...originalAxios.default,
      isAxiosError: jest.fn(),
    },
    isAxiosError: jest.fn(),
    AxiosError: class MockAxiosError extends Error {
      public isAxiosError = true;
      public code?: string;
      public config?: any;
      public request?: any;
      public response?: any;

      constructor(
        message: string,
        code?: string,
        config?: any,
        request?: any,
        response?: any
      ) {
        super(message);
        this.name = "AxiosError";
        this.code = code;
        this.config = config;
        this.request = request;
        this.response = response;
      }
    },
  };
});

const mockedDVD = DVD as jest.Mocked<typeof DVD>;
const mockedDvdService = dvdService as jest.Mocked<typeof dvdService>;
const mockedCleanTitleForSearch = cleanTitleForSearch as jest.MockedFunction<
  typeof cleanTitleForSearch
>;

// Cast axios.isAxiosError directement
const mockedAxiosIsAxiosError = axios.isAxiosError as jest.MockedFunction<
  typeof axios.isAxiosError
>;

// Classe AxiosError pour les tests
const { AxiosError } = axios as any;

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
    req = {
      body: {},
      params: {},
    };
  });

  describe("createDVD", () => {
    it("should create a new DVD and return 201", async () => {
      const newDVDData = { title: "Test DVD", eanCode: "12345" };
      req.body = newDVDData;

      const savedDVD = { ...newDVDData, _id: "someId" };
      mockedDVD.prototype.save = jest.fn().mockResolvedValue(savedDVD);

      await createDVD(req as Request, res as Response);

      expect(mockedDVD).toHaveBeenCalledWith(newDVDData);
      expect(mockedDVD.prototype.save).toHaveBeenCalled();
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

    it("should return 404 if DVD to delete is not found", async () => {
      req.params = { id: "1" };
      (mockedDVD.findById as jest.Mock).mockResolvedValue(null);

      await deleteDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(404);
      expect(resJson).toHaveBeenCalledWith({ message: "DVD not found" });
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
      mockedDvdService.fetchProductDetailsFromUPC.mockResolvedValue({
        items: [{ title: "Original Movie Title" }],
      });
      mockedCleanTitleForSearch.mockReturnValue("clean movie title");
      mockedDvdService.searchMovieOnTMDB.mockResolvedValue([
        {
          id: 1,
          title: "Test Movie",
          release_date: "2023-01-01",
          poster_path: "/poster.jpg",
        },
      ]);

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

    it("should handle Axios errors from services", async () => {
      req.body = { eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);

      // Créer une AxiosError avec la classe mockée
      const axiosError = new AxiosError(
        "Network Error",
        "NETWORK_ERROR",
        {} as any, // config
        null, // request
        {
          status: 503,
          data: "Service Unavailable",
          statusText: "Service Unavailable",
          headers: {},
          config: {} as any,
        }
      );

      // Mock isAxiosError pour retourner true
      mockedAxiosIsAxiosError.mockReturnValue(true);

      mockedDvdService.fetchProductDetailsFromUPC.mockRejectedValue(axiosError);

      await scanDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(503);
      expect(resJson).toHaveBeenCalledWith({
        message: "External API Error",
        details: "Network Error",
      });

      // Vérifier que isAxiosError a été appelé
      expect(mockedAxiosIsAxiosError).toHaveBeenCalledWith(axiosError);
    });

    it("should handle non-Axios errors", async () => {
      req.body = { eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);

      const regularError = new Error("Regular error");

      // Mock isAxiosError pour retourner false
      mockedAxiosIsAxiosError.mockReturnValue(false);

      mockedDvdService.fetchProductDetailsFromUPC.mockRejectedValue(
        regularError
      );

      await scanDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(500);
      expect(resJson).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });

    it("should return 404 if product not found on UPC", async () => {
      req.body = { eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);
      mockedDvdService.fetchProductDetailsFromUPC.mockResolvedValue({
        items: [],
      });

      await scanDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(404);
      expect(resJson).toHaveBeenCalledWith({
        message: "Product not found on UPCitemdb.",
      });
    });

    it("should return 404 if product title not found", async () => {
      req.body = { eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);
      mockedDvdService.fetchProductDetailsFromUPC.mockResolvedValue({
        items: [{}], // Pas de title
      });

      await scanDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(404);
      expect(resJson).toHaveBeenCalledWith({
        message: "Product title not found.",
      });
    });

    it("should return 404 if cleaned title is too short", async () => {
      req.body = { eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);
      mockedDvdService.fetchProductDetailsFromUPC.mockResolvedValue({
        items: [{ title: "Short" }],
      });
      mockedCleanTitleForSearch.mockReturnValue("ab"); // Trop court

      await scanDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(404);
      expect(resJson).toHaveBeenCalledWith({
        message: "Cleaned title is too short to search on TMDb.",
      });
    });

    it("should return 404 if no movies found on TMDB", async () => {
      req.body = { eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);
      mockedDvdService.fetchProductDetailsFromUPC.mockResolvedValue({
        items: [{ title: "Movie Title" }],
      });
      mockedCleanTitleForSearch.mockReturnValue("clean title");
      mockedDvdService.searchMovieOnTMDB.mockResolvedValue([]);

      await scanDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(404);
      expect(resJson).toHaveBeenCalledWith({
        message: 'Movie not found on TMDb for title: "clean title"',
      });
    });
  });

  describe("addDVDFromTMDB", () => {
    it("should add a DVD from TMDB data and return 200", async () => {
      req.body = { tmdbId: 1, eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(null);

      const movieData = { title: "Test Movie" };
      const creditData = { crew: [] };
      const directorName = "Test Director";
      const formattedData = { title: "Formatted Movie" };
      const savedDVD = { _id: "someId", ...formattedData };

      mockedDvdService.fetchMovieDetailsFromTMDB.mockResolvedValue(movieData);
      mockedDvdService.fetchMovieCreditsFromTMDB.mockResolvedValue(creditData);
      mockedDvdService.extractDirectorName.mockReturnValue(directorName);
      mockedDvdService.formatTMDBMovieData.mockReturnValue(
        formattedData as any
      );
      mockedDVD.prototype.save = jest.fn().mockResolvedValue(savedDVD);

      await addDVDFromTMDB(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(200);
      expect(resJson).toHaveBeenCalledWith(savedDVD);
      expect(mockedDVD.prototype.save).toHaveBeenCalled();
    });

    it("should return 400 if tmdbId or eanCode is missing", async () => {
      req.body = { tmdbId: 1 }; // Missing eanCode
      await addDVDFromTMDB(req as Request, res as Response);
      expect(resStatus).toHaveBeenCalledWith(400);
      expect(resJson).toHaveBeenCalledWith({
        message: "TMDb ID and EAN code are required.",
      });
    });

    it("should return 409 if DVD with EAN code already exists", async () => {
      req.body = { tmdbId: 1, eanCode: "123" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue({ eanCode: "123" });

      await addDVDFromTMDB(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(409);
      expect(resJson).toHaveBeenCalledWith({
        message: "A DVD with this EAN code already exists.",
      });
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

    it("should return 409 if DVD with EAN code already exists for manual add", async () => {
      const manualData = {
        eanCode: "manual123",
        title: "Manual Movie",
        releaseYear: 2020,
      };
      req.body = manualData;

      const error = { code: 11000, message: "Duplicate key" };
      mockedDVD.prototype.save = jest.fn().mockRejectedValue(error);

      await addManualDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(409);
      expect(resJson).toHaveBeenCalledWith({
        message: "A DVD with this EAN code already exists",
      });
    });

    it("should return 500 for other errors during manual add", async () => {
      const manualData = {
        eanCode: "manual123",
        title: "Manual Movie",
        releaseYear: 2020,
      };
      req.body = manualData;

      const error = new Error("Something went wrong during manual save");
      mockedDVD.prototype.save = jest.fn().mockRejectedValue(error);

      await addManualDVD(req as Request, res as Response);

      expect(resStatus).toHaveBeenCalledWith(500);
      expect(resJson).toHaveBeenCalledWith({
        message: "Internal Server Error",
      });
    });
  });

  describe("getDVDByTitle", () => {
    it("should return a DVD by title with status 200", async () => {
      const dvd = { _id: "1", title: "Finding Nemo" };
      req.params = { title: "Finding Nemo" };
      (mockedDVD.findOne as jest.Mock).mockResolvedValue(dvd);

      await getDVDByTitle(req as Request, res as Response);

      expect(mockedDVD.findOne).toHaveBeenCalledWith({
        title: { $regex: /Finding Nemo/i },
      });
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

  it("should return 500 for other errors in getDVDByTitle", async () => {
    req.params = { title: "Test Title" };
    const error = new Error("Database error");
    (mockedDVD.findOne as jest.Mock).mockRejectedValue(error);

    await getDVDByTitle(req as Request, res as Response);

    expect(resStatus).toHaveBeenCalledWith(500);
    expect(resJson).toHaveBeenCalledWith({
      message: "Internal Server Error",
      error: "Database error",
    });
  });
});
