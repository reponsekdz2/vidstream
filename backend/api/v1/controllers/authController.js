import { db } from '../../../db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const existingUser = db.data.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists.' });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = {
    id: uuidv4(),
    name,
    email,
    password: hashedPassword,
    avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
    subscribers: 0,
    subscriptions: [],
    settings: {
      notifications: { newUploads: true, comments: true, mentions: true },
      playback: { defaultQuality: "Auto", autoplay: true },
      privacy: { showLikedVideos: true, showSubscriptions: true }
    },
    channelLayout: [],
    blockedUsers: [],
    bannedWords: [],
  };
  
  db.data.users.push(newUser);
  await db.write();
  
  const { password: _, ...userToReturn } = newUser;
  res.status(201).json(userToReturn);
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = db.data.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const { password: _, ...userToReturn } = user;
  res.json(userToReturn);
};