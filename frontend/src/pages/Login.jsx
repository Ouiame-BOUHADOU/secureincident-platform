
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const sessionExpired = searchParams.get("sessionExpired") === "true";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const user = await login(email.trim(), password);

            if (user.role === "ADMIN") {
                navigate("/admin");
            } else if (user.role === "TECHNICIAN") {
                navigate("/technician");
            } else {
                navigate("/employee");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to sign in. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">

            {/* Left presentation section */}
            <section className="login-intro">

                <Link to="/" className="brand">
                    <div className="brand-icon">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 2L20 5V11C20 16.5 16.5 20 12 22C7.5 20 4 16.5 4 11V5L12 2Z"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                strokeLinejoin="round"
                            />
                            <rect
                                x="9"
                                y="10"
                                width="6"
                                height="5"
                                rx="1"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                            <path
                                d="M10 10V8.5A2 2 0 0114 8.5V10"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            />
                        </svg>
                    </div>

                    <div className="brand-text">
                        <span>Secure</span><strong>Incident</strong>
                        <small>DETECT · REPORT · RESOLVE</small>
                    </div>
                </Link>

                <div className="intro-content">
                    <span className="intro-tag">
                        <span className="status-dot"></span>
                        YOUR SECURITY WORKSPACE
                    </span>

                    <h1>
                        Your Security.
                        <br />
                        Our <span>Priority.</span>
                    </h1>

                    <p className="intro-description">
                        A smarter way to report, manage, and track
                        security incidents. Stay informed and keep
                        your organization protected.
                    </p>

                    <div className="feature-list">

                        <div className="feature-item">
                            <div className="feature-icon">01</div>
                            <div>
                                <h3>Fast Reporting</h3>
                                <p>Report incidents through a simple workflow.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">02</div>
                            <div>
                                <h3>Continuous Tracking</h3>
                                <p>Follow every update from submission to resolution.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">03</div>
                            <div>
                                <h3>Controlled Access</h3>
                                <p>Role-based access for a safer environment.</p>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="intro-footer">
                    <span>SECUREINCIDENT PLATFORM</span>
                    <span>CYBERSECURITY · TRUST · CONTROL</span>
                </div>
            </section>

            {/* Right login section */}
            <section className="login-form-section">

                <div className="login-card">

                    <div className="login-card-heading">
                        <span className="form-eyebrow">WELCOME BACK</span>
                        <h2>Sign in to your account</h2>
                        <p>Enter your credentials to access your workspace.</p>
                    </div>

                    {sessionExpired && (
                        <div className="login-error" role="alert">
                            <span>!</span>
                            Your session has expired. Please log in again.
                        </div>
                    )}

                    {error && (
                        <div className="login-error" role="alert">
                            <span>!</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        <div className="form-group">
                            <label htmlFor="email">Email address</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password</label>

                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={
                                        showPassword ? "Hide password" : "Show password"
                                    }
                                >
                                    {showPassword ? "HIDE" : "SHOW"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign in"}
                            {!loading && <span>→</span>}
                        </button>

                    </form>

                    <div className="login-divider">
                        <span>NEW TO SECUREINCIDENT?</span>
                    </div>

                    <p className="register-prompt">
                        Don't have an account?
                        <Link to="/register">Create an account <span>↗</span></Link>
                    </p>

                </div>

                <div className="login-security-note">
                    <span className="security-indicator"></span>
                    Your connection is protected by SecureIncident
                </div>

            </section>

        </main>
    );
}
