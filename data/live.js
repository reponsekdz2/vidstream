// In a real app, this would come from a live data source like a WebSocket server.
export const liveChatMessages = [
    {
        id: 'lc-1',
        videoId: '5', // Corresponds to the video marked as live in db.ts
        user: { name: 'GamerX', avatarUrl: 'https://i.pravatar.cc/150?u=gamerx' },
        message: 'This build is insane! Can\'t wait to see the benchmarks.',
    },
    {
        id: 'lc-2',
        videoId: '5',
        user: { name: 'Pixel_Princess', avatarUrl: 'https://i.pravatar.cc/150?u=pixel' },
        message: 'Are you going to overclock the CPU?',
    },
    {
        id: 'lc-3',
        videoId: '5',
        user: { name: 'ModBot', avatarUrl: 'https://i.pravatar.cc/150?u=modbot', isMod: true },
        message: 'Please keep the chat respectful. No spoilers!',
    },
    {
        id: 'lc-4',
        videoId: '5',
        user: { name: 'TechHead', avatarUrl: 'https://i.pravatar.cc/150?u=techhead' },
        message: 'What case fans are you using? They look great.',
    },
];