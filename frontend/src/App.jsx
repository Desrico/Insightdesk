import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = "http://localhost:8000/api";

const statusLabels = {
  open: "Baru",
  in_progress: "Diproses",
  resolved: "Selesai",
  closed: "Ditutup",
};

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
      setMessage("Gagal mengambil data tiket.");
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

      if (!response.ok) {
        setMessage(result.message || "Gagal mengambil detail tiket.");
        return;
      }

      setSelectedTicket(result.data);
      setStatusForm({
        status: result.data.status,
        note: "",
      });
    } catch (error) {
      setMessage("Gagal mengambil detail tiket.");
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
        setMessage(result.message || "Gagal membuat tiket.");
        return;
      }

      setMessage("Tiket berhasil dibuat.");
      setForm({
        title: "",
        description: "",
        requester_name: "",
        requester_email: "",
      });

      await fetchTickets();

      if (result.data?.id) {
        await fetchTicketDetail(result.data.id);
      }
    } catch (error) {
      setMessage("Terjadi kesalahan saat membuat tiket.");
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
        setMessage(result.message || "Gagal mengubah status tiket.");
        return;
      }

      setMessage("Status tiket berhasil diperbarui.");
      setSelectedTicket(result.data);
      await fetchTickets();
    } catch (error) {
      setMessage("Terjadi kesalahan saat mengubah status tiket.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeTicket = async () => {
    if (!selectedTicket) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/tickets/${selectedTicket.id}/analyze`,
        {
          method: "POST",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.message || "Gagal menjalankan analisis AI.");
        return;
      }

      setMessage("Analisis AI berhasil dibuat.");
      setSelectedTicket(result.data);
      await fetchTickets();
    } catch (error) {
      setMessage("Terjadi kesalahan saat menjalankan analisis AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const dashboardStats = {
    total: tickets.length,
    baru: tickets.filter((ticket) => ticket.status === "open").length,
    diproses: tickets.filter((ticket) => ticket.status === "in_progress")
      .length,
    selesai: tickets.filter((ticket) => ticket.status === "resolved").length,
    dianalisis: tickets.filter((ticket) => ticket.ai_analysis).length,
  };

  return (
    <main className="app">
      <header className="header">
        <div>
          <h1>InsightDesk</h1>
          <p>Penganalisis Support Ticket dan Feedback Berbasis AI</p>
        </div>
        <button onClick={fetchTickets}>Muat Ulang</button>
      </header>

      {message && <div className="alert">{message}</div>}

      <section className="dashboard">
        <div className="stat-card">
          <p>Total Tiket</p>
          <h3>{dashboardStats.total}</h3>
        </div>

        <div className="stat-card">
          <p>Tiket Baru</p>
          <h3>{dashboardStats.baru}</h3>
        </div>

        <div className="stat-card">
          <p>Sedang Ditangani</p>
          <h3>{dashboardStats.diproses}</h3>
        </div>

        <div className="stat-card">
          <p>Selesai</p>
          <h3>{dashboardStats.selesai}</h3>
        </div>

        <div className="stat-card">
          <p>Sudah Dianalisis AI</p>
          <h3>{dashboardStats.dianalisis}</h3>
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Buat Tiket</h2>

          <form onSubmit={handleCreateTicket} className="form">
            <label>
              Subjek Tiket
              <input
                type="text"
                placeholder="Contoh: Fitur pencarian lambat"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>

            <label>
              Deskripsi Masalah / Feedback
              <textarea
                placeholder="Jelaskan masalah, kendala, pertanyaan, atau feedback pengguna"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </label>

            <label>
              Nama Pelapor
              <input
                type="text"
                placeholder="Contoh: Budi"
                value={form.requester_name}
                onChange={(e) =>
                  setForm({ ...form, requester_name: e.target.value })
                }
              />
            </label>

            <label>
              Email Pelapor
              <input
                type="email"
                placeholder="Contoh: budi@email.com"
                value={form.requester_email}
                onChange={(e) =>
                  setForm({ ...form, requester_email: e.target.value })
                }
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Buat Tiket"}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Daftar Tiket</h2>

          {loading && <p>Sedang memuat...</p>}

          {!loading && tickets.length === 0 && (
            <p className="muted">Belum ada tiket.</p>
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
                <span className="status">
                  {statusLabels[ticket.status] || ticket.status}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {selectedTicket && (
        <section className="card detail">
          <h2>Detail Tiket</h2>

          <div className="detail-grid">
            <div>
              <p className="label">Subjek Tiket</p>
              <p className="detail-value">{selectedTicket.title}</p>

              <p className="label">Deskripsi Masalah / Feedback</p>
              <p>{selectedTicket.description}</p>

              <p className="label">Pelapor</p>
              <p>
                {selectedTicket.requester_name || "-"} (
                {selectedTicket.requester_email || "-"})
              </p>
            </div>

            <div>
              <p className="label">Status</p>
              <span className="status">
                {statusLabels[selectedTicket.status] || selectedTicket.status}
              </span>

              <p className="label">Versi Data</p>
              <p>{selectedTicket.version}</p>
            </div>
          </div>

          <form onSubmit={handleUpdateStatus} className="status-form">
            <h3>Perbarui Status</h3>

            <select
              value={statusForm.status}
              onChange={(e) =>
                setStatusForm({ ...statusForm, status: e.target.value })
              }
            >
              <option value="open">Baru</option>
              <option value="in_progress">Diproses</option>
              <option value="resolved">Selesai</option>
              <option value="closed">Ditutup</option>
            </select>

            <input
              type="text"
              placeholder="Catatan perubahan status"
              value={statusForm.note}
              onChange={(e) =>
                setStatusForm({ ...statusForm, note: e.target.value })
              }
            />

            <button type="submit" disabled={loading}>
              Perbarui Status
            </button>
          </form>

          <div className="history">
            <h3>Riwayat Status</h3>

            {selectedTicket.status_histories?.length > 0 ? (
              selectedTicket.status_histories.map((history) => (
                <div key={history.id} className="history-item">
                  <strong>
                    {statusLabels[history.from_status] ||
                      history.from_status ||
                      "-"}{" "}
                    → {statusLabels[history.to_status] || history.to_status}
                  </strong>
                  <p>{history.note || "Tidak ada catatan"}</p>
                </div>
              ))
            ) : (
              <p className="muted">Belum ada riwayat status.</p>
            )}
          </div>

          <div className="ai-box">
            <h3>Analisis AI</h3>

            <button
              type="button"
              onClick={handleAnalyzeTicket}
              disabled={loading}
            >
              {loading ? "Menganalisis..." : "Jalankan Analisis AI"}
            </button>

            {selectedTicket.ai_analysis ? (
              <>
                <p>
                  <strong>Ringkasan:</strong>{" "}
                  {selectedTicket.ai_analysis.summary || "-"}
                </p>
                <p>
                  <strong>Kategori Masalah:</strong>{" "}
                  {selectedTicket.ai_analysis.category || "-"}
                </p>
                <p>
                  <strong>Sentimen Pengguna:</strong>{" "}
                  {selectedTicket.ai_analysis.sentiment || "-"}
                </p>
                <p>
                  <strong>Saran Prioritas Penanganan:</strong>{" "}
                  {selectedTicket.ai_analysis.priority_suggestion || "-"}
                </p>
                <p>
                  <strong>Rekomendasi:</strong>{" "}
                  {selectedTicket.ai_analysis.recommendation || "-"}
                </p>
              </>
            ) : (
              <p className="muted">
                Analisis AI belum tersedia. Integrasi Gemini akan ditambahkan
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
