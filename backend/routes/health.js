import express from "express";
import {backendHealthCheck, databaseConnectionCheck} from "../controllers/health.controller.js"

const router = express.Router();

router.route("/").get(backendHealthCheck)
router.route("/db").get(databaseConnectionCheck)

export default router;