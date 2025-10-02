
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

// Optimized word frequency function for large scale data sets
// Uses Map for memory efficiency, processes input in chunks, and can be offloaded to a Web Worker for UI responsiveness
function wordFrequency() {
  const myInput = myInputElem.value;

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

  // Helper to merge frequency maps
  function mergeMaps(map1, map2) {
    for (const [word, count] of map2.entries()) {
      map1.set(word, (map1.get(word) || 0) + count);
    }
  }

  // Create a single worker instance for all chunks (optimization)
  // Make sure the path is correct relative to your HTML file
  const worker = new Worker("wordFrequencyWorker.js");
  let workerError = false;

  function processNextChunk() {
    if (workerError) return; // Stop if error occurred
    if (chunkStart >= words.length) {
      // All chunks processed, display results
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
      myFreqCalcElem.textContent = result;
      // Nullify large arrays/maps after use
      mostWords = null;
      leastWords = null;
      freqMap = null;
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
    // Nullify chunkMapArr and chunkMap after use
    chunkMapArr = null;
    chunkMap = null;
    setTimeout(processNextChunk, 0);
  };
  worker.onerror = function(error) {
    myFreqCalcElem.textContent = "Worker error: " + error.message;
    workerError = true;
    worker.terminate();
  };

  processNextChunk();
}

myBtnElem.addEventListener("click", wordFrequency);