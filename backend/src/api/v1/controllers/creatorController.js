import { db } from '../../db.js';

const generateEarnings = () => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  for (const month of months) {
    data.push({ month, earnings: Math.floor(Math.random() * 2000) + 500 });
  }
  return data;
};

export const getMonetizationData = (req, res) => {
  const { id } = req.params;
  const user = db.data.users.find(u => u.id === id);
  const videos = db.data.videos.filter(v => v.userId === id);
  
  if (!user) return res.status(404).json({ message: 'User not found' });

  const requiredSubs = 1000;
  const requiredWatchHours = 4000;

  const currentSubs = user.subscribers;
  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const currentWatchHours = Math.round(totalViews / 200); // Simulated

  const data = {
    isEligible: currentSubs >= requiredSubs && currentWatchHours >= requiredWatchHours,
    subscribers: { current: currentSubs, required: requiredSubs },
    watchHours: { current: currentWatchHours, required: requiredWatchHours },
    estimatedEarnings: generateEarnings(),
  };

  res.json(data);
};