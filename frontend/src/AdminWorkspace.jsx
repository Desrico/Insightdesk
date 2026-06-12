/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";

const statusLabels = {
  open: "Baru",
  in_progress: "Diproses",
  resolved: "Selesai",
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "DB" },
  { id: "reports", label: "Daftar Laporan", icon: "LP" },
  { id: "analytics", label: "AI Analytics", icon: "AI" },
];

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function AdminWorkspace({
  tickets,
  summary,
  selectedTicket,
  statusForm,
  loading,
  message,
  onExit,
  onRefresh,
  onSelectTicket,
  onStatusFormChange,
  onUpdateStatus,
  onAnalyze,
  onCloseDetail,
  apiDocsUrl,
}) {
  const [activeView, setActiveView] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchesSearch =
        !query ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        (ticket.category || "").toLowerCase().includes(query) ||
        (ticket.requester_name || "").toLowerCase().includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter, tickets]);

  const categoryStats = useMemo(() => {
    const counts = tickets.reduce((result, ticket) => {
      const category = ticket.ai_analysis?.category || ticket.category || "Belum dikategorikan";
      result[category] = (result[category] || 0) + 1;
      return result;
    }, {});

    return Object.entries(counts)
      .sort(([, first], [, second]) => second - first)
      .slice(0, 5);
  }, [tickets]);

  const sentimentStats = useMemo(() => {
    return tickets.reduce(
      (result, ticket) => {
        const sentiment = ticket.ai_analysis?.sentiment?.toLowerCase();
        if (sentiment?.includes("negatif")) result.negatif += 1;
        else if (sentiment?.includes("positif")) result.positif += 1;
        else if (sentiment) result.netral += 1;
        return result;
      },
      { positif: 0, netral: 0, negatif: 0 },
    );
  }, [tickets]);

  const analyzedPercentage = summary.total_tickets
    ? Math.round((summary.ai_analyzed_tickets / summary.total_tickets) * 100)
    : 0;

  const activeTitle = {
    dashboard: "Dashboard Operasional",
    reports: "Manajemen Laporan",
    analytics: "AI Analytics",
  }[activeView];

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">ID</span>
          <div>
            <strong>InsightDesk</strong>
            <span>Support Intelligence</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Navigasi admin">
          <span className="admin-nav-label">Workspace</span>
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={activeView === item.id ? "admin-nav-item active" : "admin-nav-item"}
              onClick={() => setActiveView(item.id)}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-profile">
            <span>AS</span>
            <div>
              <strong>Admin Support</strong>
              <small>Operator Workspace</small>
            </div>
          </div>
          <button type="button" className="admin-exit" onClick={onExit}>
            Kembali ke Form Pengguna
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-breadcrumb">Admin Support / {activeTitle}</span>
            <h1>{activeTitle}</h1>
          </div>
          <div className="admin-topbar-actions">
            <button type="button" className="admin-refresh" onClick={onRefresh} disabled={loading}>
              {loading ? "Memuat..." : "Muat Ulang"}
            </button>
            <a href={apiDocsUrl} target="_blank" rel="noreferrer">
              API Docs
            </a>
          </div>
        </header>

        {message && <div className="admin-alert">{message}</div>}

        <div className="admin-content">
          {activeView === "dashboard" && (
            <>
              <section className="admin-welcome">
                <div>
                  <span className="admin-kicker">Ringkasan hari ini</span>
                  <h2>Pantau laporan dan ambil tindakan lebih cepat.</h2>
                  <p>
                    Lihat antrean masuk, progres penyelesaian, dan cakupan analisis AI
                    dalam satu workspace.
                  </p>
                </div>
                <button type="button" onClick={() => setActiveView("reports")}>
                  Buka Antrean Laporan
                </button>
              </section>

              <section className="admin-stat-grid">
                <article className="admin-stat-card primary">
                  <span>Total Laporan</span>
                  <strong>{summary.total_tickets}</strong>
                  <small>Seluruh laporan yang diterima</small>
                </article>
                <article className="admin-stat-card warning">
                  <span>Perlu Ditinjau</span>
                  <strong>{summary.new_tickets}</strong>
                  <small>Status baru dan belum diproses</small>
                </article>
                <article className="admin-stat-card info">
                  <span>Sedang Diproses</span>
                  <strong>{summary.in_progress_tickets}</strong>
                  <small>Aktif ditangani oleh support</small>
                </article>
                <article className="admin-stat-card success">
                  <span>Selesai</span>
                  <strong>{summary.resolved_tickets}</strong>
                  <small>Laporan telah diselesaikan</small>
                </article>
              </section>

              <section className="admin-dashboard-grid">
                <article className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-kicker">Aktivitas</span>
                      <h3>Laporan Terbaru</h3>
                    </div>
                    <button type="button" className="text-button" onClick={() => setActiveView("reports")}>
                      Lihat semua
                    </button>
                  </div>

                  <div className="recent-report-list">
                    {tickets.slice(0, 5).map((ticket) => (
                      <button
                        type="button"
                        key={ticket.id}
                        onClick={() => onSelectTicket(ticket.id)}
                      >
                        <span className={`report-dot ${ticket.status}`} />
                        <div>
                          <strong>{ticket.title}</strong>
                          <small>
                            #{ticket.id} · {ticket.category || "Tanpa kategori"} ·{" "}
                            {formatDate(ticket.created_at)}
                          </small>
                        </div>
                        <span className={`status-pill ${ticket.status}`}>
                          {statusLabels[ticket.status]}
                        </span>
                      </button>
                    ))}
                    {!loading && tickets.length === 0 && (
                      <div className="admin-empty">Belum ada laporan masuk.</div>
                    )}
                  </div>
                </article>

                <article className="admin-panel ai-coverage-panel">
                  <span className="admin-kicker">AI coverage</span>
                  <h3>Cakupan Analisis</h3>
                  <div
                    className="coverage-ring"
                    style={{ "--coverage": `${analyzedPercentage * 3.6}deg` }}
                  >
                    <div>
                      <strong>{analyzedPercentage}%</strong>
                      <span>dianalisis</span>
                    </div>
                  </div>
                  <p>
                    {summary.ai_analyzed_tickets} dari {summary.total_tickets} laporan
                    memiliki insight AI.
                  </p>
                  <button type="button" className="secondary-admin-button" onClick={() => setActiveView("analytics")}>
                    Buka Analytics
                  </button>
                </article>
              </section>
            </>
          )}

          {activeView === "reports" && (
            <section className="admin-panel reports-panel">
              <div className="admin-panel-heading reports-heading">
                <div>
                  <span className="admin-kicker">Ticket management</span>
                  <h3>Semua Laporan</h3>
                  <p>{filteredTickets.length} laporan ditampilkan</p>
                </div>
                <div className="report-filters">
                  <input
                    type="search"
                    placeholder="Cari judul, kategori, atau pelapor..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                  >
                    <option value="all">Semua Status</option>
                    <option value="open">Baru</option>
                    <option value="in_progress">Diproses</option>
                    <option value="resolved">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="report-table-wrap">
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Laporan</th>
                      <th>Pelapor</th>
                      <th>Kategori</th>
                      <th>Status</th>
                      <th>AI</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id}>
                        <td className="report-id">#{ticket.id}</td>
                        <td>
                          <strong>{ticket.title}</strong>
                          <span>{ticket.description}</span>
                        </td>
                        <td>
                          <strong>{ticket.requester_name || "Anonim"}</strong>
                          <span>{ticket.requester_email || "Tanpa email"}</span>
                        </td>
                        <td>{ticket.category || "-"}</td>
                        <td>
                          <span className={`status-pill ${ticket.status}`}>
                            {statusLabels[ticket.status]}
                          </span>
                        </td>
                        <td>
                          <span className={ticket.ai_analysis ? "ai-state ready" : "ai-state"}>
                            {ticket.ai_analysis ? "Tersedia" : "Belum"}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="table-action"
                            onClick={() => onSelectTicket(ticket.id)}
                          >
                            Buka
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!loading && filteredTickets.length === 0 && (
                  <div className="admin-empty">Tidak ada laporan yang cocok.</div>
                )}
              </div>
            </section>
          )}

          {activeView === "analytics" && (
            <>
              <section className="analytics-summary">
                <article>
                  <span>Laporan Dianalisis</span>
                  <strong>{summary.ai_analyzed_tickets}</strong>
                  <small>dari {summary.total_tickets} total laporan</small>
                </article>
                <article>
                  <span>Sentimen Negatif</span>
                  <strong>{sentimentStats.negatif}</strong>
                  <small>perlu perhatian operator</small>
                </article>
                <article>
                  <span>Kategori Teratas</span>
                  <strong className="category-highlight">{categoryStats[0]?.[0] || "-"}</strong>
                  <small>{categoryStats[0]?.[1] || 0} laporan</small>
                </article>
              </section>

              <section className="analytics-grid">
                <article className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-kicker">Distribution</span>
                      <h3>Kategori Laporan</h3>
                    </div>
                  </div>
                  <div className="bar-chart">
                    {categoryStats.map(([category, count]) => (
                      <div key={category}>
                        <span>{category}</span>
                        <div>
                          <i
                            style={{
                              width: `${summary.total_tickets ? (count / summary.total_tickets) * 100 : 0}%`,
                            }}
                          />
                        </div>
                        <strong>{count}</strong>
                      </div>
                    ))}
                    {categoryStats.length === 0 && (
                      <div className="admin-empty">Belum ada data kategori.</div>
                    )}
                  </div>
                </article>

                <article className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <span className="admin-kicker">AI sentiment</span>
                      <h3>Sentimen Pengguna</h3>
                    </div>
                  </div>
                  <div className="sentiment-list">
                    <div className="positive">
                      <span>Positif</span>
                      <strong>{sentimentStats.positif}</strong>
                    </div>
                    <div className="neutral">
                      <span>Netral / Campuran</span>
                      <strong>{sentimentStats.netral}</strong>
                    </div>
                    <div className="negative">
                      <span>Negatif</span>
                      <strong>{sentimentStats.negatif}</strong>
                    </div>
                  </div>
                  <div className="analytics-note">
                    Insight berasal dari laporan yang sudah dianalisis. Hasil AI
                    tetap merupakan rekomendasi dan perlu divalidasi operator.
                  </div>
                </article>
              </section>
            </>
          )}
        </div>
      </section>

      {selectedTicket && (
        <div className="detail-backdrop" role="presentation" onMouseDown={onCloseDetail}>
          <aside
            className="admin-detail-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Detail laporan"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="drawer-header">
              <div>
                <span className="admin-kicker">Laporan #{selectedTicket.id}</span>
                <h2>{selectedTicket.title}</h2>
              </div>
              <button type="button" onClick={onCloseDetail} aria-label="Tutup detail">
                X
              </button>
            </header>

            <div className="drawer-content">
              <section className="drawer-overview">
                <div>
                  <span>Status</span>
                  <strong className={`status-pill ${selectedTicket.status}`}>
                    {statusLabels[selectedTicket.status]}
                  </strong>
                </div>
                <div>
                  <span>Kategori</span>
                  <strong>{selectedTicket.category || "-"}</strong>
                </div>
                <div>
                  <span>Versi</span>
                  <strong>v{selectedTicket.version}</strong>
                </div>
              </section>

              <section className="drawer-section">
                <h3>Informasi Laporan</h3>
                <p>{selectedTicket.description}</p>
                <dl className="drawer-meta">
                  <div>
                    <dt>Pelapor</dt>
                    <dd>{selectedTicket.requester_name || "Anonim"}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{selectedTicket.requester_email || "-"}</dd>
                  </div>
                  <div>
                    <dt>Dibuat</dt>
                    <dd>{formatDate(selectedTicket.created_at)}</dd>
                  </div>
                </dl>
              </section>

              <form onSubmit={onUpdateStatus} className="drawer-section drawer-status-form">
                <div>
                  <h3>Perbarui Status</h3>
                  <p>Perubahan menggunakan optimistic locking.</p>
                </div>
                <select
                  value={statusForm.status}
                  onChange={(event) =>
                    onStatusFormChange({ ...statusForm, status: event.target.value })
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
                  onChange={(event) =>
                    onStatusFormChange({ ...statusForm, note: event.target.value })
                  }
                />
                <button type="submit" disabled={loading}>
                  Simpan Perubahan
                </button>
              </form>

              <section className="drawer-section ai-insight-card">
                <div className="admin-panel-heading">
                  <div>
                    <span className="admin-kicker">AI assistant</span>
                    <h3>Insight Laporan</h3>
                  </div>
                  <button type="button" onClick={onAnalyze} disabled={loading}>
                    {loading ? "Menganalisis..." : "Jalankan AI"}
                  </button>
                </div>
                {selectedTicket.ai_analysis ? (
                  <div className="ai-insight-grid">
                    <div>
                      <span>Ringkasan</span>
                      <p>{selectedTicket.ai_analysis.summary || "-"}</p>
                    </div>
                    <div>
                      <span>Kategori AI</span>
                      <strong>{selectedTicket.ai_analysis.category || "-"}</strong>
                    </div>
                    <div>
                      <span>Sentimen</span>
                      <strong>{selectedTicket.ai_analysis.sentiment || "-"}</strong>
                    </div>
                    <div>
                      <span>Prioritas</span>
                      <strong>{selectedTicket.ai_analysis.priority_suggestion || "-"}</strong>
                    </div>
                    <div className="wide">
                      <span>Rekomendasi</span>
                      <p>{selectedTicket.ai_analysis.recommendation || "-"}</p>
                    </div>
                  </div>
                ) : (
                  <p className="drawer-muted">
                    Belum ada analisis AI untuk laporan ini.
                  </p>
                )}
              </section>

              <section className="drawer-section">
                <h3>Riwayat Status</h3>
                <div className="drawer-timeline">
                  {selectedTicket.status_histories?.map((history) => (
                    <div key={history.id}>
                      <i />
                      <div>
                        <strong>
                          {statusLabels[history.from_status] || "-"} ke{" "}
                          {statusLabels[history.to_status]}
                        </strong>
                        <p>{history.note || "Tanpa catatan"}</p>
                        <small>{formatDate(history.created_at)}</small>
                      </div>
                    </div>
                  ))}
                  {selectedTicket.status_histories?.length === 0 && (
                    <p className="drawer-muted">Belum ada riwayat perubahan.</p>
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

export default AdminWorkspace;
