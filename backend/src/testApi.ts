const url = "https://api.themoviedb.org/3/search/movie?query=The%20Matrix";
const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0OTcxMWMxM2EyODNiMzk4OTA3Y2VmODgwYzMxYmE3MiIsIm5iZiI6MTc1NzUxMDc3My45ODg5OTk4LCJzdWIiOiI2OGMxN2M3NTFkYjZmMWNmZjg5OGNiYjkiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.h5eCo_k1VWSTWsJj86mILwAATbfzgwSI1yGdJoaTHnw`,
  },
};

fetch(url, options)
  .then((res) => res.json())
  .then((json) => console.log(json))
  .catch((err) => console.error(err));
