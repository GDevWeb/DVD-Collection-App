# My Personal DVD & Game Collection App: A Full-Stack Application

This full-stack application allows users to build and manage a personal collection of DVDs and video games. Key features include:

## Project Features

- **Barcode Scanning:** Easily add new items by scanning their EAN (barcode) using your mobile device's camera.
- **Robust Data Fetching:** The backend API performs a multi-step lookup using multiple external APIs to find the most accurate product details.
- **User-Driven Experience:** If multiple matches are found, the user can select the correct movie from a list of options.
- **Manual Input Fallback:** If a product is not found, the user can manually enter the item's details, ensuring no item is left out of their collection.
- **Personal Database:** All collection items are securely saved to a personal database.
- **Mobile-Friendly Interface:** View and manage your entire collection with ease on any mobile device.

### Technology Stack

- **Frontend:** Angular & Ionic (for a cross-platform mobile application)
- **Backend:** Node.js, Express.js & TypeScript
- **Database:** MongoDB
- **External APIs:** **UPCitemdb** (for EAN lookup) and **The Movie Database (TMDb)** (for comprehensive movie data).
  cdir
