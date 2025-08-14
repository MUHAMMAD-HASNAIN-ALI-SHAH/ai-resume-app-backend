const { default: axios } = require("axios");
const User = require("../models/user.model");

const redirectGoogle = (req, res) => {
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
  res.redirect(redirectUri);
};

const googleCallback = async (req, res) => {
  const code = req.query.code;

  if (!code) return res.status(400).send("Missing code");

  try {
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

    const { access_token } = tokenRes.data;

    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const { email, name, picture, id: googleId } = userRes.data;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        username: name,
        picture,
        googleId,
        emailVerified: true,
      });
    }

    req.session.user = {
      username: user.username,
      email: user.email,
    };

    req.session.save(() => {
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    });
  } catch (err) {
    console.error("OAuth Error", err.response?.data || err.message);
    res.status(500).send("Authentication failed");
  }
};

const verifyUser = (req, res) => {
  try {
    console.log(req.session.user);
    if (req.session.user) {
      return res.status(200).json({ user: req.session.user });
    }
    return res.status(401).json({ message: "Not authenticated" });
  } catch (error) {
    console.error("Verification Error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Failed to logout");
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
