import express from "express";
import { pool } from "../db/index.js";
import { encodeCursor, decodeCursor } from "../src/utils/cursor.js";

const router = express.Router();


// list with pagination + sort
router.get("/", async (req, res) => {
  const allowedSort = ["id", "age"];

  let limit = parseInt(req.query.limit) || 50;
  const realLimit = limit + 1;

  let sortBy = req.query.sortBy || "id";
  const order = req.query.order === "desc" ? "DESC" : "ASC";

  if (!allowedSort.includes(sortBy)) {
    sortBy = "id";
  }

  const cursor = decodeCursor(req.query.cursor);

  try {
    let query = `
      SELECT *
      FROM users
    `;

    const values = [];
    let whereClause = "";

    if (cursor) {
      // composite cursor: (sortBy, id)
      values.push(cursor.value, cursor.id);

      whereClause = `
        WHERE (${sortBy}, id) > ($1, $2)
      `;
    }

    query += whereClause;

    query += `
      ORDER BY ${sortBy} ${order}, id ${order}
      LIMIT $${values.length + 1}
    `;

    values.push(realLimit);

    const result = await pool.query(query, values);

    const hasMore = result.rows.length > limit;

    const rows = hasMore
      ? result.rows.slice(0, limit)
      : result.rows;

    const last = rows[rows.length - 1];

    const nextCursor = hasMore
      ? encodeCursor({
          value: last[sortBy],
          id: last.id
        })
      : null;

    res.json({
      data: rows,
      nextCursor,
      hasMore
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// filter by email (would only return one email since its unique)
router.get("/by-email/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    res.json(result.rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// activate/deactiviate user
router.patch("/:id/active", async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  if (typeof is_active !== "boolean") {
    return res.status(400).json({
      error: "is_active must be a boolean"
    });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET is_active = $1
       WHERE id = $2
       RETURNING *`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json({
      message: "updated",
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

export default router;