    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.addEventListener('click', analyzeWordLengths);
    const wordLengthsEl = document.getElementById('wordLengths');
    const mostCommonWordsEl = document.getElementById('mostCommonWords');
    const leastCommonWordsEl = document.getElementById('leastCommonWords');


function analyzeWordLengths() {
    let input = document.getElementById('inputText').value || '';

    // Normalize typographic apostrophes to straight ASCII apostrophe
    input = input.replace(/[’‘]/g, "'");

    // Build a word pattern. Prefer Unicode property escapes if supported,
    // otherwise fall back to an ASCII-safe pattern to avoid runtime SyntaxError
    // on older browsers (older Edge/IE). The fallback supports letters/digits
    // in the ASCII range and still preserves internal hyphens/apostrophes.
    let wordPattern;
    try {
        // Test whether the environment supports \p{L} in RegExp (Unicode property escapes)
        new RegExp("\\p{L}", "u");
        wordPattern = /[\p{L}\p{N}]+(?:['-][\p{L}\p{N}]+)*/gu;
    } catch (e) {
        // Fallback for environments without Unicode property escape support.
        // Note: fallback won't match non-Latin scripts correctly, but avoids
        // a hard crash and keeps functionality for ASCII, apostrophes, and hyphens.
        wordPattern = /[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g;
    }
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
