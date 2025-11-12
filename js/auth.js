// Firebase Auth Setup for tsul.us
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  applyActionCode,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDqnsMa7z0Qc4VvoGgjjo1h34M7CGiCP6k",
  authDomain: "tsul-a6c56.firebaseapp.com",
  projectId: "tsul-a6c56",
  storageBucket: "tsul-a6c56.firebasestorage.app",
  messagingSenderId: "152976121059",
  appId: "1:152976121059:web:d049440c607d83b32b39d6",
  measurementId: "G-QB3KBY8N4C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Handle Email Verification from Link
export const verifyEmailFromLink = async () => {
  const params = new URLSearchParams(window.location.search);
  const oobCode = params.get("oobCode");
  const mode = params.get("mode");

  if (mode === "verifyEmail" && oobCode) {
    try {
      await applyActionCode(auth, oobCode);
      showMessage("✅ Email verified successfully!", "success");
    } catch (error) {
      showMessage(`❌ Verification failed: ${error.message}`, "error");
    }
  }
};

// Sign Up
export const handleSignUp = async () => {
  const email = document.getElementById("signup-email")?.value;
  const password = document.getElementById("signup-password")?.value;

  if (!email || !password) return showMessage("Enter both email and password.", "error");
  if (password.length < 6) return showMessage("Password must be at least 6 characters.", "error");

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(user, {
      url: "https://tsul.us/verify"
    });
    showMessage(`Verification email sent to ${email}.`, "success");
    clearAuthForm();
  } catch (error) {
    showMessage(`Sign-up error: ${error.message}`, "error");
  }
};

// Sign In
export const handleSignIn = async () => {
  const email = document.getElementById("signin-email")?.value;
  const password = document.getElementById("signin-password")?.value;

  if (!email || !password) return showMessage("Enter both email and password.", "error");

  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    if (user.emailVerified) {
      showMessage("Logged in successfully!", "success");
      updateUserUI(user);
      clearAuthForm();
    } else {
      showMessage("Please verify your email before logging in.", "warning");
    }
  } catch (error) {
    showMessage(`Login error: ${error.message}`, "error");
  }
};

// Sign Out
export const handleSignOut = async () => {
  try {
    await signOut(auth);
    showMessage("Signed out successfully.", "success");
    updateUserUI(null);
  } catch (error) {
    showMessage(`Sign-out error: ${error.message}`, "error");
  }
};

// UI State
let currentUser = null;
const profileMenu = document.getElementById("profile-menu");

const updateUserUI = (user) => {
  currentUser = user;
  updateProfileMenu(user?.emailVerified);
};

const updateProfileMenu = (isLoggedIn) => {
  if (!profileMenu) return;

  profileMenu.innerHTML = isLoggedIn ? `
    <div style="text-align: center; margin-bottom: 10px;">
      <p style="margin: 0; font-size: 0.9em; color: #ccc;">Logged in as:</p>
      <p style="margin: 0; font-size: 0.8em; color: var(--accent-color);">${currentUser?.email}</p>
    </div>
    <button onclick="handleSignOut()" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Sign Out</button>
  ` : `
    <div style="margin-bottom: 10px;">
      <p style="margin: 0 0 8px 0; font-size: 0.9em; color: #ccc; text-align: center;">Sign In</p>
      <input type="email" id="signin-email" placeholder="Email" />
      <input type="password" id="signin-password" placeholder="Password" />
      <button onclick="handleSignIn()" style="width: 100%; padding: 8px; margin-bottom: 10px; background: #3082FF; color: white; border: none; border-radius: 4px; cursor: pointer;">Sign In</button>
    </div>
    <div style="margin-bottom: 10px;">
      <p style="margin: 0 0 8px 0; font-size: 0.9em; color: #ccc; text-align: center;">Sign Up</p>
      <input type="email" id="signup-email" placeholder="Email" />
      <input type="password" id="signup-password" placeholder="Password" />
      <button onclick="handleSignUp()" style="width: 100%; padding: 8px; margin-bottom: 10px; background: var(--accent-color); color: white; border: none; border-radius: 4px; cursor: pointer;">Sign Up</button>
    </div>
  `;
};

// Utility
const clearAuthForm = () => {
  const inputs = profileMenu.querySelectorAll('input');
  inputs.forEach(input => input.value = '');
};

const showMessage = (message, type = "info") => {
  const messageEl = document.createElement('div');
  messageEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-family: var(--font-stack);
    font-size: 0.9em;
    z-index: 10000;
    max-width: 300px;
    word-wrap: break-word;
  `;

  messageEl.style.background = {
    success: "#4CAF50",
    error: "#f44336",
    warning: "#ff9800",
    info: "#2196F3"
  }[type] || "#2196F3";

  messageEl.textContent = message;
  document.body.appendChild(messageEl);
  setTimeout(() => messageEl.remove(), 5000);
};

// Init
export const initializeAuth = () => {
  onAuthStateChanged(auth, updateUserUI);

  const profileIcon = document.querySelector(".profile-icon");
  if (profileIcon && profileMenu) {
    profileIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      profileMenu.style.display = profileMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".profile-dropdown")) {
        profileMenu.style.display = "none";
      }
    });
  }

  updateProfileMenu(false);
};

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initializeAuth();
  verifyEmailFromLink(); // Run on /verify page
});

// Expose globally
window.handleSignUp = handleSignUp;
window.handleSignIn = handleSignIn;
window.handleSignOut = handleSignOut;