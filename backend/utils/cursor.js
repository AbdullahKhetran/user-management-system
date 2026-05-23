export function encodeCursor(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64");
}

export function decodeCursor(cursor) {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

// cursor modes
// mode a (id) {"id": 23}
// mode b (age) {"age": 25, "id": 123}

export function validateCursor(cursor, sortBy) {
  if (!cursor || typeof cursor !== "object") {
    return null;
  }

  if (sortBy === "id") {
    if (typeof cursor.id !== "number") return null;

    return {
      id: cursor.id
    };
  }

  // age mode
  if (
    typeof cursor.value !== "number" ||
    typeof cursor.id !== "number"
  ) {
    return null;
  }

  return {
    value: cursor.value,
    id: cursor.id
  };
}