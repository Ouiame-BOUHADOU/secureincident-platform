
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await register(fullName, email, password);
            navigate("/");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-decoration">
                <div className="register-brand">
                    <span className="register-mark">S</span>
                    <span>SecureIncident</span>
                </div>

                <div className="register-intro">
                    <span className="register-eyebrow">
                        INCIDENT MANAGEMENT PLATFORM
                    </span>

                    <h1>
                        Stay informed.
                        <br />
                        Stay <span>secure.</span>
                    </h1>

                    <p>
                        Report, track, and manage IT incidents
                        through one secure workspace.
                    </p>
                </div>

                <div className="register-footer">
                    SecureIncident · Protecting your digital workspace
                </div>
            </div>

            <div className="register-form-side">
                <form className="register-card" onSubmit={handleSubmit}>
                    <div className="register-mobile-brand">
                        <span className="register-mark">S</span>
                        <span>SecureIncident</span>
                    </div>

                    <div className="register-heading">
                        <span className="register-eyebrow">
                            GET STARTED
                        </span>

                        <h2>Create your account</h2>

                        <p>
                            Join your organization's incident management
                            workspace.
                        </p>
                    </div>

                    {error && (
                        <div className="register-error">
                            {error}
                        </div>
                    )}

                    <div className="register-field">
                        <label htmlFor="fullName">Full name</label>
                        <input
                            id="fullName"
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            maxLength={100}
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="email">Email address</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            maxLength={150}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="password">Password</label>

                        <div className="register-password">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="At least 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                maxLength={100}
                                autoComplete="new-password"
                                required
                            />

                            <button
                                type="button"
                                className="register-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        <span className="register-hint">
                            Use at least 8 characters.
                        </span>
                    </div>

                    <button
                        type="submit"
                        className="register-submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create account"}
                        {!loading && <span>→</span>}
                    </button>

                    <p className="register-login">
                        Already have an account?
                        <Link to="/"> Sign in</Link>
                    </p>

                    <div className="register-security">
                        <span>◆</span>
                        Your account is protected with secure authentication.
                    </div>
                </form>
            </div>
        </div>
    );
}
