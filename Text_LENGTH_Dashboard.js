function analyzeWordLengths() {
    const input = document.getElementById('inputText').value;
    // Split input into words (alphanumeric, ignore punctuation)
    const words = input.match(/\b\w+\b/g) || [];
    // Display each word with its length
    const wordLengthPairs = words.map(word => `${word} (${word.length})`);
    document.getElementById('wordLengths').textContent = wordLengthPairs.length ? wordLengthPairs.join(', ') : 'No words found.';

    // Find highest and lowest word lengths
    let maxLen = 0, minLen = Infinity;
    words.forEach(word => {
        if (word.length > maxLen) maxLen = word.length;
        if (word.length < minLen) minLen = word.length;
    });

    // Words with highest length
    const mostCommonWords = words.filter(word => word.length === maxLen);
    const mostCommonWordsPairs = mostCommonWords.map(word => `${word} (${word.length})`);
    document.getElementById('mostCommonWords').textContent = mostCommonWordsPairs.length ? mostCommonWordsPairs.join(', ') : 'N/A';

    // Words with lowest length
    const leastCommonWords = words.filter(word => word.length === minLen);
    const leastCommonWordsPairs = leastCommonWords.map(word => `${word} (${word.length})`);
    document.getElementById('leastCommonWords').textContent = leastCommonWordsPairs.length ? leastCommonWordsPairs.join(', ') : 'N/A';

    // ...existing code...
}
