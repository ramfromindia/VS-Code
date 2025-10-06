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
const myInputElem = document.getElementById("myInput");
const myFreqCalcElem = document.getElementById("myFreqCalc");
const myBtnElem = document.getElementById("myBtn");
const showSortedBtn = document.getElementById("showSortedBtn");
let sortedListDiv = null;

// Add ARIA roles for accessibility
myInputElem.setAttribute("aria-label", "Text input area");
myFreqCalcElem.setAttribute("role", "region");
myFreqCalcElem.setAttribute("aria-live", "polite");
showSortedBtn.setAttribute("aria-label", "Show sorted word frequency list");
myBtnElem.setAttribute("aria-label", "Analyze text");

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

// Spinner element setup (moved up for unified usage)
// Spinner element setup (single declaration for whole script)
// ...existing code...
// Event listener for the new button to show sorted list
showSortedBtn.addEventListener("click", function(e) {
  // Keyboard accessibility: allow Enter/Space to trigger button
  if (e.type === "click" || e.key === "Enter" || e.key === " ") {
    if (sortedListDiv) {
      sortedListDiv.remove();
      sortedListDiv = null;
    }
    const inputValue = myInputElem.value;
    const words = getSanitizedWords(inputValue);
    // If input is invalid, bypass cache and run as normal
    if (words.length === 0 || lastSortedFreqArr.length === 0) {
      sortedListDiv = document.createElement("div");
      sortedListDiv.className = "sorted-list";
      sortedListDiv.textContent = "No analysis data available. Please analyze text first.";
      myFreqCalcElem.parentNode.insertBefore(sortedListDiv, myFreqCalcElem.nextSibling);
      return;
    }
    // If input matches cache and sorted list html exists, use cached sorted list
    if (outputCache.input === inputValue && outputCache.sortedListHtml) {
      sortedListDiv = document.createElement("div");
      sortedListDiv.className = "sorted-list";
      sortedListDiv.innerHTML = outputCache.sortedListHtml;
      myFreqCalcElem.parentNode.insertBefore(sortedListDiv, myFreqCalcElem.nextSibling);
      return;
    }
    // Otherwise, generate and cache sorted list html
    let html = "<strong>Sorted Word Frequency List:</strong><br>";
    html += lastSortedFreqArr.map(([word, count]) => `${word}: ${count}`).join("<br>");
    sortedListDiv = document.createElement("div");
    sortedListDiv.className = "sorted-list";
    sortedListDiv.innerHTML = html;
    myFreqCalcElem.parentNode.insertBefore(sortedListDiv, myFreqCalcElem.nextSibling);
    // Cache the sorted list html
    outputCache.sortedListHtml = html;
  }
});
// Keyboard accessibility for sorted list button
showSortedBtn.addEventListener("keydown", function(e) {
  if (e.key === "Enter" || e.key === " ") {
    showSortedBtn.click();
  }
});
let spinnerElem = document.getElementById("loadingSpinner");
if (!spinnerElem) {
  spinnerElem = document.createElement("div");
  spinnerElem.id = "loadingSpinner";
  spinnerElem.classList.add("spinner-overlay");
  spinnerElem.style.display = "none";
  spinnerElem.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(spinnerElem);
}

// Helper function for sanitizing and splitting input text
function getSanitizedWords(input) {
  // Trims, lowercases, and extracts words using regex
  return input.trim().toLowerCase().match(/\b\w+\b/g) || [];
}

// Optimized word frequency function for large scale data sets
function wordFrequency(e) {
  // Keyboard accessibility: allow Enter/Space to trigger button
  if (e && e.type === "keydown" && !(e.key === "Enter" || e.key === " ")) return;

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
    myFreqCalcElem.textContent = "No words found.";
    spinnerElem.style.display = "none";
    outputCache.input = null;
    outputCache.analysisHtml = null;
    outputCache.sortedListHtml = null;
    outputCache.sortedFreqArr = null;
    return;
  }

  // If input matches cache, display cached analysis output
  if (outputCache.input === inputValue && outputCache.analysisHtml) {
    myFreqCalcElem.innerHTML = outputCache.analysisHtml;
    lastSortedFreqArr = outputCache.sortedFreqArr ? [...outputCache.sortedFreqArr] : [];
    spinnerElem.style.display = "none";
    return;
  }

  let chunkStart = 0;
  let freqMap = new Map();
  let workerError = false;
  spinnerElem.style.display = "block";

  // Chunk size for processing
  const CHUNK_SIZE = 10000;
  const worker = new Worker("wordFrequencyWorker.js");

  function mergeMaps(map1, map2) {
    for (const [word, count] of map2.entries()) {
      map1.set(word, (map1.get(word) || 0) + count);
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
    let result = "Word Frequency:\n";
    result += (JSON.stringify(Object.fromEntries(freqMap), null, 2)) + "<br><br>" ;
    result += `\nMost Recurring Word(s): ${mostWords.join(", ")} (${mostCount} times)<br>`;
    result += `\nLeast Recurring Word(s): ${leastWords.join(", ")} (${leastCount} time${leastCount > 1 ? 's' : ''})<br><br>`;
    return result;
  }

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
    const chunk = words.slice(chunkStart, chunkStart + CHUNK_SIZE);
    chunkStart += CHUNK_SIZE;
    worker.postMessage(chunk);
  }

  worker.onmessage = function(e) {
    let chunkMapArr = e.data;
    let chunkMap = new Map(chunkMapArr);
    mergeMaps(freqMap, chunkMap);
    if (window.requestIdleCallback) {
      window.requestIdleCallback(processNextChunk);
    } else {
      setTimeout(processNextChunk, 0);
    }
  };
  worker.onerror = function(error) {
    myFreqCalcElem.textContent = "Worker error: " + error.message;
    spinnerElem.style.display = "none";
    workerError = true;
    worker.terminate();
  };

  processNextChunk();
}

// Event listener for unlimited analyses, with keyboard accessibility
myBtnElem.addEventListener("click", wordFrequency);
myBtnElem.addEventListener("keydown", function(e) {
  if (e.key === "Enter" || e.key === " ") {
    wordFrequency(e);
  }
});