# DVD Collection App Backend

## English version

A full-stack application designed to help users digitize and manage their personal DVD collection by scanning barcodes.

## Features

### MoSCoW Prioritization

This project follows the MoSCoW method for prioritizing features.

- **Must Have:** Core functionality to scan a DVD, find movie details from an external API, and save it to a personal list. The backend must be able to handle manual entries if an EAN code is not found.
- **Should Have:** A complete set of CRUD (Create, Read, Update, Delete) endpoints for managing the collection. Robust error handling for all API interactions.
- **Could Have:** Advanced features like filtering, searching by title, and a simple user interface.
- **Won't Have:** User authentication, social sharing features, or a complex recommendation engine in the initial version.

---

### **Project Scaffold**

The backend is structured to follow the **Model-View-Controller (MVC)** pattern with a dedicated service layer for business logic.

```
/backend
├── src/
│   ├── controllers/         # Manages request/response flow (thin layer)
│   ├── models/              # Mongoose schemas (the data models)
│   ├── routes/              # Express routing definitions
│   ├── services/            # All business logic and external API calls
│   ├── utils/               # Utility functions (e.g., database connection)
│   ├── server.ts            # The main entry point for the server
│   └── __tests__/           # Jest test suite for the API
├── .env.test                # Environment variables for testing
├── .env                     # Environment variables for development
├── jest.config.ts           # Jest test configuration
├── tsconfig.json            # TypeScript compiler configuration
└── package.json             # Project dependencies and scripts
```

---

### **Technical Stack**

