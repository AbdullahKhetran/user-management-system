import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);

      try {
        const res = await api.get("/users", {
          params: {
            limit: 10,
          }
        });

        const firstPage = {
          data: res.data.data,
          nextCursor: res.data.nextCursor,
          hasMore: res.data.hasMore
        };

        setPages([firstPage]);
        setCurrentPageIndex(0);
        setUsers(firstPage.data);
        setHasMore(firstPage.hasMore);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, []);

  const nextPage = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await api.get("/users", {
        params: {
          limit: 10,
          cursor: pages[currentPageIndex]?.nextCursor || null,
        }
      });

      const newPage = {
        data: res.data.data,
        nextCursor: res.data.nextCursor,
        hasMore: res.data.hasMore
      };

      const updatedPages = [...pages.slice(0, currentPageIndex + 1), newPage];

      setPages(updatedPages);
      setCurrentPageIndex(prev => prev + 1);
      setUsers(newPage.data);
      setHasMore(newPage.hasMore);
    } finally {
      setLoading(false);
    }
  };

  const prevPage = () => {
    if (currentPageIndex === 0) return;

    const newIndex = currentPageIndex - 1;

    setCurrentPageIndex(newIndex);
    setUsers(pages[newIndex].data);
    setHasMore(true);
  };

  return (
    <div>
      <h2>User List</h2>

      <div style={{position: "relative", minHeight: "200px"}}>

        {/* no user right now */}
        {loading && users.length === 0 && (
          <div style={{ padding: "20px" }}>
            Loading...
          </div>
        )}

      {/* displaying users */}
      {users.length > 0 && (
        <div style={{ opacity: loading ? 0.5 : 1 }}>
          {users.map(user => (
            <div key={user.id}>
              {user.name} | {user.email} | {user.age} | {String(user.is_active)}
            </div>
          ))}
        </div>
      )}

      {/* show loading */}
      {loading && users.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.6)"
          }}
        >
          Loading...
        </div>
      )}

      </div>


      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={prevPage}
          disabled={currentPageIndex === 0 || loading}
        >
          Previous
        </button>

        <button
          onClick={nextPage}
          disabled={!hasMore || loading}
        >
          Next
        </button>
      </div>

    </div>
  );
}