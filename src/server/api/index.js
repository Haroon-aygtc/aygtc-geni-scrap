import express from "express";
import routes from "./routes/index.js";

const router = express.Router();

// Use all routes from the routes index
router.use(routes);

export default router;
