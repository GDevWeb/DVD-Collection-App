import axios from "axios";
import dotenv from "dotenv";
import DVD, { IDVD } from "../models/dvd.model";
import { cleanTitleForSearch } from "../utils/cleanTitle.utils";

dotenv.config();
const UPC_API_URL = process.env.UPC_API_URL;
const TMDB_API_URL = process.env.TMDB_API_URL;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export const fetchProductDetailsFromUPC = async (eanCode: string) => {
  const upcResponse = await axios.get(`${UPC_API_URL}?upc=${eanCode}`);
  return upcResponse.data;
};

export const searchMovieOnTMDB = async (cleanTitle: string) => {
  const tmdbResponse: any = await axios.get(
    `${TMDB_API_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
      cleanTitle
    )}`
  );
  return tmdbResponse.data.results;
};

export const fetchMovieDetailsFromTMDB = async (tmdbId: number) => {
  const movieResponse = await axios.get(
    `${TMDB_API_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}`
  );
  return movieResponse.data;
};

export const fetchMovieCreditsFromTMDB = async (tmdbId: number) => {
  const creditResponse = await axios.get(
    `${TMDB_API_URL}/movie/${tmdbId}/credits?api_key=${TMDB_API_KEY}`
  );
  return creditResponse.data;
};

export const extractDirectorName = (creditData: any) => {
  const director = creditData.crew.find(
    (member: any) => member.job === "Director"
  );
  return director ? director.name : null;
};

export const formatTMDBMovieData = (
  movieData: any,
  directorName: string | null,
  eanCode: string
): IDVD => {
  return {
    eanCode: eanCode,
    title: movieData.title,
    comments: "",
    imageUrl: movieData.poster_path
      ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
      : "https://placehold.co/300x400?text=Cover+Not+Found",
    releaseYear: movieData.release_date
      ? parseInt(movieData.release_date.substring(0, 4))
      : undefined,
    director: directorName,
    brand: movieData.production_companies
      ? movieData.production_companies[0]?.name
      : "N/A",
  } as IDVD;
};

/**
 * Fetches product details from the UPCitemdb API using the provided EAN code.
 * @param {string} eanCode - The EAN code of the product.
 * @returns {Promise<any>} The product details from UPCitemdb.
 */
export const getMovieSearchResults = async (eanCode: string) => {
  const upcData: any = await fetchProductDetailsFromUPC(eanCode);
  if (!upcData.items || upcData.items.length === 0) {
    throw new Error("Product not found on UPCitemdb.");
  }

  const product = upcData.items[0];
  const productTitle = product.title || product.product_name || null;
  if (!productTitle) {
    throw new Error("Product title not found.");
  }

  const cleanTitle = cleanTitleForSearch(productTitle);
  if (cleanTitle.length < 3) {
    throw new Error("Cleaned title is too short to search on TMDb.");
  }

  const tmdbResults = await searchMovieOnTMDB(cleanTitle);
  if (tmdbResults.length === 0) {
    throw new Error(`Movie not found on TMDb for title: "${cleanTitle}"`);
  }

  const results = tmdbResults.slice(0, 5).map((movie: any) => ({
    tmdbId: movie.id,
    title: movie.title,
    releaseYear: movie.release_date ? movie.release_date.substring(0, 4) : null,
    imageUrl: movie.poster_path
      ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
      : null,
  }));

  return results;
};

/**
 * Adds a DVD to the database using data fetched from TMDb.
 * @param {number} tmdbId - The TMDb ID of the movie.
 * @param {string} eanCode - The EAN code of the DVD.
 * @returns {Promise<IDVD>} The saved DVD document.
 * @throws {Error} If a DVD with the EAN code already exists.
 */
export const addDVDFromTMDBService = async (
  tmdbId: number,
  eanCode: string
) => {
  const existing = await DVD.findOne({ eanCode });
  if (existing) {
    throw new Error("A DVD with this EAN code already exists.");
  }

  const movieData = await fetchMovieDetailsFromTMDB(tmdbId);
  const creditData = await fetchMovieCreditsFromTMDB(tmdbId);
  const directorName = extractDirectorName(creditData);

  const newDVDData = formatTMDBMovieData(movieData, directorName, eanCode);
  const newDVD = new DVD(newDVDData);
  const savedDVD = await newDVD.save();
  return savedDVD;
};

// Add this new function for manual adds
export const addManualDVDService = async (data: any) => {
  const newDVD = new DVD(data);
  const savedDVD = await newDVD.save();
  return savedDVD;
};
