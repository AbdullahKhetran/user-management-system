import express from "express";
import { pool } from "../db/index.js";
import { encodeCursor, decodeCursor, validateCursor } from "../utils/cursor.js";

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


  let rawCursor = null;

  try {
    rawCursor = decodeCursor(req.query.cursor);
  } catch (e) {
    rawCursor = null;
  }

  const cursor = validateCursor(rawCursor, sortBy);

  try {
    let query = `
      SELECT *
      FROM users
    `;

    const values = [];
    let whereClause = "";

    if (cursor) {
      if (sortBy === "id") {
        values.push(cursor.id);

        whereClause = `WHERE id > $1`;
      } else {
        values.push(cursor.value, cursor.id);

        if (order === "ASC") {
          whereClause = `WHERE (age, id) > ($1, $2)`;
        } else {
          whereClause = `WHERE (age, id) < ($1, $2)`;
        }
      }
    }

    query += whereClause;

    if (sortBy === "id") {
      query += ` ORDER BY id ${order}`;
    } else {
      query += ` ORDER BY age ${order}, id ${order}`;
    }

    query += ` LIMIT $${values.length + 1}`

    values.push(realLimit);

    const result = await pool.query(query, values);

    const hasMore = result.rows.length > limit;

    const rows = hasMore
      ? result.rows.slice(0, limit)
      : result.rows;

    // edge case: were at end, so next chunk is empty
    if (rows.length === 0) {
      return res.json({
        data: [],
        nextCursor: null,
        hasMore: false
      });
    }

    const last = rows[rows.length - 1];

    const nextCursor =
      hasMore
        ? encodeCursor(
            sortBy === "id"
              ? { id: last.id }
              : { value: last.age, id: last.id }
          )
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