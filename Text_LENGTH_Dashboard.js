// The dashboard should use array and string methods such as filter, map, reduce, split, join, slice, indexOf, includes, and more.
//
// Core Features:
// - Longest and shortest word detection
// - Character count and analysis (vowels, consonants, digits, special characters)
// - Sentence parsing and statistics (average sentence length, sentence count)
// - Search functionality (find and highlight words/phrases)
// - Text transformations (capitalize, reverse, remove duplicates, etc.)
// - Data visualization (charts for word frequency, etc.)

document.addEventListener('DOMContentLoaded', function () {
	const inputText = document.getElementById('inputText');
	const analyzeBtn = document.getElementById('analyzeBtn');
	const wordLengthsDiv = document.getElementById('wordLengths');
	const longestWordsDiv = document.getElementById('longestWords');
	const shortestWordsDiv = document.getElementById('shortestWords');

	function analyzeText(text) {
		// Use regex to split words, handle large text efficiently
		const words = text.match(/\b\w+\b/g) || [];
		if (words.length === 0) {
			return {
				wordLengths: [],
				longest: [],
				shortest: []
			};
		}
		// Map words to their lengths
		const wordLengths = words.map(word => ({ word, length: word.length }));
		// Find max and min length
		let maxLen = -Infinity, minLen = Infinity;
		for (const { length } of wordLengths) {
			if (length > maxLen) maxLen = length;
			if (length < minLen) minLen = length;
		}
		// Collect longest and shortest words
		const longest = wordLengths.filter(w => w.length === maxLen).map(w => w.word);
		const shortest = wordLengths.filter(w => w.length === minLen).map(w => w.word);
		return { wordLengths, longest, shortest };
	}

	function renderResults(results) {
		// Word lengths table
		if (results.wordLengths.length === 0) {
			wordLengthsDiv.innerHTML = '<em>No words found.</em>';
			longestWordsDiv.innerHTML = '';
			shortestWordsDiv.innerHTML = '';
			return;
		}
		let tableHtml = '<table><thead><tr><th>Word</th><th>Length</th></tr></thead><tbody>';
		for (const { word, length } of results.wordLengths) {
			tableHtml += `<tr><td>${word}</td><td>${length}</td></tr>`;
		}
		tableHtml += '</tbody></table>';
		wordLengthsDiv.innerHTML = tableHtml;
		// Longest words
		longestWordsDiv.textContent = results.longest.join(', ');
		// Shortest words
		shortestWordsDiv.textContent = results.shortest.join(', ');
	}

	analyzeBtn.addEventListener('click', function () {
		// For large data, process asynchronously
		setTimeout(() => {
			const text = inputText.value;
			const results = analyzeText(text);
			renderResults(results);
		}, 0);
	});
});
