
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

// Optimized word frequency function for large scale data sets
// Uses Map for memory efficiency, processes input in chunks, and can be offloaded to a Web Worker for UI responsiveness
function wordFrequency() {
  // Get the input text and result display element
  const myInput = document.getElementById("myInput").value;
  const myFreqCalc = document.getElementById("myFreqCalc");

  // If input is empty or only whitespace, show message and exit
  if (!myInput.trim()) {
    myFreqCalc.textContent = "No words found.";
    return;
  }

  // Split input into words
  const words = myInput.trim().toLowerCase().match(/\b\w+\b/g);
  if (!words) {
    myFreqCalc.textContent = "No words found.";
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
  const worker = new Worker("wordFrequencyWorker.js");
  // Track if an error occurred to avoid further processing
  let workerError = false;

  // Function to process next chunk using the single worker
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
      myFreqCalc.textContent = result;
      // Remove event listener after processing is done
      const btn = document.getElementById("myBtn");
      btn.removeEventListener("click", wordFrequency);
      // Terminate the worker after all chunks are processed
      worker.terminate();
      return;
    }
    // Prepare chunk
    const chunk = words.slice(chunkStart, chunkStart + CHUNK_SIZE);
    chunkStart += CHUNK_SIZE;
    // Send chunk to the single worker
    worker.postMessage(chunk);
  }

  // Listen for messages from the worker (reused for all chunks)
  worker.onmessage = function(e) {
    // Merge chunk result into main freqMap
    const chunkMapArr = e.data; // Array of [word, count] pairs
    const chunkMap = new Map(chunkMapArr);
    mergeMaps(freqMap, chunkMap);
    // Process next chunk
    setTimeout(processNextChunk, 0);
  };
  worker.onerror = function(error) {
    myFreqCalc.textContent = "Worker error: " + error.message;
    workerError = true;
    worker.terminate();
  };

  // Start processing chunks with the single worker
  processNextChunk();
}

// Add event listener for optimized function button
document.getElementById("myBtn").addEventListener("click", wordFrequency);