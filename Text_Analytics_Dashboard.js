
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

// Track repeated analysis globally
let analysisCount = 0;
const MAX_ANALYSIS = 3;

// Cache DOM elements for efficiency
const myInputElem = document.getElementById("myInput");
const myFreqCalcElem = document.getElementById("myFreqCalc");
const myBtnElem = document.getElementById("myBtn");

// Create and cache a loading spinner element
let spinnerElem = document.getElementById("loadingSpinner");
if (!spinnerElem) {
  spinnerElem = document.createElement("div");
  spinnerElem.id = "loadingSpinner";
  spinnerElem.style.display = "none";
  spinnerElem.style.position = "absolute";
  spinnerElem.style.left = "50%";
  spinnerElem.style.top = "50%";
  spinnerElem.style.transform = "translate(-50%, -50%)";
  spinnerElem.style.zIndex = "1000";
  spinnerElem.innerHTML = '<div style="border: 8px solid #f3f3f3; border-top: 8px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>';
  document.body.appendChild(spinnerElem);
}

// Add spinner animation CSS if not present
if (!document.getElementById("spinnerStyle")) {
  const styleElem = document.createElement("style");
  styleElem.id = "spinnerStyle";
  styleElem.innerHTML = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
  document.head.appendChild(styleElem);
}

// Optimized word frequency function for large scale data sets
// Uses Map for memory efficiency, processes input in chunks, and can be offloaded to a Web Worker for UI responsiveness
function wordFrequency() {
  const myInput = myInputElem.value;
  // Show loading spinner while processing heavy computation
  spinnerElem.style.display = "block";

  // If input is empty or only whitespace, show message and exit
  if (!myInput.trim()) {
    myFreqCalcElem.textContent = "No words found.";
    return;
  }

  // Split input into words
  const words = myInput.trim().toLowerCase().match(/\b\w+\b/g);
  if (!words) {
    myFreqCalcElem.textContent = "No words found.";
    return;
  }

  // Chunk size for processing
  const CHUNK_SIZE = 10000;
  let chunkStart = 0;
  let freqMap = new Map();
  let workerError = false;
  // Create a single worker instance for all chunks (optimization)
  const worker = createWorker();

  // Helper to merge frequency maps
  function mergeMaps(map1, map2) {
    for (const [word, count] of map2.entries()) {
      map1.set(word, (map1.get(word) || 0) + count);
    }
  }

  // Format result for display
  function formatResult(freqMap) {
    let mostCount = -Infinity, leastCount = Infinity;
    let mostWords = [], leastWords = [];
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
    // Hide loading spinner after processing is complete
    spinnerElem.style.display = "none";
    // Explicitly clear Maps/arrays before nullifying for better memory release
    // clear() releases internal references immediately, aiding GC
    if (Array.isArray(mostWords)) mostWords.length = 0;
    if (Array.isArray(leastWords)) leastWords.length = 0;
    if (freqMap instanceof Map) freqMap.clear();
    mostWords = null;
    leastWords = null;
    freqMap = null;
    return result;
  }

  // Worker management function
  function createWorker() {
    // Make sure the path is correct relative to your HTML file
    return new Worker("wordFrequencyWorker.js");
  }

  // Chunk processing function
  function processNextChunk() {
    if (workerError) return; // Stop if error occurred
    if (chunkStart >= words.length) {
      // All chunks processed, display results
      myFreqCalcElem.textContent = formatResult(freqMap);
      // Track analysis count and remove event listener only after repeated analysis
      analysisCount++;
      if (analysisCount >= MAX_ANALYSIS) {
        myBtnElem.removeEventListener("click", wordFrequency);
      }
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
    let chunkMapArr = e.data; // Use let so we can nullify
    let chunkMap = new Map(chunkMapArr);
    mergeMaps(freqMap, chunkMap);
    // Explicitly clear Maps/arrays before nullifying for better memory release
    // clear() releases internal references immediately, aiding GC
    if (Array.isArray(chunkMapArr)) chunkMapArr.length = 0;
    if (chunkMap instanceof Map) chunkMap.clear();
    chunkMapArr = null;
    chunkMap = null;
    // Use requestIdleCallback for chunk processing if supported
    // This allows the browser to schedule work during idle periods, improving UI responsiveness
    if (window.requestIdleCallback) {
      window.requestIdleCallback(processNextChunk);
    } else {
      // Fallback to setTimeout if requestIdleCallback is not available
      setTimeout(processNextChunk, 0);
    }
  };
  worker.onerror = function(error) {
    myFreqCalcElem.textContent = "Worker error: " + error.message;
    // Hide loading spinner on error
    spinnerElem.style.display = "none";
    workerError = true;
    worker.terminate();
  };

  processNextChunk();
}

myBtnElem.addEventListener("click", wordFrequency);