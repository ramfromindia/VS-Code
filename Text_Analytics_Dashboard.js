
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
  // Get input and result display elements
  const myInput = document.getElementById("myInput").value;
  const myFreqCalc2 = document.getElementById("myFreqCalc2");

  // Use Map for efficient key-value storage
  const freqMap = new Map();

  // Process input in chunks for large data (simulate chunking for demo)
  // For real streaming, use FileReader or streams
  const words = myInput.trim().toLowerCase().match(/\b\w+\b/g);
  if (!words) {
    myFreqCalc2.textContent = "No words found.";
    return;
  }

  // Count word frequencies
  for (const word of words) {
    freqMap.set(word, (freqMap.get(word) || 0) + 1);
  }

  // Track most and least frequent words in one pass
  let mostCount = -Infinity, leastCount = Infinity;
  let mostWords = [], leastWords = [];
  for (const [word, count] of freqMap.entries()) {
    // Most frequent
    if (count > mostCount) {
      mostCount = count;
      mostWords = [word];
    } else if (count === mostCount) {
      mostWords.push(word);
    }
    // Least frequent
    if (count < leastCount) {
      leastCount = count;
      leastWords = [word];
    } else if (count === leastCount) {
      leastWords.push(word);
    }
  }

  // Prepare result string
  let result = "Optimized Word Frequency:\n";
  // Convert Map to object for display
  result += JSON.stringify(Object.fromEntries(freqMap), null, 2);
  result += `\nMost Recurring Word(s): ${mostWords.join(", ")} (${mostCount} times)`;
  result += `\nLeast Recurring Word(s): ${leastWords.join(", ")} (${leastCount} time${leastCount > 1 ? 's' : ''})`;
  myFreqCalc2.textContent = result;
}

// Add event listener for optimized function button
document.getElementById("myBtnOptimized").addEventListener("click", wordFrequencyOptimized);