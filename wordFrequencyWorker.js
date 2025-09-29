
// Listen for messages from the main thread
self.onmessage = function(e) {
  // Receive the text data sent from the main script
  const text = e.data;

  // Split the text into words using whitespace as delimiter
  const words = text.split(/\s+/);

  // Create an object to store word frequencies
  const freq = {};

  // Iterate over each word and count its occurrences
  words.forEach(word => {
    // If the word already exists in freq, increment its count
    // Otherwise, initialize it to 1
    freq[word] = (freq[word] || 0) + 1;
  });

  // Send the frequency object back to the main thread
  self.postMessage(freq);
};
