/* eslint-disable react/prop-types */

const reportCategories = [
  {
    value: "Masalah Teknis",
    code: "01",
    title: "Masalah Teknis",
    description: "Error, gagal login, atau fitur yang tidak berjalan.",
  },
  {
    value: "Pertanyaan",
    code: "02",
    title: "Pertanyaan",
    description: "Bantuan penggunaan atau informasi tentang layanan.",
  },
  {
    value: "Feedback",
    code: "03",
    title: "Feedback",
    description: "Pengalaman, kritik, atau masukan terhadap layanan.",
  },
  {
    value: "Permintaan Fitur",
    code: "04",
    title: "Permintaan Fitur",
    description: "Ide fitur baru yang dapat meningkatkan pengalaman.",
  },
];

const processSteps = [
  {
    number: "01",
    title: "Kirim laporan",
    description: "Tuliskan kendala atau masukan melalui formulir.",
  },
  {
    number: "02",
    title: "Ditinjau support",
    description: "Admin membaca, mengelompokkan, dan menentukan prioritas.",
  },
  {
    number: "03",
    title: "Ditindaklanjuti",
    description: "Status diperbarui hingga laporan dinyatakan selesai.",
  },
];

const statusLabels = {
  open: "Baru",
  in_progress: "Diproses",
  resolved: "Selesai",
};

