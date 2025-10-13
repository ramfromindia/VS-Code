// The dashboard should use array and string methods such as filter, map, reduce, split, join, slice, indexOf, includes, and more.
//
// Core Features:
// - Longest and shortest word detection
// - Character count and analysis (vowels, consonants, digits, special characters)
// - Sentence parsing and statistics (average sentence length, sentence count)
// - Search functionality (find and highlight words/phrases)
// - Text transformations (capitalize, reverse, remove duplicates, etc.)
// - Data visualization (charts for word frequency, etc.)
// Uses Web Worker for heavy text analysis

document.addEventListener('DOMContentLoaded', function () {
	const inputText = document.getElementById('inputText');
	const analyzeBtn = document.getElementById('analyzeBtn');
	const wordLengthsDiv = document.getElementById('wordLengths');
	const longestWordsDiv = document.getElementById('longestWords');
	const shortestWordsDiv = document.getElementById('shortestWords');

	// Create the Web Worker
	let worker;
	if (window.Worker) {
		worker = new Worker('textLengthWorker.js');
	} else {
		alert('Web Workers are not supported in your browser.');
		return;
	}

	function renderResults(results) {
		wordLengthsDiv.textContent = '';
		longestWordsDiv.textContent = '';
		shortestWordsDiv.textContent = '';

		if (results.wordLengths.length === 0) {
			const noWordsMsg = document.createElement('em');
			noWordsMsg.textContent = 'No words found.';
			wordLengthsDiv.appendChild(noWordsMsg);
			return;
		}

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

	worker.onmessage = function(e) {
		renderResults(e.data);
	};

	analyzeBtn.addEventListener('click', function () {
		const text = inputText.value;
		worker.postMessage(text);
	});
})