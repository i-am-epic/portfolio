import type { Metadata } from "next"
import type { CSSProperties } from "react"

export const metadata: Metadata = {
    title: "MorseLearn - Privacy Policy",
    description: "Privacy Policy for the MorseLearn mobile application.",
    robots: {
        index: true,
        follow: true,
    },
}

const pageStyles: Record<string, CSSProperties> = {
    body: {
        margin: 0,
        background: "#16181d",
        color: "#d6dae2",
        font: "16px/1.65 -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        minHeight: "100vh",
    },
    wrap: {
        maxWidth: "760px",
        margin: "0 auto",
        padding: "48px 22px 80px",
    },
    h1: {
        color: "#fff",
        fontSize: "32px",
        margin: "0 0 4px",
    },
    h2: {
        color: "#ffc02e",
        fontSize: "19px",
        margin: "34px 0 8px",
    },
    updated: {
        color: "#8a93a3",
        fontSize: "14px",
        marginBottom: "28px",
    },
    link: {
        color: "#35e8cc",
    },
    list: {
        paddingLeft: "20px",
    },
    card: {
        background: "#1d2026",
        border: "1px solid #2a2e36",
        borderRadius: "14px",
        padding: "18px 22px",
        marginTop: "18px",
    },
    footer: {
        marginTop: "40px",
        color: "#8a93a3",
        fontSize: "14px",
    },
}

export default function MorseLearnPrivacyPage() {
    return (
        <main style={pageStyles.body}>
            <div style={pageStyles.wrap}>
                <h1 style={pageStyles.h1}>MorseLearn - Privacy Policy</h1>
                <div style={pageStyles.updated}>Last updated: 16 June 2026</div>

                <p>
                    This Privacy Policy explains how the <strong>MorseLearn</strong> mobile application ("the
                    App", "we", "us") handles information. The App is published by an individual developer
                    based in India and complies with the Information Technology Act, 2000 and the Digital
                    Personal Data Protection Act, 2023 (the "DPDP Act").
                </p>

                <h2 style={pageStyles.h2}>1. Information we collect</h2>
                <p>
                    We do not ask for your name, email, phone number or any account. Your learning progress,
                    settings, Elo rating, streak and statistics are stored <strong>only on your own device</strong>.
                    We do not operate servers and do not collect or upload your personal data to us.
                </p>

                <h2 style={pageStyles.h2}>2. Advertising (Google AdMob)</h2>
                <p>
                    The App displays advertisements through Google AdMob. To serve and measure ads, Google
                    may collect and process a device advertising identifier and limited usage/diagnostic data,
                    as described in <a style={pageStyles.link} href="https://policies.google.com/privacy">Google&apos;s Privacy Policy</a> and{" "}
                    <a style={pageStyles.link} href="https://support.google.com/admob/answer/6128543">How Google uses data</a>.
                    You can permanently disable all ads with the one-time "Remove ads" purchase inside the App.
                </p>

                <h2 style={pageStyles.h2}>3. Permissions</h2>
                <ul style={pageStyles.list}>
                    <li>
                        <strong>Internet</strong> - required to load ads.
                    </li>
                    <li>
                        <strong>Vibration</strong> - used for haptic feedback only.
                    </li>
                </ul>

                <h2 style={pageStyles.h2}>4. Children</h2>
                <p>
                    The App is suitable for all ages and does not knowingly collect personal data from children.
                </p>

                <h2 style={pageStyles.h2}>5. Your rights under the DPDP Act, 2023</h2>
                <p>
                    Because all data stays on your device, you can erase it at any time via <em>Settings -&gt;
                        Reset progress</em>, or by uninstalling the App. For any privacy question, data request or
                    grievance, contact the Grievance Officer below. We acknowledge and respond within 30 days as
                    required by law.
                </p>

                <h2 style={pageStyles.h2}>6. Changes to this policy</h2>
                <p>
                    We may update this policy from time to time; the "Last updated" date above will change
                    accordingly.
                </p>

                <div style={pageStyles.card}>
                    <strong>Grievance Officer / Contact</strong>
                    <br />
                    Nikhil
                    <br />
                    Email: <a style={pageStyles.link} href="mailto:nikkivizzz@gmail.com">nikkivizzz@gmail.com</a>
                </div>

                <footer style={pageStyles.footer}>Copyright 2026 MorseLearn. Made in India.</footer>
            </div>
        </main>
    )
}