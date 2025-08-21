// In a real app, this would be a database.
export let comments = [
    {
        id: 'comment-1',
        videoId: '1',
        user: {
            id: 'user-3',
            name: 'CodeMaster',
            avatarUrl: 'https://i.pravatar.cc/150?u=user3'
        },
        text: 'Wow, the scenery is absolutely stunning! Makes me want to book a trip right now.',
        timestamp: '2 days ago'
    },
    {
        id: 'comment-2',
        videoId: '1',
        user: {
            id: 'user-5',
            name: 'ZenLife',
            avatarUrl: 'https://i.pravatar.cc/150?u=user5'
        },
        text: 'Great video quality. What drone did you use for those aerial shots?',
        timestamp: '1 day ago'
    },
    {
        id: 'comment-3',
        videoId: '2',
        user: {
            id: 'user-6',
            name: 'TechFlow',
            avatarUrl: 'https://i.pravatar.cc/150?u=user6'
        },
        text: 'This was the clearest explanation of React Hooks I have ever seen. Thank you!',
        timestamp: '5 hours ago'
    },
     {
        id: 'comment-4',
        videoId: '2',
        user: {
            id: 'user-1',
            name: 'Admin User',
            avatarUrl: 'https://i.pravatar.cc/150?u=admin@vidstream.com'
        },
        text: 'Awesome content! Looking forward to more tutorials.',
        timestamp: '3 hours ago'
    },
];
