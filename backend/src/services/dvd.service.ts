import axios from "axios";
import dotenv from "dotenv";
import { IDVD } from "../models/dvd.model";

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
