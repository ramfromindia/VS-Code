    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.addEventListener('click', analyzeWordLengths);
	const wordLengthsEl = document.getElementById('wordLengths');
    const mostCommonWordsEl = document.getElementById('mostCommonWords');
    const leastCommonWordsEl = document.getElementById('leastCommonWords');


function analyzeWordLengths() {
    const input = document.getElementById('inputText').value;

    const words = input.match(/\b\w+\b/g) || [];
    if (!words.length) {
        wordLengthsEl.textContent = 'No words found.';
        mostCommonWordsEl.textContent = 'N/A';
        leastCommonWordsEl.textContent = 'N/A';
        return;
    }

    let minLen = Infinity, maxLen = 0;
    let minWords = [], maxWords = [];
    let wordLengthsStr = '';
	const wordsLength = words.length;

    for (let i = 0; i < wordsLength; i++) {
        const word = words[i];
        const len = word.length;
        wordLengthsStr += `${word} (${len})${i < wordsLength - 1 ? ', ' : ''}`;
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

    wordLengthsEl.textContent = wordLengthsStr;
    mostCommonWordsEl.textContent = maxWords.map(w => `${w} (${maxLen})`).join(', ');
    leastCommonWordsEl.textContent = minWords.map(w => `${w} (${minLen})`).join(', ');
}
