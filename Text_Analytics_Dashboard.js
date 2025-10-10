// --- New Feature: Show Sorted Word Frequency List ---
// Adds a button to display the sorted word frequency list in a styled div below the main result.
// The sorted list is updated after each analysis and shown only when requested.

// Project Description:
// Text Analytics Dashboard
// Build a web-based dashboard that allows users to input a block of text and receive various analytics and insights.
// The dashboard should use array and string methods such as filter, map, reduce, split, join, slice, indexOf, includes, and more.
//
// Core Features:
// - Word frequency analysis (most/least common words)
// - Longest and shortest word detection
// - Character count and analysis (vowels, consonants, digits, special characters)
// - Sentence parsing and statistics (average sentence length, sentence count)
// - Search functionality (find and highlight words/phrases)
// - Text transformations (capitalize, reverse, remove duplicates, etc.)
// - Data visualization (charts for word frequency, etc.)
//
// Requirements:
// - Use vanilla JavaScript (no frameworks required)
// - Interactive HTML interface (input area, buttons, results display)
// - Modular functions for each analytic feature
// - Professional CSS styling

// No analysis count or limit needed; allow unlimited analyses for robust, social-media-style behavior

// Cache DOM elements for efficiency
const myInputElem = document.getElementById(`myInput`);
const myFreqCalcElem = document.getElementById(`myFreqCalc`);
const myBtnElem = document.getElementById(`myBtn`);
const showSortedBtn = document.getElementById(`showSortedBtn`);
let sortedListDiv = null;

// Add ARIA roles for accessibility
myInputElem.setAttribute(`aria-label`, `Text input area`);
myFreqCalcElem.setAttribute(`role`, `region`);
myFreqCalcElem.setAttribute(`aria-live`, `polite`);
showSortedBtn.setAttribute(`aria-label`, `Show sorted word frequency list`);
myBtnElem.setAttribute(`aria-label`, `Analyze text`);

// Remove duplicate event listener and unify spinner usage
// Refactored: Only one event listener for Analyze button, handled below

let lastSortedFreqArr = [];
// --- Output Caching ---
let outputCache = {
  input: null,
  analysisHtml: null,
  sortedListHtml: null,
  sortedFreqArr: null
};
// Benchmark cache
let benchmarkCache = {
  input: null,
  outputHtml: null
};

// Spinner element setup (moved up for unified usage)
// Spinner element setup (single declaration for whole script)
// ...existing code...
// Event listener for the new button to show sorted list
showSortedBtn.addEventListener(`click`, function(e) {
  // Keyboard accessibility: allow Enter/Space to trigger button
  if (e.type === `click` || e.key === `Enter` || e.key === ` `) {
    if (sortedListDiv) {
      sortedListDiv.remove();
      sortedListDiv = null;
    }
    const inputValue = myInputElem.value;
    const words = getSanitizedWords(inputValue);
    // If input is invalid, bypass cache and run as normal
    if (words.length === 0 || lastSortedFreqArr.length === 0) {
      sortedListDiv = document.createElement(`div`);
      sortedListDiv.className = `sorted-list`;
      sortedListDiv.textContent = `No analysis data available. Please analyze text first.`;
      myFreqCalcElem.parentNode.insertBefore(sortedListDiv, myFreqCalcElem.nextSibling);
      setTimeout(function() {
        if (sortedListDiv && sortedListDiv.parentNode) {
          sortedListDiv.remove();
        }
      }, 500);
      return;
    }
    // If input matches cache and sorted list html exists, use cached sorted list
    if (outputCache.input === inputValue && outputCache.sortedListHtml) {
      sortedListDiv = document.createElement(`div`);
      sortedListDiv.className = `sorted-list`;
      sortedListDiv.innerHTML = outputCache.sortedListHtml;
      myFreqCalcElem.parentNode.insertBefore(sortedListDiv, myFreqCalcElem.nextSibling);
      return;
    }
    // Otherwise, generate and cache sorted list html
    let html = `<strong>Sorted Word Frequency List:</strong><br>`;
    html += lastSortedFreqArr.map(([word, count]) => `${word}: ${count}`).join(`<br>`);
    sortedListDiv = document.createElement(`div`);
    sortedListDiv.className = `sorted-list`;
    sortedListDiv.innerHTML = html;
    myFreqCalcElem.parentNode.insertBefore(sortedListDiv, myFreqCalcElem.nextSibling);
    // Cache the sorted list html
    outputCache.sortedListHtml = html;
  }
});
// Keyboard accessibility for sorted list button
showSortedBtn.addEventListener(`keydown`, function(e) {
  if (e.key === `Enter` || e.key === ` `) {
    showSortedBtn.click();
  }
});
let spinnerElem = document.getElementById(`loadingSpinner`);
// Spinner element is now in HTML. Just reference and use classList for show/hide.

