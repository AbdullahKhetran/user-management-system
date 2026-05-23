import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  // Initial fetch
  useEffect(() => {
    const fetchInitialUsers = async () => {
      setLoading(true);

      try {
        const res = await api.get("/users", {
          params: {
            limit: 10,
            sortBy: "age",
            order: "asc"
          }
        });

        setUsers(res.data.data);
        setCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialUsers();
  }, []);

  // Load more pagination
  const loadMoreUsers = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await api.get("/users", {
        params: {
          limit: 10,
          cursor,
          sortBy: "age",
          order: "asc"
        }
      });

      setUsers(prev => [...prev, ...res.data.data]);

      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>User List</h2>

      {users.map(user => (
        <div key={user.id}>
          {user.name} | {user.email} | {user.age} | {String(user.is_active)}
        </div>
      ))}

      {hasMore && (
        <button onClick={loadMoreUsers}>
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}