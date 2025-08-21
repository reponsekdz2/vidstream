// In a real app, this would be a database.
// This acts as a table for user watch history.
export let history = [
    {
        id: 'hist-1',
        userId: 'user-1',
        videoId: '4',
        watchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
        id: 'hist-2',
        userId: 'user-1',
        videoId: '6',
        watchedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
];
