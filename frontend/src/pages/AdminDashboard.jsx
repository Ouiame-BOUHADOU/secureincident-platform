import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./AdminDashboard.css";

const errMsg = (err, fallback) => err.response?.data?.message || fallback;
const slug = (v) => (v || "").toLowerCase().replace(/_/g, "-");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
const fmtTime = (d) => (d ? new Date(d).toLocaleString() : "—");
const STATUS_LABEL = { OPEN: "Open", IN_PROGRESS: "In progress", RESOLVED: "Resolved", CLOSED: "Closed" };

const Icon = ({ name }) => {
    const paths = {
        overview: <><rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" /><rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" /></>,
        board: <><rect x="3" y="3" width="5" height="18" rx="2" /><rect x="10" y="3" width="5" height="12" rx="2" /><rect x="17" y="3" width="4" height="8" rx="2" /></>,
        team: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5" /><circle cx="17.5" cy="9" r="2.5" /><path d="M18 14.5c2 .3 3.4 1.7 3.8 4.5" /></>,
        refresh: <><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 4v7h-7" /></>
    };
    return (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {paths[name]}
        </svg>
    );
};

export default function AdminDashboard() {
    const [tab, setTab] = useState("overview");

    const [statistics, setStatistics] = useState(null);
    const [error, setError] = useState("");

    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [usersError, setUsersError] = useState("");
    const [updatingUserId, setUpdatingUserId] = useState(null);

    const [incidents, setIncidents] = useState([]);
    const [incidentsLoading, setIncidentsLoading] = useState(true);
    const [incidentsError, setIncidentsError] = useState("");
    const [query, setQuery] = useState("");

    const [showCreate, setShowCreate] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [creating, setCreating] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [formError, setFormError] = useState("");

    const [assigningIncidentId, setAssigningIncidentId] = useState(null);
    const [selectedTechnicians, setSelectedTechnicians] = useState({});
    const [assignmentMessage, setAssignmentMessage] = useState("");
    const [assignmentError, setAssignmentError] = useState("");

    const [selectedIncident, setSelectedIncident] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState("");
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState("");
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    // Technicians come from the users list: one request instead of two.
    const technicians = users.filter((u) => u.role === "TECHNICIAN" && u.enabled);

    const fetchStatistics = async () => {
        try {
            const response = await api.get("/admin/statistics");
            setStatistics(response.data);
        } catch (err) {
            setError(errMsg(err, "Unable to load dashboard statistics."));
        }
    };

    const fetchUsers = async () => {
        setUsersLoading(true);
        setUsersError("");
        try {
            const response = await api.get("/admin/users");
            setUsers(response.data);
        } catch (err) {
            setUsersError(errMsg(err, "Unable to load users."));
        } finally {
            setUsersLoading(false);
        }
    };

    const fetchIncidents = async () => {
        setIncidentsLoading(true);
        setIncidentsError("");
        try {
            const response = await api.get("/incidents");
            setIncidents(response.data);
        } catch (err) {
            setIncidentsError(errMsg(err, "Unable to load incidents."));
        } finally {
            setIncidentsLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
        fetchUsers();
        fetchIncidents();
    }, []);

    const handleCreateTechnician = async (e) => {
        e.preventDefault();
        setCreating(true);
        setFormError("");
        setSuccessMessage("");
        try {
            await api.post("/admin/technicians", { fullName, email, password });
            setSuccessMessage("Technician account created.");
            setFullName("");
            setEmail("");
            setPassword("");
            setShowCreate(false);
            await Promise.all([fetchStatistics(), fetchUsers()]);
        } catch (err) {
            setFormError(errMsg(err, "Unable to create technician account."));
        } finally {
            setCreating(false);
        }
    };

    const handleToggleUserStatus = async (user) => {
        setUpdatingUserId(user.id);
        setUsersError("");
        try {
            await api.put(`/admin/users/${user.id}/${user.enabled ? "disable" : "enable"}`);
            await fetchUsers();
        } catch (err) {
            setUsersError(errMsg(err, "Unable to update user status."));
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleLoadComments = async (incidentId) => {
        try {
            setCommentsLoading(true);
            setCommentsError("");
            const response = await api.get(`/incidents/${incidentId}/comments`);
            setComments(response.data);
        } catch (err) {
            setCommentsError(errMsg(err, "Unable to load incident comments."));
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleLoadHistory = async (incidentId) => {
        try {
            setHistoryLoading(true);
            setHistoryError("");
            const response = await api.get(`/incidents/${incidentId}/history`);
            setHistory(response.data);
        } catch (err) {
            setHistoryError(errMsg(err, "Unable to load incident history."));
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleViewIncident = async (incidentId) => {
        try {
            setDetailsLoading(true);
            setDetailsError("");
            setSelectedIncident({ id: incidentId, loading: true });
            setComments([]);
            setHistory([]);
            const response = await api.get(`/incidents/${incidentId}`);
            setSelectedIncident(response.data);
            await Promise.all([handleLoadComments(incidentId), handleLoadHistory(incidentId)]);
        } catch (err) {
            setDetailsError(errMsg(err, "Unable to load incident details."));
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleAssignTechnician = async (incidentId) => {
        const technicianId = selectedTechnicians[incidentId];
        if (!technicianId) {
            setAssignmentError("Select a technician first.");
            return;
        }
        setAssigningIncidentId(incidentId);
        setAssignmentError("");
        setAssignmentMessage("");
        try {
            await api.put(`/incidents/${incidentId}/assign/${technicianId}`);
            setAssignmentMessage(`Incident #${incidentId} assigned.`);
            setSelectedTechnicians((prev) => ({ ...prev, [incidentId]: "" }));
            await fetchIncidents();
        } catch (err) {
            setAssignmentError(errMsg(err, "Unable to assign technician."));
        } finally {
            setAssigningIncidentId(null);
        }
    };

    const handleCloseIncident = async (incidentId) => {
        if (!window.confirm(`Close incident #${incidentId}?`)) return;
        setAssignmentError("");
        setAssignmentMessage("");
        try {
            await api.put(`/incidents/${incidentId}/status`, { status: "CLOSED" });
            setAssignmentMessage(`Incident #${incidentId} closed.`);
            await Promise.all([fetchIncidents(), fetchStatistics()]);
        } catch (err) {
            setAssignmentError(errMsg(err, "Unable to close incident."));
        }
    };

    /* ---------- derived ---------- */
    const pipeline = statistics
        ? [
            { key: "OPEN", label: "Open", value: statistics.openIncidents ?? 0, color: "var(--open)" },
            { key: "IN_PROGRESS", label: "In progress", value: statistics.inProgressIncidents ?? 0, color: "var(--prog)" },
            { key: "RESOLVED", label: "Resolved", value: statistics.resolvedIncidents ?? 0, color: "var(--done)" },
            { key: "CLOSED", label: "Closed", value: statistics.closedIncidents ?? 0, color: "var(--closed)" }
        ]
        : [];

    const needsTech = incidents.filter(
        (i) => !i.assignedTechnicianName && i.status !== "CLOSED" && i.status !== "RESOLVED"
    );

    const visibleIncidents = incidents.filter((i) => {
        const q = query.trim().toLowerCase();
        const matchQuery = !q || i.title?.toLowerCase().includes(q) || String(i.id).includes(q.replace("#", ""));
        return matchQuery;
    });

    /* ---------- view helpers ---------- */
    const total = pipeline.reduce((sum, s) => sum + s.value, 0);
    const active = (statistics?.openIncidents ?? 0) + (statistics?.inProgressIncidents ?? 0);
    const R = 74;
    const C = 2 * Math.PI * R;
    let acc = 0;
    const arcs = pipeline.map((s) => {
        const len = total ? (s.value / total) * C : 0;
        const arc = { ...s, len, off: acc };
        acc += len;
        return arc;
    });

    const renderCard = (incident) => (
        <article key={incident.id} className={`card inc p-${slug(incident.priority)}`}>
            <header>
                <span className="id">#{incident.id}</span>
                <span className={`tag pri-${slug(incident.priority)}`}><i />{incident.priority}</span>
            </header>
            <h3>{incident.title}</h3>
            <p className="m">{incident.category} · {incident.creatorName}</p>
            <div className="assign">
                <select
                    aria-label={`Technician for incident ${incident.id}`}
                    value={selectedTechnicians[incident.id] || ""}
                    onChange={(e) => setSelectedTechnicians((p) => ({ ...p, [incident.id]: e.target.value }))}
                >
                    <option value="">Choose technician</option>
                    {technicians.map((t) => (
                        <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                </select>
                <button
                    className="btn sm"
                    onClick={() => handleAssignTechnician(incident.id)}
                    disabled={!selectedTechnicians[incident.id] || assigningIncidentId === incident.id}
                >
                    {assigningIncidentId === incident.id ? "..." : incident.assignedTechnicianName ? "Reassign" : "Assign"}
                </button>
            </div>
            <footer>
                <span className="who">
                    {incident.assignedTechnicianName ? `With ${incident.assignedTechnicianName}` : "Unassigned"}
                </span>
                <span className="acts">
                    <button className="btn ghost sm" onClick={() => handleViewIncident(incident.id)}>Details</button>
                    {incident.status === "RESOLVED" && (
                        <button className="btn sm" onClick={() => handleCloseIncident(incident.id)}>Close</button>
                    )}
                </span>
            </footer>
        </article>
    );

    const notices = (
        <>
            {assignmentMessage && <p role="status" className="msg ok">{assignmentMessage}</p>}
            {assignmentError && <p role="alert" className="msg err">{assignmentError}</p>}
        </>
    );

    const subtitles = {
        overview: "Live picture of every incident on the platform.",
        board: "Drag-free triage: see each stage and route work in one place.",
        team: "People who report and resolve incidents."
    };

    return (
        <div className="ad">
            <header className="bar">
                <div className="brand">
                    <span className="mark">S</span>
                    <div>
                        <h1>{tab === "overview" ? "Overview" : tab === "board" ? "Incident board" : "Team"}</h1>
                        <p>{subtitles[tab]}</p>
                    </div>
                </div>
                <div className="bar-actions">
                    {tab === "team" && <button className="btn" onClick={() => setShowCreate(true)}>New technician</button>}
                    <button className="icon-btn" aria-label="Refresh data" onClick={() => { fetchIncidents(); fetchStatistics(); fetchUsers(); }}>
                        <Icon name="refresh" />
                    </button>
                    <Link to="/profile" className="me">My profile</Link>
                </div>
            </header>

            <main className="stage">
                {error && <p role="alert" className="msg err">{error}</p>}

                {tab === "overview" && (
                    <>
                        <div className="bento">
                            <section className="card ring-card">
                                <svg viewBox="0 0 200 200" className="ring" role="img" aria-label="Incidents by status">
                                    <circle cx="100" cy="100" r={R} className="track" />
                                    {arcs.map((a) => (
                                        <circle
                                            key={a.key}
                                            cx="100" cy="100" r={R}
                                            className="arc"
                                            stroke={a.color}
                                            strokeDasharray={`${Math.max(a.len - 5, 0)} ${C}`}
                                            strokeDashoffset={-a.off}
                                        />
                                    ))}
                                    <text x="100" y="98" textAnchor="middle" className="ring-n">{active}</text>
                                    <text x="100" y="120" textAnchor="middle" className="ring-l">active now</text>
                                </svg>
                                <ul className="key">
                                    {pipeline.map((s) => (
                                        <li key={s.key}><i style={{ background: s.color }} />{s.label}<b>{s.value}</b></li>
                                    ))}
                                </ul>
                            </section>

                            <div className="tiles">
                                <div className="card tile hot"><span>Waiting for a technician</span><b>{needsTech.length}</b></div>
                                <div className="card tile"><span>Total incidents</span><b>{statistics?.totalIncidents ?? 0}</b></div>
                                <div className="card tile"><span>Technicians</span><b>{statistics?.technicians ?? 0}</b></div>
                                <div className="card tile"><span>Employees</span><b>{statistics?.employees ?? 0}</b></div>
                            </div>
                        </div>

                        <div className="section-head">
                            <h2>Needs attention</h2>
                            <span className="m">Active incidents with no technician</span>
                        </div>
                        {notices}
                        {incidentsLoading && <p className="empty">Loading incidents...</p>}
                        {incidentsError && <p role="alert" className="msg err">{incidentsError}</p>}
                        {!incidentsLoading && !incidentsError && needsTech.length === 0 && (
                            <p className="empty">All clear. Every active incident has an owner.</p>
                        )}
                        <div className="cards">{needsTech.map(renderCard)}</div>
                    </>
                )}

                {tab === "board" && (
                    <>
                        <div className="finder">
                            <input
                                type="search"
                                placeholder="Search by title or #ID"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        {notices}
                        {incidentsLoading && <p className="empty">Loading incidents...</p>}
                        {incidentsError && <p role="alert" className="msg err">{incidentsError}</p>}
                        <div className="board">
                            {pipeline.map((col) => {
                                const items = visibleIncidents.filter((i) => i.status === col.key);
                                return (
                                    <section key={col.key} className={`col ${col.key === "CLOSED" ? "dim" : ""}`}>
                                        <h2><i style={{ background: col.color }} />{col.label}<span>{items.length}</span></h2>
                                        {items.length === 0 && <p className="empty">Nothing here.</p>}
                                        {items.map(renderCard)}
                                    </section>
                                );
                            })}
                        </div>
                    </>
                )}

                {tab === "team" && (
                    <>
                        {successMessage && <p role="status" className="msg ok">{successMessage}</p>}
                        {usersError && <p role="alert" className="msg err">{usersError}</p>}
                        {usersLoading && <p className="empty">Loading users...</p>}
                        {!usersLoading && users.length === 0 && !usersError && <p className="empty">No users yet. Add the first technician.</p>}
                        <div className="people">
                            {users.map((u) => (
                                <article key={u.id} className={`card person ${u.enabled ? "" : "off"}`}>
                                    <span className="avatar">{(u.fullName || "?").charAt(0).toUpperCase()}</span>
                                    <div className="who-info">
                                        <h3>{u.fullName}</h3>
                                        <p className="m">{u.email}</p>
                                        <p className="m">{u.role} · joined {fmtDate(u.createdAt)}</p>
                                    </div>
                                    <button
                                        role="switch"
                                        aria-checked={u.enabled}
                                        aria-label={`${u.enabled ? "Disable" : "Enable"} ${u.fullName}`}
                                        className={`switch ${u.enabled ? "on" : ""}`}
                                        onClick={() => handleToggleUserStatus(u)}
                                        disabled={updatingUserId === u.id}
                                    ><span /></button>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </main>

            <nav className="dock" aria-label="Admin sections">
                {[["overview", "Overview", null], ["board", "Board", incidents.length], ["team", "Team", users.length]].map(([key, label, n]) => (
                    <button key={key} className={tab === key ? "on" : ""} onClick={() => setTab(key)} aria-current={tab === key ? "page" : undefined}>
                        <Icon name={key} />
                        <span>{label}</span>
                        {n !== null && <em>{n}</em>}
                    </button>
                ))}
            </nav>

            {showCreate && (
                <div className="scrim center" onClick={() => setShowCreate(false)}>
                    <form className="sheet" onClick={(e) => e.stopPropagation()} onSubmit={handleCreateTechnician}>
                        <h2>New technician</h2>
                        <p className="m">They sign in with these details and can change the password later.</p>
                        <label className="field"><span>Full name</span>
                            <input value={fullName} onChange={(e) => setFullName(e.target.value)} required maxLength={100} placeholder="Technician's full name" />
                        </label>
                        <label className="field"><span>Email address</span>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={150} placeholder="technician@example.com" />
                        </label>
                        <label className="field"><span>Temporary password</span>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={100} placeholder="At least 8 characters" />
                        </label>
                        {formError && <p role="alert" className="msg err">{formError}</p>}
                        <div className="acts end">
                            <button type="button" className="btn ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                            <button type="submit" className="btn" disabled={creating}>{creating ? "Creating..." : "Create technician"}</button>
                        </div>
                    </form>
                </div>
            )}

            {selectedIncident && (
                <div className="scrim" onClick={() => setSelectedIncident(null)}>
                    <aside className="panel" onClick={(e) => e.stopPropagation()} aria-label="Incident details">
                        <div className="acts between">
                            <span className="id">Incident #{selectedIncident.id}</span>
                            <button className="btn ghost sm" onClick={() => setSelectedIncident(null)}>Close panel</button>
                        </div>
                        {detailsLoading && <p className="empty">Loading incident details...</p>}
                        {detailsError && <p role="alert" className="msg err">{detailsError}</p>}
                        {!selectedIncident.loading && (
                            <>
                                <h2>{selectedIncident.title}</h2>
                                <div className="chips">
                                    <span className={`tag st-${slug(selectedIncident.status)}`}>{STATUS_LABEL[selectedIncident.status] || selectedIncident.status}</span>
                                    <span className={`tag pri-${slug(selectedIncident.priority)}`}><i />{selectedIncident.priority}</span>
                                    <span className="tag">{selectedIncident.category}</span>
                                </div>
                                <p className="desc">{selectedIncident.description}</p>
                                <dl className="kv">
                                    <dt>Reported by</dt><dd>{selectedIncident.creatorName}</dd>
                                    <dt>Technician</dt><dd>{selectedIncident.assignedTechnicianName || "Unassigned"}</dd>
                                    <dt>Created</dt><dd>{fmtTime(selectedIncident.createdAt)}</dd>
                                    <dt>Last updated</dt><dd>{fmtTime(selectedIncident.updatedAt)}</dd>
                                </dl>

                                <h3>Comments</h3>
                                {commentsLoading && <p className="empty">Loading comments...</p>}
                                {commentsError && <p role="alert" className="msg err">{commentsError}</p>}
                                {!commentsLoading && !commentsError && comments.length === 0 && <p className="empty">No comments yet.</p>}
                                {comments.map((c) => (
                                    <div key={c.id} className="bubble">
                                        <strong>{c.authorName}</strong>
                                        <p>{c.content}</p>
                                        <small>{fmtTime(c.createdAt)}</small>
                                    </div>
                                ))}

                                <h3>History</h3>
                                {historyLoading && <p className="empty">Loading history...</p>}
                                {historyError && <p role="alert" className="msg err">{historyError}</p>}
                                {!historyLoading && !historyError && history.length === 0 && <p className="empty">No history recorded.</p>}
                                <ul className="tl">
                                    {history.map((h) => (
                                        <li key={h.id}>
                                            <strong>{h.action}</strong>
                                            <p>{h.details}</p>
                                            <small>{h.performedBy || "System"} · {fmtTime(h.createdAt)}</small>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </aside>
                </div>
            )}
        </div>
    );
}