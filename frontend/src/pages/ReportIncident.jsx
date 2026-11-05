
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";
import "./ReportIncident.css";

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
        report: (
            <>
                <path d="M12 5v14M5 12h14" />
                <circle cx="12" cy="12" r="9" />
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

export default function ReportIncident() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "OTHER",
        priority: "MEDIUM"
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await api.post("/incidents", formData);

            setSuccess("Your incident has been reported successfully!");

            setTimeout(() => {
                navigate("/employee");
            }, 1500);

        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to submit your incident. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="ad report-dashboard">

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
                    <span className="report-user-label">
                        {user?.fullName || "Employee"}
                    </span>

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
            <main className="stage report-stage">

                <div className="report-page-heading">
                    <div>
                        <span className="report-eyebrow">
                            INCIDENT MANAGEMENT
                        </span>

                        <h1>Report an Incident</h1>

                        <p>
                            Provide the details below so our technical team
                            can investigate and resolve your incident.
                        </p>
                    </div>

                    <div className="report-heading-icon">
                        <Icon name="report" size={30} />
                    </div>
                </div>

                <section className="card report-form-card">

                    <div className="report-form-intro">
                        <div>
                            <h2>Incident details</h2>
                            <p>
                                Please provide accurate information about
                                the issue you are experiencing.
                            </p>
                        </div>

                        <span className="report-required">
                            * Required fields
                        </span>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="report-form-group">
                            <label htmlFor="title">
                                Incident title <span>*</span>
                            </label>

                            <input
                                id="title"
                                type="text"
                                name="title"
                                placeholder="e.g. Unable to access company network"
                                value={formData.title}
                                onChange={handleChange}
                                maxLength={150}
                                required
                            />

                            <small>
                                Give your incident a short and descriptive title.
                            </small>
                        </div>

                        <div className="report-form-group">
                            <label htmlFor="description">
                                Description <span>*</span>
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                placeholder="Describe what happened, when it started, and any error messages..."
                                value={formData.description}
                                onChange={handleChange}
                                rows={6}
                                required
                            />

                            <small>
                                Include relevant details to help the technical team
                                understand the problem.
                            </small>
                        </div>

                        <div className="report-form-row">

                            <div className="report-form-group">
                                <label htmlFor="category">
                                    Category
                                </label>

                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="NETWORK">Network</option>
                                    <option value="MALWARE">Malware</option>
                                    <option value="PHISHING">Phishing</option>
                                    <option value="ACCESS">Access</option>
                                    <option value="SOFTWARE">Software</option>
                                    <option value="HARDWARE">Hardware</option>
                                    <option value="DATA_LEAK">Data Leak</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="report-form-group">
                                <label htmlFor="priority">
                                    Priority
                                </label>

                                <select
                                    id="priority"
                                    name="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>

                        </div>

                        {error && (
                            <div className="report-message report-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="report-message report-success">
                                {success}
                            </div>
                        )}

                        <div className="report-form-actions">
                            <button
                                type="button"
                                className="report-cancel-btn"
                                onClick={() => navigate("/employee")}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn report-submit-btn"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit Incident"}
                                {!loading && <Icon name="report" size={17} />}
                            </button>
                        </div>

                    </form>
                </section>

                <div className="report-info">
                    <span className="report-info-icon">i</span>
                    <p>
                        Once submitted, your incident will be registered
                        and made available to the administration team
                        for assignment to a technician.
                    </p>
                </div>

            </main>

            {/* BOTTOM NAVIGATION */}
            <nav className="dock">
                <button
                    className="dock-item"
                    onClick={() => navigate("/employee")}
                >
                    <Icon name="overview" />
                    <span>Overview</span>
                </button>

                <button className="dock-item active">
                    <Icon name="report" />
                    <span>New incident</span>
                </button>
            </nav>

        </div>
    );
}
