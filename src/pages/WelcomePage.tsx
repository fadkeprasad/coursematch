import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithCustomToken } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const WelcomePage: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null); // State to store the username
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const navigate = useNavigate();
  const db = getFirestore(); // Firestore instance

  useEffect(() => {
    // Check if there's a ?token= in the URL
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (token) {
      // Sign in with the custom token
      signInWithCustomToken(auth, token)
        .then(async (userCredential) => {
          const user = userCredential.user;
          if (user) {
            // Fetch the user's funky username from Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              setUsername(userDoc.data()?.username || "Anonymous");
            } else {
              console.warn("User document not found in Firestore.");
            }
          }
          navigate("/home");
        })
        .catch((error) => {
          console.error("Error signing in with custom token", error);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [navigate, db]);

  const handleCasLogin = () => {
    // Redirect to your Cloud Function that starts CAS login
    window.location.href =
      "https://us-central1-coursematch-1cd8d.cloudfunctions.net/casLogin";
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img
          src="/images/som_logo.png"
          alt="Yale Logo"
          style={{ width: "150px" }}
        />
        <h1>Welcome to CourseMatch!</h1>
        <p>This app helps you review and select courses.</p>
        {username && (
          <h2 style={{ marginTop: "10px" }}>Hello, {username}!</h2>
        )}
      </div>
      <button
        onClick={handleCasLogin}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          fontWeight: "bold",
          backgroundColor: "#0071b6",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Sign In with Yale CAS
      </button>
      <div style={{ marginTop: "20px" }}>
        <img
          src="/images/coursematch_logo.png"
          alt="CourseMatch Logo"
          style={{ width: "100px" }}
        />
      </div>
    </div>
  );
};

export default WelcomePage;
