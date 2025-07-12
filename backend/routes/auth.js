const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Configure Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_REDIRECT_URI
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      // Update tokens
      user.googleTokens = {
        accessToken,
        refreshToken,
        expiryDate: new Date(Date.now() + 3600000) // 1 hour from now
      };
      await user.save();
      return done(null, user);
    }

    // Create new user
    user = new User({
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      googleTokens: {
        accessToken,
        refreshToken,
        expiryDate: new Date(Date.now() + 3600000)
      }
    });

    await user.save();
    done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    done(error, null);
  }
}));

// Serialize/deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Routes
router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/gmail.readonly'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        { userId: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
    }
  }
);

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-googleTokens');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;