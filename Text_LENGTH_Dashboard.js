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

	let worker;
	if (window.Worker) {
		worker = new Worker('textLengthWorker.js');
	} else {
		alert('Web Workers are not supported in your browser.');
		return;
	}

	const CHUNK_SIZE = 50000; // characters per chunk, tune as needed

	function chunkText(text, size) {
		const chunks = [];
		for (let i = 0; i < text.length; i += size) {
			chunks.push(text.slice(i, i + size));
		}
		return chunks;
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

	let aggregate = {
		wordLengths: [],
		longest: [],
		shortest: []
	};
	let chunksExpected = 0;
	let chunksReceived = 0;

	worker.onmessage = function(e) {
		const partial = e.data;
		chunksReceived++;
		aggregate.wordLengths = aggregate.wordLengths.concat(partial.wordLengths);
		// Update longest/shortest aggregation
		if (partial.longest.length > 0) {
			const maxLen = Math.max(...partial.longest.map(w => w.length));
			if (!aggregate.longest.length || maxLen > aggregate.longest[0].length) {
				aggregate.longest = partial.longest.map(w => w);
			} else if (maxLen === aggregate.longest[0].length) {
				aggregate.longest = aggregate.longest.concat(partial.longest);
			}
		}
		if (partial.shortest.length > 0) {
			const minLen = Math.min(...partial.shortest.map(w => w.length));
			if (!aggregate.shortest.length || minLen < aggregate.shortest[0].length) {
				aggregate.shortest = partial.shortest.map(w => w);
			} else if (minLen === aggregate.shortest[0].length) {
				aggregate.shortest = aggregate.shortest.concat(partial.shortest);
			}
		}
		if (chunksReceived === chunksExpected) {
			// Remove duplicates for longest/shortest
			aggregate.longest = [...new Set(aggregate.longest)];
			aggregate.shortest = [...new Set(aggregate.shortest)];
			renderResults(aggregate);
		}
	};

	analyzeBtn.addEventListener('click', function () {
		const text = inputText.value;
		const chunks = chunkText(text, CHUNK_SIZE);
		aggregate = { wordLengths: [], longest: [], shortest: [] };
		chunksExpected = chunks.length;
		chunksReceived = 0;
		if (chunksExpected === 0) {
			renderResults(aggregate);
			return;
		}
		for (const chunk of chunks) {
			worker.postMessage(chunk);
		}
	});
})