
// Listen for messages from the main thread
self.onmessage = function(e) {
  // Receive the array of words sent from the main script
  const words = e.data;

  // Create a Map to store word frequencies
  const freqMap = new Map();

  // Iterate over each word and count its occurrences
  for (const word of words) {
    freqMap.set(word, (freqMap.get(word) || 0) + 1);
  }

  // Send the frequency map as an array of [word, count] pairs back to the main thread
  self.postMessage(Array.from(freqMap.entries()));
};
