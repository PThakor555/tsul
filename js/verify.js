// pages/verify.js
import { useEffect, useState } from "react";
import { verifyEmailFromLink } from "../path/to/auth"; // adjust path if needed

export default function VerifyPage() {
  const [status, setStatus] = useState("Verifying your email…");

  useEffect(() => {
    verifyEmailFromLink()
      .then(() => {
        setStatus("✅ Verified! Your email has been confirmed.");
        setTimeout(() => {
          window.location.href = "/";
        }, 4000);
      })
      .catch((error) => {
        setStatus(`❌ Verification failed: ${error.message}`);
      });
  }, []);

  return (
    <main style={{
      fontFamily: "'Helvetica Neue', sans-serif",
      backgroundColor: "#111",
      color: "#eee",
      textAlign: "center",
      padding: "60px 20px"
    }}>
      <h1>Email Verification</h1>
      <p style={{ fontSize: "1.2em", marginTop: "20px" }}>{status}</p>
    </main>
  );
}