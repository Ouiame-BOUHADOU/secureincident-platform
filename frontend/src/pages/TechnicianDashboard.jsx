
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";
import "./TechnicianDashboard.css";

function Icon({ name, size = 18 }) {
    const paths = {
        overview: (
            <>
                <rect x="3" y="3" width="8" height="8" rx="2" />
                <rect x="13" y="3" width="8" height="5" rx="2" />
                <rect x="13" y="10" width="8" height="11" rx="2" />
                <rect x="3" y="13" width="8" height="8" rx="2" />
            </>
        ),
        incidents: (
            <>
                <path d="M8 3h8l4 4v14H4V3h4Z" />
                <path d="M8 3v5h8V3" />
                <path d="M8 13h8M8 17h5" />
            </>
        ),
        refresh: (
            <>
                <path d="M20 7v5h-5" />
                <path d="M4 17v-5h5" />
                <path d="M5.6 9a7 7 0 0 1 11.6-2L20 12" />
                <path d="M18.4 15a7 7 0 0 1-11.6 2L4 12" />
            </>
        ),
        logout: (
            <>
                <path d="M10 17l5-5-5-5" />
                <path d="M15 12H3" />
                <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            </>
        ),
        alert: (
            <>
                <path d="m10.3 3.9-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3.1l-8-14a2 2 0 0 0-3.4 0Z" />
                <path d="M12 9v4M12 17h.01" />
            </>
        ),
        clock: (
            <>
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </>
        ),
        check: (
            <>
                <path d="m5 12 4 4L19 6" />
            </>
        ),
        close: (
            <>
                <path d="m18 6-12 12M6 6l12 12" />
            </>
        ),
        comment: (
            <>
                <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
            </>
        ),
        history: (
            <>
                <path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" />
                <path d="M3 3v5h5" />
                <path d="M12 7v5l3 2" />
            </>
        )
    };

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {paths[name]}
        </svg>
    );
}

const STATUS_LABELS = {
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    RESOLVED: "Resolved",
    CLOSED: "Closed"
};

const getStatusClass = (status) =>
    status?.toLowerCase().replaceAll("_", "-") || "unknown";

const getPriorityClass = (priority) =>
    priority?.toLowerCase() || "unknown";

const formatDate = (date, withTime = false) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
        undefined,
        withTime
            ? { dateStyle: "medium", timeStyle: "short" }
            : { dateStyle: "medium" }
    );
};

