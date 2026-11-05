
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";
import "./EmployeeDashboard.css";

const errMsg = (err, fallback) =>
    err.response?.data?.message || fallback;

const slug = (value) =>
    (value || "").toLowerCase().replace(/_/g, "-");

const fmtDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "—";

const STATUSES = [
    { key: "OPEN", label: "Open" },
    { key: "ASSIGNED", label: "Assigned" },
    { key: "IN_PROGRESS", label: "In progress" },
    { key: "RESOLVED", label: "Resolved" },
    { key: "CLOSED", label: "Closed" }
];

const STATUS_LABEL = {
    OPEN: "Open",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed"
};

const Icon = ({ name }) => {
    const paths = {
        overview: (
            <>
                <rect x="3" y="3" width="7" height="9" rx="2" />
                <rect x="14" y="3" width="7" height="5" rx="2" />
                <rect x="14" y="12" width="7" height="9" rx="2" />
                <rect x="3" y="16" width="7" height="5" rx="2" />
            </>
        ),
        board: (
            <>
                <rect x="3" y="3" width="5" height="18" rx="2" />
                <rect x="10" y="3" width="5" height="12" rx="2" />
                <rect x="17" y="3" width="4" height="8" rx="2" />
            </>
        ),
        report: (
            <>
                <path d="M12 5v14" />
                <path d="M5 12h14" />
                <circle cx="12" cy="12" r="9" />
            </>
        ),
        refresh: (
            <>
                <path d="M20 11a8 8 0 1 0-2.3 5.7" />
                <path d="M20 4v7h-7" />
            </>
        )
    };

    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
};

