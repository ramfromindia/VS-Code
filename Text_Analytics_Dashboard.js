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
  const wordLength = words.length;
  for (let i = 0; i < wordLength; i++) {
    const word = words[i];
    freq[word] = (freq[word] || 0) + 1;
  }

  // Find most and least recurring words
  let mostCount = -Infinity, leastCount = Infinity;
  for (const count of Object.values(freq)) {
    if (count > mostCount) mostCount = count;
    if (count < leastCount) leastCount = count;
  }
  // Collect all words with most and least count
  const mostWords = [];
  const leastWords = [];
  for (const [word, count] of Object.entries(freq)) {
    if (count === mostCount) mostWords.push(word);
    if (count === leastCount) leastWords.push(word);
  }

  // Display results
  let result = "Word Frequency:\n" + JSON.stringify(freq, null, 2);
  result += `\nMost Recurring Word(s): ${mostWords.join(", ")} (${mostCount} times)`;
  result += `\nLeast Recurring Word(s): ${leastWords.join(", ")} (${leastCount} time${leastCount > 1 ? 's' : ''})`;
  myFreqCalc1.textContent = result;
}