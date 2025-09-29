self.onmessage = function(e) {
  const text = e.data;
  // Word frequency calculation
  const words = text.split(/\s+/);
  const freq = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });
  self.postMessage(freq);
};