export default function EmployeeDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState("overview");
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchMyIncidents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/incidents/my");
            setIncidents(response.data);
        } catch (err) {
            setError(
                errMsg(err, "Unable to load your incidents.")
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyIncidents();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Statistics
    const totalIncidents = incidents.length;

    const openIncidents = incidents.filter(
        (incident) => incident.status === "OPEN"
    ).length;

    const activeIncidents = incidents.filter(
        (incident) =>
            incident.status === "ASSIGNED" ||
            incident.status === "IN_PROGRESS"
    ).length;

    const resolvedIncidents = incidents.filter(
        (incident) =>
            incident.status === "RESOLVED" ||
            incident.status === "CLOSED"
    ).length;

    // Incident card
    const renderIncidentCard = (incident) => (
        <article
            key={incident.id}
            className={`card inc p-${slug(incident.priority)}`}
        >
            <header>
                <span className="id">#{incident.id}</span>

                <span className={`tag pri-${slug(incident.priority)}`}>
                    <i />
                    {incident.priority}
                </span>
            </header>

            <h3>{incident.title}</h3>

            <p className="m">
                {incident.category} · Reported {fmtDate(incident.createdAt)}
            </p>

            <footer>
                <span className="who">
                    <span className={`tag st-${slug(incident.status)}`}>
                        {STATUS_LABEL[incident.status] || incident.status}
                    </span>
                </span>
            </footer>
        </article>
    );

    const pageInfo = {
        overview: {
            title: "Overview",
            subtitle: "Your personal security incident dashboard."
        },
        board: {
            title: "My incidents",
            subtitle: "Track and follow the progress of your reports."
        }
    };

    return (
        <div className="ad employee-dashboard">

            {/* Top navigation */}
            <header className="bar">
                <div className="brand">
                    <span className="mark">S</span>

                    <div>
                        <h1>{pageInfo[tab].title}</h1>
                        <p>{pageInfo[tab].subtitle}</p>
                    </div>
                </div>

                <div className="bar-actions">
                    <button
                        className="btn"
                        onClick={() => navigate("/employee/report")}
                    >
                        + Report incident
                    </button>

                    <button
                        className="icon-btn"
                        aria-label="Refresh incidents"
                        onClick={fetchMyIncidents}
                        disabled={loading}
                    >
                        <Icon name="refresh" />
                    </button>

                    <Link to="/profile" className="me">
                        My profile
                    </Link>

                    <button
                        className="btn ghost"
                        onClick={handleLogout}
                    >
                        Sign out
                    </button>
                </div>
            </header>

            {/* Main content */}
            <main className="stage">

                {error && (
                    <p role="alert" className="msg err">
                        {error}
                    </p>
                )}

                {/* Overview */}
                {tab === "overview" && (
                    <>
                        <section className="employee-welcome card">
                            <div>
                                <span className="employee-eyebrow">
                                    YOUR SECURITY WORKSPACE
                                </span>

                                <h2>
                                    Welcome back,{" "}
                                    {user?.fullName?.split(" ")[0] || "there"}!
                                </h2>

                                <p>
                                    Keep track of your reports and follow
                                    their progress from one place.
                                </p>
                            </div>

                            <div className="employee-welcome-icon">
                                ✦
                            </div>
                        </section>

                        <div className="section-head">
                            <h2>Incident overview</h2>
                            <span className="m">
                                A summary of your reported incidents.
                            </span>
                        </div>

                        <div className="tiles employee-tiles">
                            <div className="card tile">
                                <span>Total incidents</span>
                                <b>{totalIncidents}</b>
                                <small>All your reports</small>
                            </div>

                            <div className="card tile hot">
                                <span>Open</span>
                                <b>{openIncidents}</b>
                                <small>Awaiting assignment</small>
                            </div>

                            <div className="card tile">
                                <span>Active incidents</span>
                                <b>{activeIncidents}</b>
                                <small>Assigned or in progress</small>
                            </div>

                            <div className="card tile">
                                <span>Resolved</span>
                                <b>{resolvedIncidents}</b>
                                <small>Resolved or closed</small>
                            </div>
                        </div>

                        <div className="section-head">
                            <h2>Recent incidents</h2>

                            <button
                                className="btn ghost sm"
                                onClick={() => setTab("board")}
                            >
                                View all
                            </button>
                        </div>

                        {loading && (
                            <p className="empty">
                                Loading your incidents...
                            </p>
                        )}

                        {!loading && !error && incidents.length === 0 && (
                            <div className="empty">
                                <h3>No incidents reported yet</h3>
                                <p>
                                    Your submitted security incidents
                                    will appear here.
                                </p>

                                <button
                                    className="btn"
                                    onClick={() => navigate("/employee/report")}
                                >
                                    Report your first incident
                                </button>
                            </div>
                        )}

                        {!loading && !error && incidents.length > 0 && (
                            <div className="cards">
                                {incidents
                                    .slice(0, 4)
                                    .map(renderIncidentCard)}
                            </div>
                        )}
                    </>
                )}

                {/* My incidents */}
                {tab === "board" && (
                    <>
                        <div className="section-head">
                            <div>
                                <h2>My reported incidents</h2>
                                <span className="m">
                                    {totalIncidents} incident(s) in total
                                </span>
                            </div>

                            <button
                                className="btn"
                                onClick={() => navigate("/employee/report")}
                            >
                                + New report
                            </button>
                        </div>

                        {loading && (
                            <p className="empty">
                                Loading your incidents...
                            </p>
                        )}

                        {!loading && !error && incidents.length === 0 && (
                            <p className="empty">
                                You haven't reported any incidents yet.
                            </p>
                        )}

                        {!loading && !error && incidents.length > 0 && (
                            <div className="board employee-board">
                                {STATUSES.map((status) => {
                                    const items = incidents.filter(
                                        (incident) =>
                                            incident.status === status.key
                                    );

                                    return (
                                        <section
                                            key={status.key}
                                            className="col"
                                        >
                                            <h2>
                                                <i />
                                                {status.label}
                                                <span>{items.length}</span>
                                            </h2>

                                            {items.length === 0 && (
                                                <p className="empty">
                                                    Nothing here.
                                                </p>
                                            )}

                                            {items.map(renderIncidentCard)}
                                        </section>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Floating navigation */}
            <nav className="dock" aria-label="Employee sections">
                <button
                    className={tab === "overview" ? "on" : ""}
                    onClick={() => setTab("overview")}
                    aria-current={tab === "overview" ? "page" : undefined}
                >
                    <Icon name="overview" />
                    <span>Overview</span>
                </button>

                <button
                    className={tab === "board" ? "on" : ""}
                    onClick={() => setTab("board")}
                    aria-current={tab === "board" ? "page" : undefined}
                >
                    <Icon name="board" />
                    <span>My incidents</span>
                    <em>{totalIncidents}</em>
                </button>
            </nav>
        </div>
    );
}
