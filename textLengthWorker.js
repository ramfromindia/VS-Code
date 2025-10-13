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
    // Use array for word lengths
    const wordLengthsArr = [];
    let maxLen = -Infinity, minLen = Infinity;
    let longest = [];
    let shortest = [];
    for (const word of words) {
        const len = word.length;
        wordLengthsArr.push({ word, length: len });
        if (len > maxLen) maxLen = len;
        if (len < minLen) minLen = len;
    }
    // Collect longest and shortest words
    longest = wordLengthsArr.filter(w => w.length === maxLen).map(w => w.word);
    shortest = wordLengthsArr.filter(w => w.length === minLen).map(w => w.word);
    // Send partial result for this chunk
    self.postMessage({ wordLengths: wordLengthsArr, longest: longest.map(w => ({ word: w, length: maxLen })), shortest: shortest.map(w => ({ word: w, length: minLen })) });
};
