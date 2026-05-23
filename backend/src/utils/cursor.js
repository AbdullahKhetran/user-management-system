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