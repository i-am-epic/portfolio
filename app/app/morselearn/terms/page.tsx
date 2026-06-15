import type { Metadata } from "next"
import type { CSSProperties } from "react"

export const metadata: Metadata = {
    title: "MorseLearn - Terms of Service",
    description: "Terms of Service for the MorseLearn mobile application.",
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
    footer: {
        marginTop: "40px",
        color: "#8a93a3",
        fontSize: "14px",
    },
}

export default function MorseLearnTermsPage() {
    return (
        <main style={pageStyles.body}>
            <div style={pageStyles.wrap}>
                <h1 style={pageStyles.h1}>MorseLearn - Terms of Service</h1>
                <div style={pageStyles.updated}>Last updated: 16 June 2026</div>

                <p>
                    By downloading or using <strong>MorseLearn</strong> you agree to these terms.
                </p>

                <h2 style={pageStyles.h2}>1. Licence</h2>
                <p>The App is provided for personal, non-commercial, educational use.</p>

                <h2 style={pageStyles.h2}>2. Purchases</h2>
                <p>
                    "Remove ads" is a one-time purchase that disables advertising. All payments are processed
                    by Google Play or the Apple App Store and are subject to their terms and refund policies.
                    We do not store your payment details.
                </p>

                <h2 style={pageStyles.h2}>3. "As is"</h2>
                <p>
                    The App is provided "as is" without warranties of any kind. To the extent permitted by
                    Indian law, we are not liable for any indirect or consequential damages arising from use
                    of the App.
                </p>

                <h2 style={pageStyles.h2}>4. Changes</h2>
                <p>We may update the App and these terms from time to time.</p>

                <h2 style={pageStyles.h2}>5. Governing law</h2>
                <p>
                    These terms are governed by the laws of India, with jurisdiction in the courts of the
                    developer&apos;s state of residence.
                </p>

                <p style={{ marginTop: "28px" }}>
                    Contact: <a style={pageStyles.link} href="mailto:nikkivizzz@gmail.com">nikkivizzz@gmail.com</a>
                </p>

                <footer style={pageStyles.footer}>Copyright 2026 MorseLearn. Made in India.</footer>
            </div>
        </main>
    )
}