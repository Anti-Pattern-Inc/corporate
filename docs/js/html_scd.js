const htmlScd = (() => {
  const map = {
    '&nbsp;': ' ',
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&apos;': "'",
    '&copy;': '©'
  };
  return (src) => {
    const re = /&#x([0-9A-Fa-f]+);|&#(\d+);|&\w+;|[^&]+|&/g;
    let text = '';
    let m;
    while ((m = re.exec(src)) !== null) {
      if (m[0].charAt(0) == '&') {
        if (m[0].length == 1) {
          text = text + m[0];
        } else if (m[0].charAt(1) == '#') {
          if (m[0].charAt(2) == 'x') {
            text = text + String.fromCharCode(parseInt(m[1], 16));
          } else {
            text = text + String.fromCharCode(m[2] - 0);
          }
        } else if (map.hasOwnProperty(m[0])) {
          text = text + map[m[0]];
        } else {
          text = text + m[0];
        }
      } else {
        text = text + m[0];
      }
    }
    return text;
  };
})();