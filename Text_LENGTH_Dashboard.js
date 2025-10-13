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
		const wordLengths = words.map((word) => {return ({ word, length: word.length });});
		// Find max and min length
		let maxLen = -Infinity, minLen = Infinity;
		for (const { length } of wordLengths) {
			if (length > maxLen) maxLen = length;
			if (length < minLen) minLen = length;
		}
		// Collect longest and shortest words
		const longest = wordLengths.filter((w) => {return w.length === maxLen;}).map((w) =>{return w.word;});
		const shortest = wordLengths.filter((w) => {return w.length === minLen;}).map((w) =>{return w.word;});
		return { wordLengths, longest, shortest };
	}

	function renderResults(results) {
		// Clear previous results efficiently
		wordLengthsDiv.textContent = '';
		longestWordsDiv.textContent = '';
		shortestWordsDiv.textContent = '';

		if (results.wordLengths.length === 0) {
			const noWordsMsg = document.createElement('em');
			noWordsMsg.textContent = 'No words found.';
			wordLengthsDiv.appendChild(noWordsMsg);
			return;
		}

		// Use DocumentFragment for efficient DOM updates
		const table = document.createElement('table');
		const thead = document.createElement('thead');
		const headerRow = document.createElement('tr');
		const thWord = document.createElement('th');
		thWord.textContent = 'Word';
		const thLength = document.createElement('th');
		thLength.textContent = 'Length';
		headerRow.appendChild(thWord);
		headerRow.appendChild(thLength);
		thead.appendChild(headerRow);
		table.appendChild(thead);

		const tbody = document.createElement('tbody');
		const frag = document.createDocumentFragment();
		for (const { word, length } of results.wordLengths) {
			const row = document.createElement('tr');
			const tdWord = document.createElement('td');
			tdWord.textContent = word;
			const tdLength = document.createElement('td');
			tdLength.textContent = length;
			row.appendChild(tdWord);
			row.appendChild(tdLength);
			frag.appendChild(row);
		}
		tbody.appendChild(frag);
		table.appendChild(tbody);
		wordLengthsDiv.appendChild(table);

		longestWordsDiv.textContent = results.longest.join(', ');
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
