import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();
