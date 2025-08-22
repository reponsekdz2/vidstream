// A simple helper to generate mock transcript data for a given duration.
const LOREM_IPSUM = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.".split(' ');

export const getMockTranscript = (durationSeconds) => {
    const transcript = [];
    let currentTime = 0;
    let wordIndex = 0;

    while (currentTime < durationSeconds) {
        const sentenceLength = Math.floor(Math.random() * 5) + 3; // 3 to 7 words
        let sentence = '';
        for (let i = 0; i < sentenceLength; i++) {
            sentence += LOREM_IPSUM[wordIndex % LOREM_IPSUM.length] + ' ';
            wordIndex++;
        }
        
        transcript.push({
            time: currentTime,
            text: sentence.trim() + '.',
        });
        
        currentTime += Math.random() * 4 + 2; // Add 2-6 seconds for the next line
    }
    
    return transcript;
};