function UserPortal({
  form,
  formErrors,
  loading,
  message,
  submittedReport,
  onFormChange,
  onSubmit,
  onOpenAdmin,
  onResetReport,
}) {
  const selectCategory = (category) => {
    onFormChange({ ...form, category });
    document
      .getElementById("form-laporan")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="user-portal">
      <header className="user-header">
        <a className="user-brand" href="#beranda" aria-label="InsightDesk">
          <span className="user-brand-mark">ID</span>
          <span>
            <strong>InsightDesk</strong>
            <small>Support & Feedback Center</small>
          </span>
        </a>

        <nav className="user-nav" aria-label="Navigasi utama">
          <a href="#beranda">Beranda</a>
          <a href="#jenis-laporan">Jenis Laporan</a>
          <a href="#cara-kerja">Cara Kerja</a>
        </nav>

        <button className="admin-access" type="button" onClick={onOpenAdmin}>
          Masuk sebagai Admin
        </button>
      </header>

      <section className="user-hero" id="beranda">
        <div className="user-hero-copy">
          <span className="user-kicker">
            Pusat bantuan yang lebih cepat dan terarah
          </span>
          <h1>
            Ceritakan kendala Anda, <span>kami bantu menindaklanjuti.</span>
          </h1>
          <p>
            Kirim laporan masalah, pertanyaan, atau masukan melalui InsightDesk.
            Setiap laporan akan masuk ke Admin Support untuk ditinjau dan
            dikelola secara terstruktur.
          </p>

          <div className="user-hero-actions">
            <a className="user-primary-action" href="#form-laporan">
              Buat Laporan
              <span aria-hidden="true">→</span>
            </a>
            <a className="user-text-link" href="#cara-kerja">
              Pelajari cara kerjanya
            </a>
          </div>

          <div className="user-trust-list">
            <span>Tanpa akun</span>
            <span>Data sensitif dimasking</span>
            <span>Nomor laporan otomatis</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Ilustrasi alur laporan">
          <div className="hero-glow" />
          <article className="hero-ticket-card">
            <div className="hero-ticket-head">
              <span className="hero-ticket-icon">!</span>
              <div>
                <small>Laporan #1024</small>
                <strong>Tidak dapat masuk ke akun</strong>
              </div>
              <span className="hero-status">Baru</span>
            </div>
            <p>
              Laporan diterima dan siap ditinjau oleh tim Admin Support.
            </p>
            <div className="hero-progress">
              <span className="active" />
              <span />
              <span />
            </div>
            <div className="hero-progress-labels">
              <strong>Diterima</strong>
              <span>Diproses</span>
              <span>Selesai</span>
            </div>
          </article>

          <div className="hero-ai-note">
            <span>AI</span>
            <p>
              Membantu operator merangkum dan mengelompokkan laporan sebagai
              rekomendasi.
            </p>
          </div>
        </div>
      </section>

      <section className="user-proof">
        <div>
          <strong>Satu pintu</strong>
          <span>untuk kendala dan feedback</span>
        </div>
        <div>
          <strong>Terstruktur</strong>
          <span>setiap laporan memiliki status</span>
        </div>
        <div>
          <strong>Tetap terkontrol</strong>
          <span>keputusan akhir ada pada operator</span>
        </div>
      </section>

      <section className="report-types user-section" id="jenis-laporan">
        <div className="user-section-heading">
          <div>
            <span className="user-kicker">Pilih kebutuhan Anda</span>
            <h2>Apa yang ingin Anda sampaikan?</h2>
          </div>
          <p>
            Memilih kategori yang tepat membantu Admin Support memahami konteks
            laporan lebih cepat.
          </p>
        </div>

        <div className="report-type-grid">
          {reportCategories.map((category) => (
            <button
              className={
                form.category === category.value
                  ? "report-type-card active"
                  : "report-type-card"
              }
              key={category.value}
              type="button"
              onClick={() => selectCategory(category.value)}
            >
              <span>{category.code}</span>
              <strong>{category.title}</strong>
              <p>{category.description}</p>
              <i aria-hidden="true">→</i>
            </button>
          ))}
        </div>
      </section>

      <section className="user-process user-section" id="cara-kerja">
        <div className="user-section-heading compact">
          <div>
            <span className="user-kicker">Cara kerja InsightDesk</span>
            <h2>Tiga langkah sederhana</h2>
          </div>
        </div>

        <div className="user-process-grid">
          {processSteps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="report-area user-section" id="form-laporan">
        <div className="report-form-intro">
          <span className="user-kicker">Form pelaporan</span>
          <h2>Kirim laporan Anda</h2>
          <p>
            Berikan informasi yang jelas agar laporan dapat dipahami dan
            ditindaklanjuti dengan tepat.
          </p>

          <div className="report-help-card">
            <strong>Tips laporan yang baik</strong>
            <ul>
              <li>Gunakan judul yang singkat dan spesifik.</li>
              <li>Jelaskan kejadian dan langkah yang sudah dicoba.</li>
              <li>Sebutkan hasil yang Anda harapkan.</li>
            </ul>
          </div>

          <div className="report-security-note">
            <span>Privasi data</span>
            <p>
              Jangan sertakan password atau PIN. Informasi sensitif akan
              dimasking sebelum teks diproses oleh layanan AI.
            </p>
          </div>
        </div>

        <div className="user-form-card">
          {message && (
            <div className="user-alert" role="status">
              {message}
            </div>
          )}

          {submittedReport ? (
            <div className="user-report-receipt" aria-live="polite">
              <span className="receipt-check">✓</span>
              <span className="user-kicker">Laporan berhasil dikirim</span>
              <h2>Terima kasih sudah menghubungi kami</h2>
              <p>
                Laporan Anda sudah masuk ke antrean Admin Support. Simpan nomor
                laporan ini sebagai referensi.
              </p>

              <div className="receipt-number">
                <span>Nomor laporan</span>
                <strong>#{submittedReport.id}</strong>
              </div>

              <dl className="user-receipt-details">
                <div>
                  <dt>Judul</dt>
                  <dd>{submittedReport.title}</dd>
                </div>
                <div>
                  <dt>Jenis</dt>
                  <dd>{submittedReport.category || "-"}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    {statusLabels[submittedReport.status] ||
                      submittedReport.status}
                  </dd>
                </div>
              </dl>

              <button
                className="user-secondary-button"
                type="button"
                onClick={onResetReport}
              >
                Kirim Laporan Lain
              </button>
            </div>
          ) : (
            <form className="user-report-form" onSubmit={onSubmit}>
              <div className="user-form-heading">
                <div>
                  <h3>Detail laporan</h3>
                  <p>Kolom bertanda * wajib diisi.</p>
                </div>
                <span>01</span>
              </div>

              <label>
                Jenis laporan *
                <select
                  value={form.category}
                  onChange={(event) =>
                    onFormChange({ ...form, category: event.target.value })
                  }
                  aria-invalid={Boolean(formErrors.category)}
                  required
                >
                  <option value="" disabled>
                    Pilih jenis laporan
                  </option>
                  {reportCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.title}
                    </option>
                  ))}
                  <option value="Lainnya">Lainnya</option>
                </select>
                <small
                  className={formErrors.category ? "user-field-error" : ""}
                >
                  {formErrors.category?.[0] ||
                    "Pilih kategori yang paling sesuai."}
                </small>
              </label>

              <label>
                Judul laporan *
                <input
                  type="text"
                  placeholder="Contoh: Tidak dapat masuk ke akun"
                  value={form.title}
                  onChange={(event) =>
                    onFormChange({ ...form, title: event.target.value })
                  }
                  maxLength={150}
                  aria-invalid={Boolean(formErrors.title)}
                  required
                />
                <span className="user-field-meta">
                  <small className="user-field-error">
                    {formErrors.title?.[0] || ""}
                  </small>
                  <small>{form.title.length}/150</small>
                </span>
              </label>

              <label>
                Detail laporan *
                <textarea
                  placeholder="Ceritakan apa yang terjadi, kapan mulai terjadi, dan langkah apa yang sudah Anda coba."
                  value={form.description}
                  onChange={(event) =>
                    onFormChange({ ...form, description: event.target.value })
                  }
                  aria-invalid={Boolean(formErrors.description)}
                  required
                />
                <span className="user-field-meta">
                  <small className="user-field-error">
                    {formErrors.description?.[0] || ""}
                  </small>
                  <small>{form.description.length} karakter</small>
                </span>
              </label>

              <div className="user-form-row">
                <label>
                  Nama pelapor
                  <input
                    type="text"
                    placeholder="Nama Anda"
                    value={form.requester_name}
                    onChange={(event) =>
                      onFormChange({
                        ...form,
                        requester_name: event.target.value,
                      })
                    }
                    maxLength={100}
                  />
                  <small>Opsional</small>
                </label>

                <label>
                  Email untuk dihubungi
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={form.requester_email}
                    onChange={(event) =>
                      onFormChange({
                        ...form,
                        requester_email: event.target.value,
                      })
                    }
                    maxLength={150}
                    aria-invalid={Boolean(formErrors.requester_email)}
                  />
                  <small
                    className={
                      formErrors.requester_email ? "user-field-error" : ""
                    }
                  >
                    {formErrors.requester_email?.[0] ||
                      "Opsional, untuk kebutuhan tindak lanjut."}
                  </small>
                </label>
              </div>

              <button
                className="user-submit-button"
                type="submit"
                disabled={loading}
              >
                <span>
                  {loading ? "Sedang mengirim..." : "Kirim laporan sekarang"}
                </span>
                <i aria-hidden="true">→</i>
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="user-footer">
        <div className="user-brand">
          <span className="user-brand-mark">ID</span>
          <span>
            <strong>InsightDesk</strong>
            <small>AI-Powered Support Ticket & Feedback Analyzer</small>
          </span>
        </div>
        <p>
          AI membantu memberikan rekomendasi. Keputusan akhir tetap berada pada
          Admin Support.
        </p>
      </footer>
    </main>
  );
}

export default UserPortal;
