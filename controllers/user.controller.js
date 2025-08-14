const { default: axios } = require("axios");
const User = require("../models/user.model");

const redirectGoogle = (req, res) => {
  console.log("🔹 Redirecting to Google OAuth...");
  const redirectUri =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: `${process.env.BACKEND_URI}/api/v1/auth/google/callback`,
      response_type: "code",
      scope: "email profile",
      access_type: "offline",
      prompt: "consent",
    });
  console.log("🔹 Google Redirect URI:", redirectUri);
  res.redirect(redirectUri);
};

const googleCallback = async (req, res) => {
  console.log("🔹 Google OAuth Callback hit.");
  const code = req.query.code;

  console.log("🔹 Received OAuth code:", code);

  if (!code) {
    console.error("❌ Missing code in callback request.");
    return res.status(400).send("Missing code");
  }

  try {
    console.log("🔹 Requesting token from Google...");
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BACKEND_URI}/api/v1/auth/google/callback`,
        grant_type: "authorization_code",
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    console.log("✅ Token Response:", tokenRes.data);

    const { access_token } = tokenRes.data;
    console.log("🔹 Access Token:", access_token);

    console.log("🔹 Fetching user info from Google...");
    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    console.log("✅ Google User Info Response:", userRes.data);

    const { email, name, picture, id: googleId } = userRes.data;
    console.log("🔹 Extracted User Info:", { email, name, picture, googleId });

    console.log("🔹 Checking if user exists in DB...");
    let user = await User.findOne({ email });

    if (!user) {
      console.log("🔹 User not found. Creating new user...");
      user = await User.create({
        email,
        username: name,
        picture,
        googleId,
        emailVerified: true,
      });
      console.log("✅ New user created:", user);
    } else {
      console.log("✅ Existing user found:", user);
    }

    console.log("🔹 Storing user in session...");
    req.session.user = {
      username: user.username,
      email: user.email,
    };
    console.log("✅ Session after setting user:", req.session);

    req.session.save(() => {
      console.log("✅ Session saved. Redirecting to frontend dashboard...");
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    });
  } catch (err) {
    console.error("❌ OAuth Error:", err.response?.data || err.message);
    res.status(500).send("Authentication failed");
  }
};

const verifyUser = (req, res) => {
  console.log("🔹 Verifying session...");
  console.log("🔹 Session object:", req.session);
  console.log("🔹 Session user:", req.session.user);

  try {
    if (req.session.user) {
      console.log("✅ User is authenticated.");
      return res.status(200).json({ user: req.session.user });
    }
    console.warn("⚠️ User is NOT authenticated.");
    return res.status(401).json({ message: "Not authenticated" });
  } catch (error) {
    console.error("❌ Verification Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = (req, res) => {
  console.log("🔹 Logging out user...");
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Logout failed:", err);
      return res.status(500).send("Failed to logout");
    }
    console.log("✅ Session destroyed. Clearing cookie...");
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};

module.exports = {
  redirectGoogle,
  googleCallback,
  verifyUser,
  logout,
};