// Helper function for sanitizing and splitting input text
function getSanitizedWords(input) {
  // Trims, lowercases, and extracts words using regex
  return input.trim().toLowerCase().match(/\b\w+\b/g) || [];
}

// Optimized word frequency function for large scale data sets
function wordFrequency(e) {
  // Keyboard accessibility: allow Enter/Space to trigger button
  // Use optional chaining to safely access event type
  if (e?.type === `keydown` && !(e.key === `Enter` || e.key === ` `)) return;

  // Hide sorted list if visible and clear its content
  if (sortedListDiv) {
    sortedListDiv.remove();
    sortedListDiv = null;
  }
  lastSortedFreqArr = [];

  // Get current input value and sanitize
  const inputValue = myInputElem.value;
  const words = getSanitizedWords(inputValue);

  // If input is invalid, bypass cache and run as normal
  if (words.length === 0) {
    myFreqCalcElem.textContent = `No words found.`;
    spinnerElem.style.display = `none`;
    outputCache.input = null;
    outputCache.analysisHtml = null;
    outputCache.sortedListHtml = null;
    outputCache.sortedFreqArr = null;
    setTimeout(function() {
      if (myFreqCalcElem.textContent === `No words found.`) {
        myFreqCalcElem.textContent = "";
      }
    }, 500);
    return;
  }

  // If input matches cache, display cached analysis output
  if (outputCache.input === inputValue && outputCache.analysisHtml) {
  myFreqCalcElem.innerHTML = outputCache.analysisHtml;
  // Use nullish coalescing to default to empty array only if value is null/undefined
  lastSortedFreqArr = outputCache.sortedFreqArr ?? [];
  spinnerElem.style.display = `none`;
  return;
  }

  let chunkStart = 0;
  let freqMap = new Map();
  let workerError = false;
  spinnerElem.style.display = `block`;

  // Dynamic chunk sizing for adaptive performance
  let chunkSize = 10000; // Initial chunk size
  const MIN_CHUNK = 1000; // Minimum chunk size
  const MAX_CHUNK = 50000; // Maximum chunk size
  const TARGET_TIME = 50; // Target time per chunk in ms
  const worker = new Worker(`wordFrequencyWorker.js`);

  function mergeMaps(map1, map2) {
    for (const [word, count] of map2.entries()) {
      // Use nullish coalescing to treat only null/undefined as missing
      map1.set(word, (map1.get(word) ?? 0) + count);
    }
  }

  function formatResult(freqMap) {
    let mostCount = -Infinity, leastCount = Infinity;
    let mostWords = [], leastWords = [];
    lastSortedFreqArr = Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1]);
    for (const [word, count] of freqMap.entries()) {
      if (count > mostCount) {
        mostCount = count;
        mostWords = [word];
      } else if (count === mostCount) {
        mostWords.push(word);
      }
      if (count < leastCount) {
        leastCount = count;
        leastWords = [word];
      } else if (count === leastCount) {
        leastWords.push(word);
      }
    }
    let result = `Word Frequency:\n`;
    result += (JSON.stringify(Object.fromEntries(freqMap), null, 2)) + `<br><br>` ;
    result += `\nMost Recurring Word(s): ${mostWords.join(", ")} (${mostCount} times)<br>`;
    result += `\nLeast Recurring Word(s): ${leastWords.join(", ")} (${leastCount} time${leastCount > 1 ? 's' : ''})<br><br>`;
    return result;
  }

  // Process next chunk with dynamic sizing
  function processNextChunk() {
    if (workerError) return;
    if (chunkStart >= words.length) {
      const analysisHtml = formatResult(freqMap);
      myFreqCalcElem.innerHTML = analysisHtml;
      spinnerElem.style.display = "none";
      worker.terminate();
      // Cache the output
      outputCache.input = inputValue;
      outputCache.analysisHtml = analysisHtml;
      outputCache.sortedFreqArr = lastSortedFreqArr ? [...lastSortedFreqArr] : [];
      outputCache.sortedListHtml = null; // Will be set when sorted list is shown
      return;
    }
    // Record start time for chunk processing
    const start = performance.now();
    const chunk = words.slice(chunkStart, chunkStart + chunkSize);
    chunkStart += chunkSize;
    worker.postMessage(chunk);
    // After worker returns, adjust chunk size based on elapsed time
    worker.onmessage = function(e) {
      let chunkMapArr = e.data;
      let chunkMap = new Map(chunkMapArr);
      mergeMaps(freqMap, chunkMap);
      const end = performance.now();
      const elapsed = end - start;
      // Dynamically adjust chunk size for next batch
      if (elapsed < TARGET_TIME && chunkSize < MAX_CHUNK) {
        chunkSize = Math.min(chunkSize * 2, MAX_CHUNK); // Increase chunk size
      } else if (elapsed > TARGET_TIME && chunkSize > MIN_CHUNK) {
        chunkSize = Math.max(Math.floor(chunkSize / 2), MIN_CHUNK); // Decrease chunk size
      }
      // Use optional chaining to safely check for requestIdleCallback
      if (window?.requestIdleCallback) {
        window.requestIdleCallback(processNextChunk);
      } else {
        setTimeout(processNextChunk, 0);
      }
    };
  }
  
  worker.onerror = function(error) {
    myFreqCalcElem.textContent = `Worker error: ` + error.message;
    spinnerElem.style.display = `none`;
    workerError = true;
    worker.terminate();
  };

  processNextChunk();
}