export default function TechnicianDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tab, setTab] = useState("overview");

    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedIncident, setSelectedIncident] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState("");

    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusUpdateMessage, setStatusUpdateMessage] = useState("");

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState("");

    const [newComment, setNewComment] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);
    const [commentMessage, setCommentMessage] = useState("");

    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");

    const fetchAssignedIncidents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/incidents/assigned");
            setIncidents(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your assigned incidents."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedIncidents();
    }, []);

    const handleLoadComments = async (incidentId) => {
        try {
            setCommentsLoading(true);
            setCommentsError("");

            const response = await api.get(
                `/incidents/${incidentId}/comments`
            );

            setComments(response.data);
        } catch (err) {
            setCommentsError(
                err.response?.data?.message ||
                "Unable to load incident comments."
            );
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleLoadHistory = async (incidentId) => {
        try {
            setHistoryLoading(true);
            setHistoryError("");

            const response = await api.get(
                `/incidents/${incidentId}/history`
            );

            setHistory(response.data);
        } catch (err) {
            setHistoryError(
                err.response?.data?.message ||
                "Unable to load incident history."
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleViewIncident = async (incidentId) => {
        try {
            setDetailsLoading(true);
            setDetailsError("");
            setSelectedIncident(null);

            setComments([]);
            setHistory([]);
            setNewComment("");
            setCommentMessage("");
            setStatusUpdateMessage("");

            const response = await api.get(`/incidents/${incidentId}`);

            setSelectedIncident(response.data);

            await Promise.all([
                handleLoadComments(incidentId),
                handleLoadHistory(incidentId)
            ]);
        } catch (err) {
            setDetailsError(
                err.response?.data?.message ||
                "Unable to load incident details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleAddComment = async (event) => {
        event.preventDefault();

        if (!selectedIncident || !newComment.trim()) {
            return;
        }

        try {
            setCommentSubmitting(true);
            setCommentMessage("");

            await api.post(
                `/incidents/${selectedIncident.id}/comments`,
                { content: newComment.trim() }
            );

            setNewComment("");

            await handleLoadComments(selectedIncident.id);

            setCommentMessage("Comment added successfully.");
        } catch (err) {
            setCommentMessage(
                err.response?.data?.message ||
                "Unable to add your comment."
            );
        } finally {
            setCommentSubmitting(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        if (!selectedIncident) return;

        try {
            setStatusUpdating(true);
            setStatusUpdateMessage("");

            await api.put(
                `/incidents/${selectedIncident.id}/status`,
                { status: newStatus }
            );

            const [detailsResponse, incidentsResponse] = await Promise.all([
                api.get(`/incidents/${selectedIncident.id}`),
                api.get("/incidents/assigned")
            ]);

            setSelectedIncident(detailsResponse.data);
            setIncidents(incidentsResponse.data);

            await handleLoadHistory(selectedIncident.id);

            setStatusUpdateMessage(
                `Incident status updated to ${newStatus.replaceAll("_", " ")}.`
            );
        } catch (err) {
            setStatusUpdateMessage(
                err.response?.data?.message ||
                "Unable to update the incident status."
            );
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const totalAssigned = incidents.length;

    const criticalIncidents = incidents.filter(
        (incident) => incident.priority === "CRITICAL"
    ).length;

    const inProgressIncidents = incidents.filter(
        (incident) => incident.status === "IN_PROGRESS"
    ).length;

    const resolvedIncidents = incidents.filter(
        (incident) => incident.status === "RESOLVED"
    ).length;

    const statistics = [
        {
            label: "Total Assigned",
            value: totalAssigned,
            detail: "Incidents assigned to you",
            icon: "incidents",
            className: "technician-stat-total"
        },
        {
            label: "Critical Incidents",
            value: criticalIncidents,
            detail: "Require urgent attention",
            icon: "alert",
            className: "technician-stat-critical"
        },
        {
            label: "In Progress",
            value: inProgressIncidents,
            detail: "Currently being handled",
            icon: "clock",
            className: "technician-stat-progress"
        },
        {
            label: "Resolved",
            value: resolvedIncidents,
            detail: "Successfully resolved",
            icon: "check",
            className: "technician-stat-resolved"
        }
    ];

    const statusGroups = [
        { status: "ASSIGNED", title: "Assigned" },
        { status: "IN_PROGRESS", title: "In Progress" },
        { status: "RESOLVED", title: "Resolved" },
        { status: "CLOSED", title: "Closed" }
    ];

    const renderIncidentCard = (incident) => (
        <button
            key={incident.id}
            type="button"
            className={`card technician-incident-card ${
                selectedIncident?.id === incident.id ? "selected" : ""
            }`}
            onClick={() => handleViewIncident(incident.id)}
        >
            <div className="technician-incident-top">
                <span className="id">#{incident.id}</span>

                <span className={`tag pri-${getPriorityClass(incident.priority)}`}>
                    {incident.priority}
                </span>
            </div>

            <h3>{incident.title}</h3>

            <p className="technician-incident-category">
                {incident.category?.replaceAll("_", " ")}
            </p>

            <div className="technician-incident-bottom">
                <span className={`tag st-${getStatusClass(incident.status)}`}>
                    {STATUS_LABELS[incident.status] || incident.status}
                </span>

                <span className="m">
                    {formatDate(incident.createdAt)}
                </span>
            </div>
        </button>
    );

    const renderIncidentDetails = () => {
        if (detailsLoading) {
            return (
                <section className="card technician-detail-card">
                    <p className="technician-detail-loading">
                        Loading incident details...
                    </p>
                </section>
            );
        }

        if (detailsError) {
            return (
                <div className="msg technician-detail-error" role="alert">
                    {detailsError}
                </div>
            );
        }

        if (!selectedIncident) return null;

        return (
            <section className="card technician-detail-card">

                <div className="technician-detail-header">
                    <div>
                        <span className="report-eyebrow">
                            INCIDENT DETAILS
                        </span>

                        <h2>Incident #{selectedIncident.id}</h2>
                        <p>{selectedIncident.title}</p>
                    </div>

                    <button
                        className="icon-btn"
                        onClick={() => setSelectedIncident(null)}
                        aria-label="Close incident details"
                        title="Close details"
                    >
                        <Icon name="close" />
                    </button>
                </div>

                <div className="technician-detail-tags">
                    <span className={`tag pri-${getPriorityClass(selectedIncident.priority)}`}>
                        {selectedIncident.priority}
                    </span>

                    <span className={`tag st-${getStatusClass(selectedIncident.status)}`}>
                        {STATUS_LABELS[selectedIncident.status] || selectedIncident.status}
                    </span>
                </div>

                <div className="technician-detail-grid">

                    <div className="technician-detail-field full">
                        <span>Description</span>
                        <p className="technician-description">
                            {selectedIncident.description}
                        </p>
                    </div>

                    <div className="technician-detail-field">
                        <span>Category</span>
                        <strong>
                            {selectedIncident.category?.replaceAll("_", " ")}
                        </strong>
                    </div>

                    <div className="technician-detail-field">
                        <span>Reported by</span>
                        <strong>{selectedIncident.creatorName}</strong>
                    </div>

                    <div className="technician-detail-field">
                        <span>Assigned technician</span>
                        <strong>
                            {selectedIncident.assignedTechnicianName || "Unassigned"}
                        </strong>
                    </div>

                    <div className="technician-detail-field">
                        <span>Created at</span>
                        <strong>{formatDate(selectedIncident.createdAt, true)}</strong>
                    </div>

                    <div className="technician-detail-field">
                        <span>Last updated</span>
                        <strong>{formatDate(selectedIncident.updatedAt, true)}</strong>
                    </div>

                </div>

                {/* INCIDENT ACTIONS */}
                <div className="technician-detail-section">
                    <div className="technician-section-title">
                        <div>
                            <h3>Incident Actions</h3>
                            <p>Update the incident workflow.</p>
                        </div>
                    </div>

                    {selectedIncident.status === "ASSIGNED" && (
                        <button
                            className="btn technician-action-btn"
                            onClick={() => handleUpdateStatus("IN_PROGRESS")}
                            disabled={statusUpdating}
                        >
                            {statusUpdating ? "Updating..." : "Start Working"}
                        </button>
                    )}

                    {selectedIncident.status === "IN_PROGRESS" && (
                        <button
                            className="btn technician-action-btn resolved-action"
                            onClick={() => handleUpdateStatus("RESOLVED")}
                            disabled={statusUpdating}
                        >
                            {statusUpdating ? "Updating..." : "Mark as Resolved"}
                        </button>
                    )}

                    {(selectedIncident.status === "RESOLVED" ||
                      selectedIncident.status === "CLOSED") && (
                        <div className="technician-resolved-notice">
                            <Icon name="check" />
                            This incident has been resolved.
                        </div>
                    )}

                    {statusUpdateMessage && (
                        <p className="technician-inline-message" role="status">
                            {statusUpdateMessage}
                        </p>
                    )}
                </div>

                {/* COMMENTS */}
                <div className="technician-detail-section">
                    <div className="technician-section-title">
                        <div className="technician-section-icon">
                            <Icon name="comment" />
                        </div>

                        <div>
                            <h3>Incident Comments</h3>
                            <p>Updates and communication about this incident.</p>
                        </div>
                    </div>

                    {commentsLoading && (
                        <p className="technician-muted">Loading comments...</p>
                    )}

                    {commentsError && (
                        <p className="technician-inline-error" role="alert">
                            {commentsError}
                        </p>
                    )}

                    {!commentsLoading && !commentsError && comments.length === 0 && (
                        <p className="technician-muted">
                            No comments have been added yet.
                        </p>
                    )}

                    <div className="technician-comments-list">
                        {comments.map((comment) => (
                            <div className="technician-comment" key={comment.id}>
                                <div className="technician-comment-heading">
                                    <strong>{comment.authorName}</strong>
                                    <span>{formatDate(comment.createdAt, true)}</span>
                                </div>

                                <p>{comment.content}</p>
                            </div>
                        ))}
                    </div>

                    {(selectedIncident.status === "ASSIGNED" ||
                      selectedIncident.status === "IN_PROGRESS") && (
                        <form
                            className="technician-comment-form"
                            onSubmit={handleAddComment}
                        >
                            <label htmlFor="newComment">Add a comment</label>

                            <textarea
                                id="newComment"
                                value={newComment}
                                onChange={(event) => setNewComment(event.target.value)}
                                placeholder="Write an update about this incident..."
                                maxLength={2000}
                                required
                                rows={4}
                            />

                            <div className="technician-comment-footer">
                                <span>{newComment.length}/2000 characters</span>

                                <button
                                    type="submit"
                                    className="btn technician-action-btn"
                                    disabled={commentSubmitting || !newComment.trim()}
                                >
                                    {commentSubmitting ? "Sending..." : "Add Comment"}
                                </button>
                            </div>
                        </form>
                    )}

                    {commentMessage && (
                        <p className="technician-inline-message" role="status">
                            {commentMessage}
                        </p>
                    )}
                </div>

                {/* HISTORY */}
                <div className="technician-detail-section">
                    <div className="technician-section-title">
                        <div className="technician-section-icon history">
                            <Icon name="history" />
                        </div>

                        <div>
                            <h3>Incident History</h3>
                            <p>Track the actions performed on this incident.</p>
                        </div>
                    </div>

                    {historyLoading && (
                        <p className="technician-muted">
                            Loading incident history...
                        </p>
                    )}

                    {historyError && (
                        <p className="technician-inline-error" role="alert">
                            {historyError}
                        </p>
                    )}

                    {!historyLoading && !historyError && history.length === 0 && (
                        <p className="technician-muted">
                            No history available for this incident.
                        </p>
                    )}

                    {!historyLoading && !historyError && history.length > 0 && (
                        <div className="technician-timeline">
                            {history.map((item) => (
                                <div className="technician-timeline-item" key={item.id}>
                                    <div className="technician-timeline-dot"></div>

                                    <div className="technician-timeline-content">
                                        <strong>{item.action}</strong>

                                        <p>{item.details}</p>

                                        <span>
                                            By {item.performedBy || "System"}
                                            {" · "}
                                            {formatDate(item.createdAt, true)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </section>
        );
    };

    return (
        <div className="ad technician-dashboard">

            {/* TOP NAVIGATION */}
            <header className="bar">
                <div className="brand">
                    <div className="mark">S</div>

                    <div>
                        <strong>SecureIncident</strong>
                        <span>Incident Management Platform</span>
                    </div>
                </div>

                <div className="bar-actions">
                    <button
                        className="icon-btn"
                        onClick={fetchAssignedIncidents}
                        title="Refresh incidents"
                        aria-label="Refresh incidents"
                        disabled={loading}
                    >
                        <Icon name="refresh" />
                    </button>

                    <Link to="/profile" className="me">
                        My Profile
                    </Link>

                    <button
                        className="icon-btn"
                        onClick={handleLogout}
                        title="Sign out"
                        aria-label="Sign out"
                    >
                        <Icon name="logout" />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="stage technician-stage">

                {tab === "overview" && (
                    <>
                        <section className="technician-welcome card">
                            <div>
                                <span className="technician-welcome-eyebrow">
                                    TECHNICIAN WORKSPACE
                                </span>

                                <h1>
                                    Welcome back,{" "}
                                    {user?.fullName?.split(" ")[0] || "Technician"}.
                                </h1>

                                <p>
                                    Monitor your assigned incidents, manage your
                                    workload, and keep track of your progress.
                                </p>

                                <button
                                    className="btn technician-welcome-btn"
                                    onClick={() => setTab("board")}
                                >
                                    View My Incidents
                                    <span>→</span>
                                </button>
                            </div>

                            <div className="technician-welcome-symbol">
                                <Icon name="incidents" size={36} />
                            </div>
                        </section>

                        <div className="section-head technician-section-heading">
                            <div>
                                <h2>My Statistics</h2>
                                <p>A summary of your assigned workload.</p>
                            </div>
                        </div>

                        <section className="tiles technician-tiles">
                            {statistics.map((stat) => (
                                <div
                                    className={`card tile ${stat.className}`}
                                    key={stat.label}
                                >
                                    <div className="technician-stat-top">
                                        <span>{stat.label}</span>

                                        <div className="technician-stat-icon">
                                            <Icon name={stat.icon} />
                                        </div>
                                    </div>

                                    <strong>{stat.value}</strong>
                                    <small>{stat.detail}</small>
                                </div>
                            ))}
                        </section>

                        <div className="section-head technician-section-heading">
                            <div>
                                <h2>Recent Assigned Incidents</h2>
                                <p>Your latest assigned work.</p>
                            </div>

                            <button
                                className="technician-text-button"
                                onClick={() => setTab("board")}
                            >
                                View all →
                            </button>
                        </div>

                        {error && (
                            <div className="msg technician-error" role="alert">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="empty">
                                Loading your assigned incidents...
                            </div>
                        ) : !error && incidents.length === 0 ? (
                            <div className="empty technician-empty">
                                <div className="technician-empty-icon">
                                    <Icon name="incidents" size={25} />
                                </div>

                                <strong>No assigned incidents yet</strong>
                                <p>
                                    Incidents assigned to you will appear here.
                                </p>
                            </div>
                        ) : !error ? (
                            <section className="cards technician-cards">
                                {incidents.slice(0, 4).map(renderIncidentCard)}
                            </section>
                        ) : null}
                    </>
                )}

                {tab === "board" && (
                    <>
                        <div className="section-head technician-board-heading">
                            <div>
                                <span className="technician-welcome-eyebrow">
                                    WORKSPACE
                                </span>

                                <h1>My Assigned Incidents</h1>

                                <p>
                                    Select an incident to view its details,
                                    update its status, and add comments.
                                </p>
                            </div>

                            <button
                                className="icon-btn"
                                onClick={fetchAssignedIncidents}
                                title="Refresh incidents"
                                aria-label="Refresh incidents"
                                disabled={loading}
                            >
                                <Icon name="refresh" />
                            </button>
                        </div>

                        {error && (
                            <div className="msg technician-error" role="alert">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="empty">
                                Loading your assigned incidents...
                            </div>
                        ) : !error && incidents.length === 0 ? (
                            <div className="empty technician-empty">
                                <div className="technician-empty-icon">
                                    <Icon name="incidents" size={25} />
                                </div>

                                <strong>No assigned incidents yet</strong>
                                <p>
                                    You currently have no incidents assigned to you.
                                </p>
                            </div>
                        ) : !error ? (
                            <section className="board technician-board">
                                {statusGroups.map((group) => {
                                    const groupIncidents = incidents.filter(
                                        (incident) => incident.status === group.status
                                    );

                                    return (
                                        <div className="col" key={group.status}>
                                            <div className="technician-column-heading">
                                                <strong>{group.title}</strong>
                                                <span>{groupIncidents.length}</span>
                                            </div>

                                            {groupIncidents.length === 0 ? (
                                                <p className="technician-column-empty">
                                                    No incidents
                                                </p>
                                            ) : (
                                                groupIncidents.map(renderIncidentCard)
                                            )}
                                        </div>
                                    );
                                })}
                            </section>
                        ) : null}

                        {renderIncidentDetails()}
                    </>
                )}

            </main>

            {/* BOTTOM NAVIGATION */}
            <nav className="dock">
                <button
                    className={`dock-item ${tab === "overview" ? "active" : ""}`}
                    onClick={() => setTab("overview")}
                >
                    <Icon name="overview" />
                    <span>Overview</span>
                </button>

                <button
                    className={`dock-item ${tab === "board" ? "active" : ""}`}
                    onClick={() => setTab("board")}
                >
                    <Icon name="incidents" />
                    <span>My Incidents</span>
                    <span className="technician-dock-count">
                        {incidents.length}
                    </span>
                </button>
            </nav>

        </div>
    );
}
