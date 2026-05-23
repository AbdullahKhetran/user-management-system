import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("id"); // default
  const [order, setOrder] = useState("asc");

  const [email, setEmail] = useState("");
  const [singleUser, setSingleUser] = useState(null);
  const [mode, setMode] = useState("list"); // "list" | "single"

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);

      try {
        const res = await api.get("/users", {
          params: {
            limit: 10,
            sortBy,
            order
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
  }, [sortBy, order]);

  const nextPage = async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const res = await api.get("/users", {
        params: {
          limit: 10,
          cursor: pages[currentPageIndex]?.nextCursor || null,
          sortBy,
          order
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

  const resetPagination = (newSortBy, newOrder) => {
    // double click etc
    if (sortBy === newSortBy && order === newOrder) return;

    setUsers([]);
    setPages([]);
    setCurrentPageIndex(0);
    setHasMore(true);
    setSortBy(newSortBy);
    setOrder(newOrder);
  };

  const filterByEmail = async () => {
    if (!email) return;

    setLoading(true);
    setMode("single");

    try {
      const res = await api.get(`/users/by-email/${email}`);

      setSingleUser(res.data);
    } finally {
      setLoading(false);
    }
  };

  const resetToList = () => {
    setMode("list");
    setSingleUser(null);
    setEmail("");
  };

  const isListReady = mode === "list" && users.length > 0;

  return (
    <div>
      <h2>User List</h2>

      <div style={{position: "relative", minHeight: "200px"}}>



        {/* sort buttons */}
        <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
          <button
            disabled={loading || !isListReady}
            onClick={() => resetPagination("age", "asc")}
          >
            Age Ascending
          </button>

          <button
            disabled={loading || !isListReady}
            onClick={() => resetPagination("age", "desc")}
          >
            Age Descending
          </button>

          <button
            disabled={loading || !isListReady}
            onClick={() => resetPagination("id", "asc")}
          >
            Default (ID)
          </button>
        </div>

        {/* email filter */}
        <div style={{ marginBottom: "10px", display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={filterByEmail} disabled={loading}>
            Filter
          </button>

          {mode === "single" && (
            <button onClick={resetToList}>
              Back
            </button>
          )}
        </div>

        {/* no user right now */}
        {loading && users.length === 0 && (
          <div style={{ padding: "20px" }}>
            Loading...
          </div>
        )}
        
        {/* for filter, show only that record */}
        {mode === "single" && (
          <div>
            {loading && <div>Loading...</div>}

            {singleUser ? (
              <div>
                {singleUser.name} | {singleUser.email} | {singleUser.age} | {String(singleUser.is_active)}
              </div>
            ) : (
              !loading && <div>No user found</div>
            )}
          </div>
        )}

        {/* list mode */}
        {mode === "list" && (
          <>
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

            {/* navigation buttons */}
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
          </>
        )}
      </div>
    </div>
  );
}