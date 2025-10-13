// Web Worker for text analysis
self.onmessage = function(e) {
    const text = e.data;
    // Use regex to split words, handle large text efficiently
    const words = text.match(/\b\w+\b/g) || [];
    if (words.length === 0) {
        self.postMessage({
            wordLengths: [],
            longest: [],
            shortest: []
        });
        return;
    }
    // Use Map for word lengths
    const wordLengthsArr = [];
    let maxLen = -Infinity, minLen = Infinity;
    for (const word of words) {
        const len = word.length;
        wordLengthsArr.push({ word, length: len });
        if (len > maxLen) maxLen = len;
        if (len < minLen) minLen = len;
    }
    // Collect longest and shortest words
    const longest = wordLengthsArr.filter(w => w.length === maxLen).map(w => w.word);
    const shortest = wordLengthsArr.filter(w => w.length === minLen).map(w => w.word);
    self.postMessage({ wordLengths: wordLengthsArr, longest, shortest });
};