// Event listener for unlimited analyses, with keyboard accessibility
myBtnElem.addEventListener(`click`, wordFrequency);
myBtnElem.addEventListener(`keydown`, function(e) {
  if (e.key === `Enter` || e.key === ` `) {
    wordFrequency(e);
  }
});


// --- Utility Feature: Benchmark Multiple Functions (DOM Output) ---
function benchmarkFunctionsDOM(functionsWithArgs) {
  // Get current input value for caching
  const currentInput = functionsWithArgs.map(f => JSON.stringify(f.args)).join('|');
  // If input matches cache, show cached output and skip computation
  if (benchmarkCache.input === currentInput && benchmarkCache.outputHtml) {
    // Remove previous benchmark result and cache indicator if present
    let oldDiv = document.getElementById('benchmarkResults');
    if (oldDiv) oldDiv.remove();
    let oldIndicator = myFreqCalcElem.parentNode.querySelector('.cache-indicator');
    if (oldIndicator) oldIndicator.remove();
    // Add cache indicator with fade-in effect
    const indicator = document.createElement('div');
    indicator.className = 'cache-indicator';
    indicator.textContent = 'Showing cached results';
    myFreqCalcElem.parentNode.insertBefore(indicator, myFreqCalcElem.nextSibling);
    // Insert cached benchmark results
    const div = document.createElement('div');
    div.id = 'benchmarkResults';
    div.classList.add('benchmark-results');
    div.innerHTML = benchmarkCache.outputHtml;
    indicator.parentNode.insertBefore(div, indicator.nextSibling);
    return;
  }
  // Remove previous benchmark result if present
  let oldDiv = document.getElementById('benchmarkResults');
  if (oldDiv) oldDiv.remove();

  const NUM_RUNS = 10; // Number of times to run each function for averaging
  const results = [];
  for (let i = 0; i < functionsWithArgs.length; i++) {
    const { fn, args } = functionsWithArgs[i];
    let totalTime = 0;
    for (let run = 0; run < NUM_RUNS; run++) {
      const start = performance.now();
      fn(...(args || []));
      const end = performance.now();
      totalTime += (end - start);
    }
    const avgTime = totalTime / NUM_RUNS;
    results.push({
      name: fn.name || 'anonymous',
      time: avgTime.toFixed(3)
    });
  }
  // Sort results by execution time (ascending)
  results.sort((a, b) => a.time - b.time);

  // Create the results div and use CSS classes for styling
  const div = document.createElement('div');
  div.id = 'benchmarkResults';
  div.classList.add('benchmark-results');
  div.innerHTML = document.getElementById('benchmarkResultsTemplate').innerHTML;
  // Fill table rows dynamically using DocumentFragment
  const tableBody = div.querySelector('.benchmark-table tbody');
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = r.name;
    const timeCell = document.createElement('td');
    timeCell.textContent = r.time;
    timeCell.style.textAlign = 'right';
    row.appendChild(nameCell);
    row.appendChild(timeCell);
    fragment.appendChild(row);
  }
  tableBody.appendChild(fragment);
  // Insert below analysis results
  myFreqCalcElem.parentNode.insertBefore(div, myFreqCalcElem.nextSibling);
  // Cache the input and output HTML
  benchmarkCache.input = currentInput;
  benchmarkCache.outputHtml = div.innerHTML;
  return results;
}

// Add event listeners for benchmark button
const benchmarkBtn = document.getElementById('benchmarkBtn');
if (benchmarkBtn) {
  benchmarkBtn.addEventListener('click', function() {
    benchmarkFunctionsDOM([
      { fn: getSanitizedWords, args: [myInputElem.value] },
      { fn: wordFrequency, args: [null] }
    ]);
  });
  benchmarkBtn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      benchmarkBtn.click();
    }
  });
}