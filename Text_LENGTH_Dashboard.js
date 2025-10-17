    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.addEventListener('click', analyzeWordLengths);
    const wordLengthsEl = document.getElementById('wordLengths');
    const mostCommonWordsEl = document.getElementById('mostCommonWords');
    const leastCommonWordsEl = document.getElementById('leastCommonWords');


function analyzeWordLengths() {
    let input = document.getElementById('inputText').value || '';

    // Normalize typographic apostrophes to straight ASCII apostrophe
    input = input.replace(/[’‘]/g, "'");

    // Unicode-aware pattern: match letters or numbers (Unicode),
    // allowing internal hyphens or apostrophes (e.g., don't, well-being).
    // The 'u' flag ensures \p{L} and \p{N} work correctly.
    const wordPattern = /[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu;
    const words = input.match(wordPattern) || [];
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
    // Count Unicode code points so characters like emoji are counted as one
    const len = Array.from(word).length;
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

    // Deduplicate words while preserving first-seen order
    const uniqueMax = [...new Set(maxWords)];
    const uniqueMin = [...new Set(minWords)];

    mostCommonWordsEl.textContent = uniqueMax.map(function(w){ return `${w} (${maxLen})`; }).join(', ');
    leastCommonWordsEl.textContent = uniqueMin.map(function(w){ return `${w} (${minLen})`; }).join(', ');
}