- **Backend:** Node.js, Express.js, and TypeScript
- **Database:** MongoDB with Mongoose
- **External APIs:**
  - [UPCitemdb](https://upcitemdb.com/api/explorer): Used to translate EAN codes into product titles.
  - [The Movie Database (TMDb)](https://www.themoviedb.org/documentation/api): Used to retrieve rich, high-quality movie details.
- **Testing:** Jest and Supertest
- **Tooling:** Nodemon and Ts-node for live reloading

---

### **API Endpoints**

| Method       | Endpoint           | Description                                                                        |
| :----------- | :----------------- | :--------------------------------------------------------------------------------- |
| **`POST`**   | `/api/dvds/scan`   | Scans an EAN code and returns a list of potential movie matches.                   |
| **`POST`**   | `/api/dvds/add`    | Adds a DVD to the database after the user selects a movie from the search results. |
| **`POST`**   | `/api/dvds/manual` | Adds a DVD to the database using manually entered data (fallback).                 |
| **`GET`**    | `/api/dvds`        | Retrieves a list of all DVDs in the collection.                                    |
| **`GET`**    | `/api/dvds/:id`    | Retrieves a single DVD by its unique ID.                                           |
| **`PATCH`**  | `/api/dvds/:id`    | Updates a specific DVD's details.                                                  |
| **`DELETE`** | `/api/dvds/:id`    | Deletes a DVD from the collection.                                                 |

---

### **Project Planning & Milestones**

The project follows a phased development plan with a total estimated duration of **4 weeks**.

| Milestone                             | Status           | Description                                                                                                          |
| :------------------------------------ | :--------------- | :------------------------------------------------------------------------------------------------------------------- |
| **Phase 1: Backend & Database**       | **✅ Completed** | The backend API and database layer are fully developed, tested, and refactored to follow a professional MVC pattern. |
| **Phase 2: Frontend Development**     | **Planned**      | The Ionic/Angular mobile application will be built and integrated with the backend API.                              |
| **Phase 3: Integration & Deployment** | **Planned**      | The full-stack application will be connected and deployed to production.                                             |

---

### More informations

"For a more detailed look into the project's planning, a full breakdown of the user stories, and technical specifications, please see the project's documentation folder: Project Documentation"

---

### **Getting Started**

1.  Clone the repository.
2.  Install dependencies: `npm install`.
3.  Create a `.env` file with your MongoDB and TMDb API keys.
4.  Run the server in development mode: `npm run dev`.

---

### **Author & License**

- **Author:** GDevWeb
- **License:** MIT

---

### **Version française**

# Backend de l'application de collection de DVD

Une application full-stack conçue pour aider les utilisateurs à numériser et à gérer leur collection de DVD en scannant les codes-barres.

## Fonctionnalités

### Priorisation MoSCoW

Ce projet suit la méthode MoSCoW pour la priorisation des fonctionnalités.

- **Must Have (Indispensables):** Fonctionnalité principale pour scanner un DVD, trouver des informations sur un film via une API externe et l'enregistrer dans une liste personnelle. Le backend doit pouvoir gérer les entrées manuelles si le code EAN n'est pas trouvé.
- **Should Have (Souhaitables):** Un ensemble complet de points de terminaison CRUD (Créer, Lire, Mettre à jour, Supprimer) pour la gestion de la collection. Une gestion robuste des erreurs pour toutes les interactions API.
- **Could Have (Optionnelles):** Fonctionnalités avancées comme le filtrage, la recherche par titre, et une interface utilisateur simple.
- **Won't Have (Hors de portée):** L'authentification utilisateur, les fonctionnalités de partage social, ou un moteur de recommandation complexe dans la version initiale.

---

### **Structure du projet (Scaffold)**

Le backend est structuré selon le modèle **Model-View-Controller (MVC)** avec une couche de service dédiée à la logique métier.

```
/backend
├── src/
│   ├── controllers/         # Gère le flux requête/réponse (couche fine)
│   ├── models/              # Schémas Mongoose (les modèles de données)
│   ├── routes/              # Définitions de routage Express
│   ├── services/            # Toute la logique métier et les appels aux API externes
│   ├── utils/               # Fonctions utilitaires (par exemple, connexion à la base de données)
│   ├── server.ts            # Le point d'entrée principal du serveur
│   └── __tests__/           # Suite de tests Jest pour l'API
├── .env.test                # Variables d'environnement pour les tests
├── .env                     # Variables d'environnement pour le développement
├── jest.config.ts           # Configuration des tests Jest
├── tsconfig.json            # Configuration du compilateur TypeScript
└── package.json             # Dépendances et scripts du projet
```

---

### **Pile technologique**

- **Backend :** Node.js, Express.js et TypeScript
- **Base de données :** MongoDB avec Mongoose
- **API externes :**
  - [UPCitemdb](https://upcitemdb.com/api/explorer) : Utilisé pour traduire les codes EAN en titres de produits.
  - [The Movie Database (TMDb)](https://www.themoviedb.org/documentation/api) : Utilisé pour récupérer des détails de films riches et de haute qualité.
- **Tests :** Jest et Supertest
- **Outils :** Nodemon et Ts-node pour le rechargement en direct

---

### **Points de terminaison de l'API**

| Méthode      | Point de terminaison | Description                                                                                                       |
| :----------- | :------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **`POST`**   | `/api/dvds/scan`     | Scanne un code EAN et renvoie une liste de correspondances de films possibles.                                    |
| **`POST`**   | `/api/dvds/add`      | Ajoute un DVD à la base de données après que l'utilisateur a sélectionné un film dans les résultats de recherche. |
| **`POST`**   | `/api/dvds/manual`   | Ajoute un DVD à la base de données en utilisant les données saisies manuellement (solution de secours).           |
| **`GET`**    | `/api/dvds`          | Récupère une liste de tous les DVD de la collection.                                                              |
| **`GET`**    | `/api/dvds/:id`      | Récupère un seul DVD par son ID unique.                                                                           |
| **`PATCH`**  | `/api/dvds/:id`      | Met à jour les détails d'un DVD spécifique.                                                                       |
| **`DELETE`** | `/api/dvds/:id`      | Supprime un DVD de la collection.                                                                                 |

---

### **Planification et jalons du projet**

Le projet suit un plan de développement en plusieurs phases, avec une durée totale estimée de **4 semaines**.

| Jalon                                    | Statut          | Description                                                                                                                                   |
| :--------------------------------------- | :-------------- | :-------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1 : Backend et base de données** | **✅ Terminée** | L'API backend et la couche de base de données sont entièrement développées, testées et restructurées pour suivre un modèle MVC professionnel. |
| **Phase 2 : Développement du frontend**  | **Planifiée**   | L'application mobile Ionic/Angular sera construite et intégrée à l'API backend.                                                               |
| **Phase 3 : Intégration et déploiement** | **Planifiée**   | L'application full-stack sera connectée et déployée en production.                                                                            |

---

### Plus d'informations

"Pour une analyse plus détaillée de la planification du projet, une présentation complète des user stories et des spécifications techniques, veuillez consulter le dossier de documentation du projet : Documentation du projet"

---

### **Démarrage**

1.  Clonez le dépôt.
2.  Installez les dépendances : `npm install`.
3.  Créez un fichier `.env` avec vos clés d'API MongoDB et TMDb.
4.  Lancez le serveur en mode développement : `npm run dev`.

---

### **Auteur et licence**

- **Auteur :** GDevWeb
- **Licence :** MIT
