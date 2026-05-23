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
  const [mode, setMode] = useState("list");

  const [updatingIds, setUpdatingIds] = useState(new Set());

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

  const toggleStatus = async (id) => {
    setUpdatingIds(prev => new Set(prev).add(id));

    try {
      const res = await api.patch(`/users/${id}/status`)

      const data = res.data

      setUsers(prev =>
        prev.map(u =>
          u.id === id ? { ...u, is_active: data.user.is_active } : u
        )
      );
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setUpdatingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 500);
    }
  };

  const resetToList = () => {
    setMode("list");
    setSingleUser(null);
    setEmail("");
  };

  const isListReady = mode === "list" && users.length > 0;

  // styling
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "2fr 3fr 1fr 1fr 1fr",
    gap: "10px",
    padding: "10px 0",
    alignItems: "center",
    borderBottom: "1px solid #e5e5e5"
  };

  const headerStyle = {
    ...gridStyle,
    fontWeight: "bold",
    borderBottom: "2px solid #999"
  };

  return (
    <div>
      <h2>User List</h2>

      <div style={{ position: "relative", minHeight: "200px" }}>

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

        {/* loading */}
        {loading && users.length === 0 && (
          <div style={{ padding: "20px" }}>
            Loading...
          </div>
        )}

        {/* SINGLE MODE */}
        {mode === "single" && (
          <div>
            {singleUser ? (
              <div style={headerStyle}>
                <div>{singleUser.name}</div>
                <div>{singleUser.email}</div>
                <div>{singleUser.age}</div>
                <div>{String(singleUser.is_active)}</div>
                <div>
                  <button onClick={() => toggleStatus(singleUser.id)}>
                    Toggle
                  </button>
                </div>
              </div>
            ) : (
              !loading && <div>No user found</div>
            )}
          </div>
        )}

        {/* LIST MODE */}
        {mode === "list" && (
          <>
            {/* header */}
            <div style={headerStyle}>
              <div>Name</div>
              <div>Email</div>
              <div>Age</div>
              <div>Active</div>
              <div>Status</div>
            </div>

            {/* rows */}
            <div style={{ opacity: loading ? 0.5 : 1 }}>
              {users.map(user => (
                <div
                  key={user.id}
                  style={{
                    ...gridStyle,
                    backgroundColor: updatingIds.has(user.id)
                      ? "#fff3a0"
                      : "transparent",
                    transition: "background-color 0.3s"
                  }}
                >
                  <div>{user.name}</div>
                  <div>{user.email}</div>
                  <div>{user.age}</div>
                  <div>{String(user.is_active)}</div>

                  <div>
                    <button
                      onClick={() => toggleStatus(user.id)}
                      disabled={updatingIds.has(user.id)}
                    >
                      {user.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* pagination */}
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