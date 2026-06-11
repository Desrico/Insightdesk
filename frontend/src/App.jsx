import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:8000/api";

function App() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    requester_name: "",
    requester_email: "",
    priority: "medium",
  });

  const [statusForm, setStatusForm] = useState({
    status: "in_progress",
    note: "",
  });

  const fetchTickets = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/tickets`);
      const result = await response.json();

      setTickets(result.data?.data ?? []);
    } catch (error) {
      setMessage("Gagal mengambil data ticket.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetail = async (id) => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${id}`);
      const result = await response.json();

      setSelectedTicket(result.data);
      setStatusForm({
        status: result.data.status,
        note: "",
      });
    } catch (error) {
      setMessage("Gagal mengambil detail ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Gagal membuat ticket.");
        return;
      }

      setMessage("Ticket berhasil dibuat.");
      setForm({
        title: "",
        description: "",
        requester_name: "",
        requester_email: "",
        priority: "medium",
      });

      await fetchTickets();
      await fetchTicketDetail(result.data.id);
    } catch (error) {
      setMessage("Terjadi kesalahan saat membuat ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (event) => {
    event.preventDefault();

    if (!selectedTicket) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/tickets/${selectedTicket.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: statusForm.status,
            note: statusForm.note,
            version: selectedTicket.version,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Gagal mengubah status ticket.");
        return;
      }

      setMessage("Status ticket berhasil diperbarui.");
      setSelectedTicket(result.data);
      await fetchTickets();
    } catch (error) {
      setMessage("Terjadi kesalahan saat mengubah status ticket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>InsightDesk</h1>
          <p>AI-Powered Support Ticket & Feedback Analyzer</p>
        </div>
        <button onClick={fetchTickets}>Refresh</button>
      </header>

      {message && <div className="alert">{message}</div>}

      <section className="grid">
        <div className="card">
          <h2>Create Ticket</h2>

          <form onSubmit={handleCreateTicket} className="form">
            <label>
              Title
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </label>

            <label>
              Requester Name
              <input
                type="text"
                value={form.requester_name}
                onChange={(e) =>
                  setForm({ ...form, requester_name: e.target.value })
                }
              />
            </label>

            <label>
              Requester Email
              <input
                type="email"
                value={form.requester_email}
                onChange={(e) =>
                  setForm({ ...form, requester_email: e.target.value })
                }
              />
            </label>

            <label>
              Priority
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Processing..." : "Create Ticket"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Ticket List</h2>

          {loading && <p>Loading...</p>}

          {!loading && tickets.length === 0 && (
            <p className="muted">Belum ada ticket.</p>
          )}

          <div className="ticket-list">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                className="ticket-item"
                onClick={() => fetchTicketDetail(ticket.id)}
              >
                <div>
                  <strong>{ticket.title}</strong>
                  <p>{ticket.description}</p>
                </div>
                <span className={`badge ${ticket.priority}`}>
                  {ticket.priority}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedTicket && (
        <section className="card detail">
          <h2>Ticket Detail</h2>

          <div className="detail-grid">
            <div>
              <p className="label">Title</p>
              <h3>{selectedTicket.title}</h3>

              <p className="label">Description</p>
              <p>{selectedTicket.description}</p>

              <p className="label">Requester</p>
              <p>
                {selectedTicket.requester_name || "-"} (
                {selectedTicket.requester_email || "-"})
              </p>
            </div>

            <div>
              <p className="label">Status</p>
              <span className="status">{selectedTicket.status}</span>

              <p className="label">Priority</p>
              <span className={`badge ${selectedTicket.priority}`}>
                {selectedTicket.priority}
              </span>

              <p className="label">Version</p>
              <p>{selectedTicket.version}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateStatus} className="status-form">
            <h3>Update Status</h3>

            <select
              value={statusForm.status}
              onChange={(e) =>
                setStatusForm({ ...statusForm, status: e.target.value })
              }
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <input
              type="text"
              placeholder="Note"
              value={statusForm.note}
              onChange={(e) =>
                setStatusForm({ ...statusForm, note: e.target.value })
              }
            />

            <button type="submit" disabled={loading}>
              Update Status
            </button>
          </form>

          <div className="history">
            <h3>Status History</h3>

            {selectedTicket.status_histories?.length > 0 ? (
              selectedTicket.status_histories.map((history) => (
                <div key={history.id} className="history-item">
                  <strong>
                    {history.from_status || "-"} → {history.to_status}
                  </strong>
                  <p>{history.note || "No note"}</p>
                </div>
              ))
            ) : (
              <p className="muted">Belum ada riwayat status.</p>
            )}
          </div>

          <div className="ai-box">
            <h3>AI Analysis</h3>

            {selectedTicket.ai_analysis ? (
              <>
                <p>
                  <strong>Summary:</strong>{" "}
                  {selectedTicket.ai_analysis.summary || "-"}
                </p>
                <p>
                  <strong>Category:</strong>{" "}
                  {selectedTicket.ai_analysis.category || "-"}
                </p>
                <p>
                  <strong>Sentiment:</strong>{" "}
                  {selectedTicket.ai_analysis.sentiment || "-"}
                </p>
                <p>
                  <strong>Priority Suggestion:</strong>{" "}
                  {selectedTicket.ai_analysis.priority_suggestion || "-"}
                </p>
                <p>
                  <strong>Recommendation:</strong>{" "}
                  {selectedTicket.ai_analysis.recommendation || "-"}
                </p>
              </>
            ) : (
              <p className="muted">
                AI analysis belum tersedia. Integrasi Gemini akan ditambahkan
                pada tahap berikutnya.
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default App;
