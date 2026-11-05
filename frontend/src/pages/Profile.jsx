
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";
import "./Profile.css";

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
        user: (
            <>
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            </>
        ),
        lock: (
            <>
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v3" />
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

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [profile, setProfile] = useState(null);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");

    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const dashboardPath =
        user?.role === "ADMIN"
            ? "/admin"
            : user?.role === "TECHNICIAN"
                ? "/technician"
                : "/employee";

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get("/profile");

            setProfile(response.data);
            setFullName(response.data.fullName);
            setEmail(response.data.email);
        } catch (error) {
            setProfileError(
                error.response?.data?.message ||
                "Unable to load your profile."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (event) => {
        event.preventDefault();

        setProfileMessage("");
        setProfileError("");
        setSavingProfile(true);

        try {
            const response = await api.put("/profile", {
                fullName: fullName.trim(),
                email: email.trim()
            });

            setProfile(response.data);
            setFullName(response.data.fullName);
            setEmail(response.data.email);

            setProfileMessage(
                "Your profile has been updated successfully."
            );
        } catch (error) {
            setProfileError(
                error.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = async (event) => {
        event.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        if (newPassword !== confirmNewPassword) {
            setPasswordError("The new passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError(
                "The new password must contain at least 8 characters."
            );
            return;
        }

        setChangingPassword(true);

        try {
            await api.put("/profile/password", {
                oldPassword,
                newPassword,
                confirmNewPassword
            });

            setPasswordMessage(
                "Your password has been changed successfully."
            );

            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (error) {
            setPasswordError(
                error.response?.data?.message ||
                "Unable to change your password. Check your current password."
            );
        } finally {
            setChangingPassword(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="ad profile-dashboard">

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
                        className="profile-back-btn"
                        onClick={() => navigate(dashboardPath)}
                    >
                        Back to Dashboard
                    </button>

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
            <main className="stage profile-stage">

                <div className="profile-page-heading">
                    <div>
                        <span className="profile-eyebrow">
                            ACCOUNT SETTINGS
                        </span>

                        <h1>My Profile</h1>

                        <p>
                            Manage your personal information and account security.
                        </p>
                    </div>

                    <div className="profile-heading-icon">
                        <Icon name="user" size={30} />
                    </div>
                </div>

                {loading ? (
                    <div className="card profile-loading">
                        <div className="profile-spinner"></div>
                        <p>Loading your profile...</p>
                    </div>
                ) : !profile ? (
                    <div className="card profile-load-error">
                        {profileError || "Profile information is unavailable."}
                    </div>
                ) : (
                    <div className="profile-layout">

                        {/* ACCOUNT SUMMARY */}
                        <section className="card profile-account-card">

                            <div className="profile-avatar">
                                {profile.fullName?.charAt(0).toUpperCase()}
                            </div>

                            <h2>{profile.fullName}</h2>
                            <p className="profile-account-email">
                                {profile.email}
                            </p>

                            <span className={`profile-role ${profile.role?.toLowerCase()}`}>
                                {profile.role}
                            </span>

                            <div className="profile-account-divider"></div>

                            <div className="profile-account-info">

                                <div>
                                    <span>Account Status</span>

                                    <strong className={
                                        profile.enabled
                                            ? "status-enabled"
                                            : "status-disabled"
                                    }>
                                        <span className="profile-status-dot"></span>
                                        {profile.enabled ? "Active" : "Disabled"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Member Since</span>
                                    <strong>
                                        {profile.createdAt
                                            ? new Date(profile.createdAt).toLocaleDateString()
                                            : "Not available"}
                                    </strong>
                                </div>

                            </div>

                        </section>

                        {/* PROFILE FORMS */}
                        <div className="profile-forms">

                            {/* PERSONAL INFORMATION */}
                            <section className="card profile-section-card">

                                <div className="profile-section-header">
                                    <div className="profile-section-icon">
                                        <Icon name="user" />
                                    </div>

                                    <div>
                                        <h2>Personal Information</h2>
                                        <p>
                                            Update your name and email address.
                                        </p>
                                    </div>
                                </div>

                                {profileMessage && (
                                    <div className="profile-feedback profile-feedback-success">
                                        {profileMessage}
                                    </div>
                                )}

                                {profileError && (
                                    <div className="profile-feedback profile-feedback-error">
                                        {profileError}
                                    </div>
                                )}

                                <form onSubmit={handleProfileUpdate}>

                                    <div className="profile-form-group">
                                        <label htmlFor="fullName">
                                            Full Name
                                        </label>

                                        <input
                                            id="fullName"
                                            type="text"
                                            value={fullName}
                                            onChange={(event) =>
                                                setFullName(event.target.value)
                                            }
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label htmlFor="email">
                                            Email Address
                                        </label>

                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(event.target.value)
                                            }
                                            maxLength={150}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn profile-save-btn"
                                        disabled={savingProfile}
                                    >
                                        {savingProfile
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </button>

                                </form>

                            </section>

                            {/* CHANGE PASSWORD */}
                            <section className="card profile-section-card">

                                <div className="profile-section-header">
                                    <div className="profile-section-icon security">
                                        <Icon name="lock" />
                                    </div>

                                    <div>
                                        <h2>Change Password</h2>
                                        <p>
                                            Keep your account secure with a strong password.
                                        </p>
                                    </div>
                                </div>

                                {passwordMessage && (
                                    <div className="profile-feedback profile-feedback-success">
                                        {passwordMessage}
                                    </div>
                                )}

                                {passwordError && (
                                    <div className="profile-feedback profile-feedback-error">
                                        {passwordError}
                                    </div>
                                )}

                                <form onSubmit={handlePasswordChange}>

                                    <div className="profile-form-group">
                                        <label htmlFor="oldPassword">
                                            Current Password
                                        </label>

                                        <input
                                            id="oldPassword"
                                            type="password"
                                            value={oldPassword}
                                            onChange={(event) =>
                                                setOldPassword(event.target.value)
                                            }
                                            autoComplete="current-password"
                                            required
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label htmlFor="newPassword">
                                            New Password
                                        </label>

                                        <input
                                            id="newPassword"
                                            type="password"
                                            value={newPassword}
                                            onChange={(event) =>
                                                setNewPassword(event.target.value)
                                            }
                                            minLength={8}
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>

                                    <div className="profile-form-group">
                                        <label htmlFor="confirmNewPassword">
                                            Confirm New Password
                                        </label>

                                        <input
                                            id="confirmNewPassword"
                                            type="password"
                                            value={confirmNewPassword}
                                            onChange={(event) =>
                                                setConfirmNewPassword(event.target.value)
                                            }
                                            minLength={8}
                                            autoComplete="new-password"
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn profile-save-btn"
                                        disabled={changingPassword}
                                    >
                                        {changingPassword
                                            ? "Updating..."
                                            : "Change Password"}
                                    </button>

                                </form>

                            </section>

                        </div>
                    </div>
                )}

            </main>

            {/* BOTTOM NAVIGATION */}
            <nav className="dock">

                <button
                    className="dock-item"
                    onClick={() => navigate(dashboardPath)}
                >
                    <Icon name="overview" />
                    <span>Dashboard</span>
                </button>

                <button className="dock-item active">
                    <Icon name="user" />
                    <span>My Profile</span>
                </button>

            </nav>

        </div>
    );
}
