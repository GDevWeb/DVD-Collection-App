/**
 * @fileoverview Utility functions for cleaning and processing DVD titles.
 */

/**
 * Cleans up a product title for better search results, especially for movie databases.
 * This function performs several steps:
 * 1. Converts the title to lowercase.
 * 2. Removes common DVD/Blu-ray keywords and other non-title information (e.g., "DVD", "Blu-ray", "edition", year numbers, "-disc", "blister pack", "by", "movie", "no. X").
 * 3. Removes specific punctuation marks like double quotes and colons.
 * 4. Trims leading/trailing whitespace and replaces multiple internal spaces with a single space.
 *
 * @param {string} title - The original product title to be cleaned.
 * @returns {string} The cleaned title, optimized for search queries.
 */

export const cleanTitleForSearch = (title: string): string => {
  let cleanString = title.toLowerCase();

  cleanString = cleanString.replace(
    /dvd|blu-ray|\bset\b|edition|(\d{4})|-disc|blister pack|by|movie|no\.\s\d+/gi,
    ""
  );

  cleanString = cleanString.replace(/[",:]/g, "");

  cleanString = cleanString.trim().replace(/\s+/g, " ");

  return cleanString;
};
