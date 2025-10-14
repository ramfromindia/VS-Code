    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.addEventListener('click', analyzeWordLengths);

function analyzeWordLengths() {
    const input = document.getElementById('inputText').value;
    const words = input.match(/\b\w+\b/g) || [];
    if (!words.length) {
        document.getElementById('wordLengths').textContent = 'No words found.';
        document.getElementById('mostCommonWords').textContent = 'N/A';
        document.getElementById('leastCommonWords').textContent = 'N/A';
        return;
    }

    let minLen = Infinity, maxLen = 0;
    let minWords = [], maxWords = [];
    let wordLengthsStr = '';

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const len = word.length;
        wordLengthsStr += `${word} (${len})${i < words.length - 1 ? ', ' : ''}`;
        if (len > maxLen) {
            maxLen = len;
            maxWords = [word];
        } else if (len === maxLen) {
            maxWords.push(word);
        }
        if (len < minLen) {
            minLen = len;
            minWords = [word];
        } else if (len === minLen) {
            minWords.push(word);
        }
    }

    document.getElementById('wordLengths').textContent = wordLengthsStr;
    document.getElementById('mostCommonWords').textContent = maxWords.map(w => `${w} (${maxLen})`).join(', ');
    document.getElementById('leastCommonWords').textContent = minWords.map(w => `${w} (${minLen})`).join(', ');
}
