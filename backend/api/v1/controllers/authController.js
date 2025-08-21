import { users } from '../../../../data/users.js';

export const registerUser = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password, // In a real app, hash this!
    avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
    subscribers: 0,
    subscriptions: [],
  };
  users.push(newUser);
  
  const { password: _, ...userToReturn } = newUser;
  res.status(201).json(userToReturn);
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = users.find(u => u.email === email);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const { password: _, ...userToReturn } = user;
  res.json(userToReturn);
};