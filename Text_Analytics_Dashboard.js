
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

document.getElementById("myBtn").addEventListener("click",wordFrequency)

function wordFrequency() {
  const myInput = document.getElementById("myInput").value;
  const myFreqCalc1 = document.getElementById("myFreqCalc1");
  const freq = {};
  const words = myInput.trim().toLowerCase().match(/\b\w+\b/g);
  if (!words) {
    myFreqCalc1.textContent = "No words found.";
    return;
  }
  const wordsLength = words.length;
  for (let i = 0; i < wordsLength; i++) {
    const word = words[i];
    freq[word] = (freq[word] || 0) + 1;
  }

  // Find most and least recurring words and collect them in one pass
  let mostCount = -Infinity, leastCount = Infinity;
  let mostWords = [], leastWords = [];
  for (const [word, count] of Object.entries(freq)) {
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

  // Display results
  let result = "Word Frequency:\n" + JSON.stringify(freq, null, 2);
  result += `\nMost Recurring Word(s): ${mostWords.join(", ")} (${mostCount} times)`;
  result += `\nLeast Recurring Word(s): ${leastWords.join(", ")} (${leastCount} time${leastCount > 1 ? 's' : ''})`;
  myFreqCalc1.textContent = result;
}

// Optimized word frequency function for large scale data sets
// Uses Map for memory efficiency, processes input in chunks, and can be offloaded to a Web Worker for UI responsiveness
function wordFrequencyOptimized() {
  // Get the input text and result display element
  const myInput = document.getElementById("myInput").value;
  const myFreqCalc2 = document.getElementById("myFreqCalc2");

  // If input is empty or only whitespace, show message and exit
  if (!myInput.trim()) {
    myFreqCalc2.textContent = "No words found.";
    return;
  }

  // Create a new Web Worker instance, pointing to the worker script
  const worker = new Worker("wordFrequencyWorker.js");

  // Send the input text to the worker for processing
  worker.postMessage(myInput);

  // Listen for messages (results) from the worker
  worker.onmessage = function(e) {
    // The worker returns an object with word frequencies
    const freq = e.data;

    // Find most and least recurring words in the result
    let mostCount = -Infinity, leastCount = Infinity;
    let mostWords = [], leastWords = [];
    // Iterate over each word and its count
    for (const [word, count] of Object.entries(freq)) {
      // Track most frequent word(s)
      if (count > mostCount) {
        mostCount = count;
        mostWords = [word];
      } else if (count === mostCount) {
        mostWords.push(word);
      }
      // Track least frequent word(s)
      if (count < leastCount) {
        leastCount = count;
        leastWords = [word];
      } else if (count === leastCount) {
        leastWords.push(word);
      }
    }

    // Prepare the result string for display
    let result = "Optimized Word Frequency:\n";
    // Show the frequency object as formatted JSON
    result += JSON.stringify(freq, null, 2);
    // Show most and least recurring words
    result += `\nMost Recurring Word(s): ${mostWords.join(", ")} (${mostCount} times)`;
    result += `\nLeast Recurring Word(s): ${leastWords.join(", ")} (${leastCount} time${leastCount > 1 ? 's' : ''})`;

    // Display the result in the dashboard
    myFreqCalc2.textContent = result;

    // Terminate the worker to free resources
    worker.terminate();
  };

  // Handle any errors that occur in the worker
  worker.onerror = function(error) {
    myFreqCalc2.textContent = "Worker error: " + error.message;
    worker.terminate();
  };
// ...existing code...
}

// Add event listener for optimized function button
document.getElementById("myBtnOptimized").addEventListener("click", wordFrequencyOptimized);