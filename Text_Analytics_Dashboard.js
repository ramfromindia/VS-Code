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
// New button for showing sorted list
const showSortedBtn = document.getElementById("showSortedBtn");
// Container for sorted list (created dynamically)
let sortedListDiv = null;

  // Create a new Web Worker for word frequency calculation
  const worker = new Worker('wordFrequencyWorker.js');

  // Use cached DOM elements directly

  // Listen for button click to start processing
  myBtnElem.addEventListener('click', () => {
    // Sanitize input: trim, lowercase, remove non-word chars, split into words
    let sanitizedText = myInputElem.value.trim().toLowerCase();
    // Replace non-word characters with space, then split
    let words = sanitizedText.match(/\b\w+\b/g) || [];
    // Send sanitized words array to worker for processing and sorting
    worker.postMessage(words);
    // Optionally, show a spinner or loading indicator here for large data
  });

  // Store last sorted frequency array for display
  let lastSortedFreqArr = [];

  // Listen for messages from the worker (results)
  worker.onmessage = function(e) {
    // e.data is an array of [word, count] pairs, already sorted by worker
    lastSortedFreqArr = e.data;
    let result = '';
    // If the result is very large, consider showing only top N or paginating
    for (const [word, count] of lastSortedFreqArr) {
      result += `${word}: ${count}\n`;
    }
    // Update the DOM only once after processing
    myFreqCalcElem.textContent = result;
    // Remove sorted list if present (to avoid stale data)
    if (sortedListDiv) {
      sortedListDiv.remove();
      sortedListDiv = null;
    }
  };
// Event listener for the new button to show sorted list
showSortedBtn.addEventListener("click", function() {
  // Remove previous sorted list if present
  if (sortedListDiv) {
    sortedListDiv.remove();
    sortedListDiv = null;
  }
  // Build sorted list HTML
  if (lastSortedFreqArr.length === 0) {
    // No analysis done yet
    sortedListDiv = document.createElement("div");
    sortedListDiv.className = "sorted-list";
    sortedListDiv.textContent = "No analysis data available. Please analyze text first.";
    myFreqCalcElem.parentNode.insertBefore(sortedListDiv, myFreqCalcElem.nextSibling);
    return;
  }
  sortedListDiv = document.createElement("div");
  sortedListDiv.className = "sorted-list";
  // Efficiently build the sorted list
  let html = "<strong>Sorted Word Frequency List:</strong><br>";
  html += lastSortedFreqArr.map(([word, count]) => `${word}: ${count}`).join("<br>");
  sortedListDiv.innerHTML = html;
  // Insert after main result container
  myFreqCalcElem.parentNode.insertBefore(sortedListDiv, myFreqCalcElem.nextSibling);
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

// Optimized word frequency function for large scale data sets
// Uses Map for memory efficiency, processes input in chunks, and can be offloaded to a Web Worker for UI responsiveness

// Refactored for optimal repeated analysis and memory management
function wordFrequency() {
  // Always reset state variables at the start of each analysis
  // This ensures previous runs do not interfere with new input
  let chunkStart = 0;
  let freqMap = new Map();
  let workerError = false;

  // Show loading spinner while processing
  spinnerElem.style.display = "block";

  // Get current input value
  const myInput = myInputElem.value;
  if (!myInput.trim()) {
    myFreqCalcElem.textContent = "No words found.";
    spinnerElem.style.display = "none"; // Always hide spinner on exit
    return;
  }

  // Split input into words
  const words = myInput.trim().toLowerCase().match(/\b\w+\b/g);
  if (!words) {
    myFreqCalcElem.textContent = "No words found.";
    spinnerElem.style.display = "none";
    return;
  }

  // Chunk size for processing
  const CHUNK_SIZE = 10000;
  // Create a new worker for each analysis to avoid stale state
  // This ensures each analysis is independent, like social media platforms
  const worker = createWorker();

  // Helper to merge frequency maps
  function mergeMaps(map1, map2) {
    for (const [word, count] of map2.entries()) {
      map1.set(word, (map1.get(word) || 0) + count);
    }
  }

  // Format result for display and update sorted list data
  function formatResult(freqMap) {
    let mostCount = -Infinity, leastCount = Infinity;
    let mostWords = [], leastWords = [];
    // Build sorted array for the sorted list button
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
    result += JSON.stringify(Object.fromEntries(freqMap), null, 2);
    result += `\nMost Recurring Word(s): ${mostWords.join(", ")} (${mostCount} times)`;
    result += `\nLeast Recurring Word(s): ${leastWords.join(", ")} (${leastCount} time${leastCount > 1 ? 's' : ''})`;
    // Spinner is hidden after analysis in processNextChunk
    return result;
  }

  // Worker management function
  function createWorker() {
    // Always create a new worker for each run
    return new Worker("wordFrequencyWorker.js");
  }

  // Chunk processing function
  function processNextChunk() {
    if (workerError) return; // Stop if error occurred
    if (chunkStart >= words.length) {
      // All chunks processed, display results
      myFreqCalcElem.textContent = formatResult(freqMap);
      spinnerElem.style.display = "none"; // Always hide spinner after analysis
      // No event listener removal; keep UI responsive for unlimited analyses
      worker.terminate();
      return;
    }
    // Prepare chunk
    const chunk = words.slice(chunkStart, chunkStart + CHUNK_SIZE);
    chunkStart += CHUNK_SIZE;
    worker.postMessage(chunk);
  }

  worker.onmessage = function(e) {
    // Merge chunk result into main freqMap
    let chunkMapArr = e.data;
    let chunkMap = new Map(chunkMapArr);
    mergeMaps(freqMap, chunkMap);
    // No need to clear or nullify here; let GC handle it
    // Use requestIdleCallback for chunk processing if supported
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

// Event listener remains active for unlimited analyses, just like social media platforms
myBtnElem.addEventListener("click", wordFrequency);