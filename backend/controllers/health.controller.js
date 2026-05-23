import { pool } from "../db/index.js";

const backendHealthCheck = async (req, res) => {
    res.json({
        status: "ok",
        service: "backend",
        timestamp: new Date().toISOString()
    });
}

const databaseConnectionCheck = async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
          status: "ok",
          database: "connected",
          time: result.rows[0].now
        });
    } catch (err) {
        res.status(500).json({
          status: "error",
          database: "disconnected",
          error: err.message
        });
    }
}

export {backendHealthCheck, databaseConnectionCheck}