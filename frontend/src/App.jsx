import { useEffect, useState } from "react";
import "./App.css";
import AdminWorkspace from "./AdminWorkspace";
import UserPortal from "./UserPortal";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const statusLabels = {
  open: "Baru",
  in_progress: "Diproses",
  resolved: "Selesai",
};

function App() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeMode, setActiveMode] = useState("user");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [submittedReport, setSubmittedReport] = useState(null);

  const [form, setForm] = useState({
    category: "",
    title: "",
    description: "",
    requester_name: "",
    requester_email: "",
  });

  const [dashboardSummary, setDashboardSummary] = useState({
    total_tickets: 0,
    new_tickets: 0,
    in_progress_tickets: 0,
    resolved_tickets: 0,
    ai_analyzed_tickets: 0,
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
    } catch {
      setMessage("Gagal mengambil data tiket.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/summary`);
      const result = await response.json();

      if (result.success) {
        setDashboardSummary(result.data);
      }
    } catch {
      setMessage("Gagal mengambil ringkasan dashboard.");
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
    } catch {
      setMessage("Gagal mengambil detail tiket.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setFormErrors({});
    setSubmittedReport(null);

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
        setFormErrors(result.errors ?? {});
        setMessage(result.message || "Gagal membuat tiket.");
        return;
      }

      setSubmittedReport(result.data);
      setMessage("Laporan berhasil dikirim ke Admin Support.");
      setForm({
        category: "",
        title: "",
        description: "",
        requester_name: "",
        requester_email: "",
      });

      await fetchTickets();
      await fetchDashboardSummary();
    } catch {
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

      if (response.status === 409) {
        await fetchTicketDetail(selectedTicket.id);
        await fetchTickets();
        await fetchDashboardSummary();
        setMessage(
          "Data tiket sudah diperbarui oleh admin lain. Detail terbaru telah dimuat ulang.",
        );
        return;
      }

      if (!response.ok) {
        setMessage(result.message || "Gagal mengubah status tiket.");
        return;
      }

      setMessage("Status tiket berhasil diperbarui.");
      setSelectedTicket(result.data);
      await fetchTickets();
      await fetchDashboardSummary();
    } catch {
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
      await fetchDashboardSummary();
    } catch {
      setMessage("Terjadi kesalahan saat menjalankan analisis AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchDashboardSummary();
  }, []);

  if (activeMode === "user") {
    return (
      <UserPortal
        form={form}
        formErrors={formErrors}
        loading={loading}
        message={message}
        submittedReport={submittedReport}
        onFormChange={setForm}
        onSubmit={handleCreateTicket}
        onOpenAdmin={() => {
          setActiveMode("admin");
          setMessage("");
        }}
        onResetReport={() => {
          setSubmittedReport(null);
          setMessage("");
          document
            .getElementById("form-laporan")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    );
  }

  const dashboardStats = {
    total: dashboardSummary.total_tickets,
    baru: dashboardSummary.new_tickets,
    diproses: dashboardSummary.in_progress_tickets,
    selesai: dashboardSummary.resolved_tickets,
    dianalisis: dashboardSummary.ai_analyzed_tickets,
  };

  if (activeMode === "admin") {
    return (
      <AdminWorkspace
        tickets={tickets}
        summary={dashboardSummary}
        selectedTicket={selectedTicket}
        statusForm={statusForm}
        loading={loading}
        message={message}
        onExit={() => {
          setActiveMode("user");
          setSelectedTicket(null);
          setMessage("");
        }}
        onRefresh={async () => {
          await fetchTickets();
          await fetchDashboardSummary();
        }}
        onSelectTicket={fetchTicketDetail}
        onStatusFormChange={setStatusForm}
        onUpdateStatus={handleUpdateStatus}
        onAnalyze={handleAnalyzeTicket}
        onCloseDetail={() => setSelectedTicket(null)}
      />
    );
  }

  const workflowSteps = [
    {
      title: "1. Buat Tiket",
      description:
        "Pengguna membuat laporan masalah atau feedback melalui form tiket.",
    },
    {
      title: "2. Kelola Tiket",
      description:
        "Tiket yang masuk dapat dilihat pada daftar dan dibuka untuk melihat detail.",
    },
    {
      title: "3. Perbarui Status",
      description:
        "Status tiket dapat diubah menjadi Baru, Sedang Ditangani, atau Selesai.",
    },
    {
      title: "4. Analisis AI",
      description:
        "AI membantu memberi ringkasan, kategori masalah, sentimen pengguna, prioritas, dan rekomendasi.",
    },
  ];

  return (
    <main className="app">
      <header className="hero">
        <div>
          <h1>InsightDesk</h1>
          <p>
            AI-Powered Support Ticket & Feedback Analyzer untuk membantu Admin
            Support mengelola tiket dukungan dan memahami feedback pengguna
            dengan lebih cepat.
          </p>

          <div className="hero-actions">
            <a href="#buat-tiket" className="primary-link">
              Mulai Buat Tiket
            </a>
            <a
              href="http://localhost:8000/api-docs"
              className="secondary-link"
              target="_blank"
            >
              Lihat API Docs
            </a>
          </div>
        </div>
      </header>

      <section className="workflow">
        {workflowSteps.map((step) => (
          <div className="workflow-card" key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </section>

      {message && <div className="alert">{message}</div>}

      <section className="mode-switch">
        <div>
          <h2>Pilih Peran Pengguna</h2>
          <p>
            Gunakan Mode Pengguna untuk membuat tiket, lalu buka Mode Admin
            Support untuk mengelola tiket dan menjalankan analisis AI.
          </p>
        </div>

        <div className="mode-actions">
          <button
            type="button"
            className={
              activeMode === "user" ? "mode-button active" : "mode-button"
            }
            onClick={() => setActiveMode("user")}
          >
            Mode Pengguna
          </button>

          <button
            type="button"
            className={
              activeMode === "admin" ? "mode-button active" : "mode-button"
            }
            onClick={() => setActiveMode("admin")}
          >
            Mode Admin Support
          </button>
        </div>
      </section>

      {activeMode === "user" ? (
        <>
          <section className="role-info">
            <h2>Laporkan Masalah atau Berikan Feedback</h2>
            <p>
              Ceritakan kendala, pertanyaan, atau saran Anda. Laporan akan
              diteruskan ke Admin Support untuk ditinjau dan ditindaklanjuti.
            </p>
          </section>

          <div className="grid user-grid">
            <div className="card" id="buat-tiket">
              <div className="form-heading">
                <div>
                  <span className="eyebrow">Form Pelaporan</span>
                  <h2>Kirim Laporan</h2>
                </div>
                <span className="required-note">* wajib diisi</span>
              </div>

              <form onSubmit={handleCreateTicket} className="form">
                <label>
                  Jenis Laporan *
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    <option value="Masalah Teknis">Masalah Teknis</option>
                    <option value="Pertanyaan">Pertanyaan</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Permintaan Fitur">Permintaan Fitur</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <span className="field-hint">
                    Pilih kategori yang paling sesuai dengan laporan Anda.
                  </span>
                </label>

                <label>
                  Judul Laporan *
                  <input
                    type="text"
                    placeholder="Contoh: Tidak dapat masuk ke akun"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    maxLength={150}
                    aria-invalid={Boolean(formErrors.title)}
                    required
                  />
                  <span className="field-meta">
                    <span className="field-error">
                      {formErrors.title?.[0] || ""}
                    </span>
                    <span>{form.title.length}/150</span>
                  </span>
                </label>

                <label>
                  Ceritakan Detail Laporan *
                  <textarea
                    placeholder="Apa yang terjadi? Kapan masalah mulai muncul? Apa yang sudah Anda coba? Tuliskan langkah atau hasil yang diharapkan."
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    aria-invalid={Boolean(formErrors.description)}
                    required
                  />
                  <span className="field-meta">
                    <span className="field-error">
                      {formErrors.description?.[0] || ""}
                    </span>
                    <span>{form.description.length} karakter</span>
                  </span>
                </label>

                <div className="form-row">
                  <label>
                    Nama Pelapor
                    <input
                      type="text"
                      placeholder="Contoh: Budi"
                      value={form.requester_name}
                      onChange={(e) =>
                        setForm({ ...form, requester_name: e.target.value })
                      }
                      maxLength={100}
                    />
                    <span className="field-hint">Opsional</span>
                  </label>

                  <label>
                    Email untuk Dihubungi
                    <input
                      type="email"
                      placeholder="budi@email.com"
                      value={form.requester_email}
                      onChange={(e) =>
                        setForm({ ...form, requester_email: e.target.value })
                      }
                      maxLength={150}
                      aria-invalid={Boolean(formErrors.requester_email)}
                    />
                    <span
                      className={
                        formErrors.requester_email
                          ? "field-error"
                          : "field-hint"
                      }
                    >
                      {formErrors.requester_email?.[0] ||
                        "Opsional, digunakan bila perlu tindak lanjut."}
                    </span>
                  </label>
                </div>

                <div className="privacy-note">
                  Hindari menuliskan password, PIN, atau data rahasia. Email dan
                  nomor telepon akan dimasking sebelum isi laporan diproses AI.
                </div>

                <button type="submit" disabled={loading}>
                  {loading ? "Mengirim Laporan..." : "Kirim Laporan"}
                </button>
              </form>
            </div>

            <div className="card guide-card">
              {submittedReport ? (
                <div className="report-receipt" aria-live="polite">
                  <span className="receipt-icon">✓</span>
                  <span className="eyebrow">Laporan Diterima</span>
                  <h2>Terima kasih sudah melapor</h2>
                  <p>
                    Laporan Anda sudah masuk ke antrean Admin Support. Simpan
                    nomor laporan berikut sebagai referensi.
                  </p>
                  <div className="report-number">
                    <span>Nomor Laporan</span>
                    <strong>#{submittedReport.id}</strong>
                  </div>
                  <dl className="receipt-details">
                    <div>
                      <dt>Judul</dt>
                      <dd>{submittedReport.title}</dd>
                    </div>
                    <div>
                      <dt>Jenis</dt>
                      <dd>{submittedReport.category || "-"}</dd>
                    </div>
                    <div>
                      <dt>Status awal</dt>
                      <dd>
                        {statusLabels[submittedReport.status] ||
                          submittedReport.status}
                      </dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => {
                      setSubmittedReport(null);
                      setMessage("");
                      document
                        .getElementById("buat-tiket")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Kirim Laporan Lain
                  </button>
                </div>
              ) : (
                <>
                  <span className="eyebrow">Sebelum Mengirim</span>
                  <h2>Agar Laporan Cepat Dipahami</h2>
                  <ol className="report-tips">
                    <li>Gunakan judul yang singkat dan spesifik.</li>
                    <li>Jelaskan kronologi serta langkah yang sudah dicoba.</li>
                    <li>Sebutkan hasil yang terjadi dan yang Anda harapkan.</li>
                    <li>Jangan menyertakan password atau data rahasia.</li>
                  </ol>
                  <div className="process-note">
                    <strong>Setelah dikirim</strong>
                    <p>
                      Admin Support akan meninjau laporan, menentukan prioritas,
                      memperbarui status, dan menggunakan AI sebagai rekomendasi
                      analisis.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <section className="role-info">
            <h2>Mode Admin Support</h2>
            <p>
              Pada mode ini, Admin Support dapat memantau dashboard, melihat
              daftar tiket, membuka detail tiket, memperbarui status, dan
              menjalankan analisis AI.
            </p>
          </section>

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

          <div className="grid admin-grid">
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
          </div>

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
                    {statusLabels[selectedTicket.status] ||
                      selectedTicket.status}
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
                    Analisis AI belum tersedia. Klik tombol di atas untuk
                    menjalankan analisis AI.
                  </p>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export default App;
