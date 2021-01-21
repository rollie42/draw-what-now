exports.lineDistance = (x1, y1, x2, y2) => {
  // calculate euclidean distance between (x1, y1) and (x2, y2)
  const xs = Math.pow(x2 - x1, 2);
  const ys = Math.pow(y2 - y1, 2);
  return Math.sqrt(xs + ys);
};

exports.hexToRgb = (hexColor) => {
  var c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hexColor)) {
    c = hexColor.substring(1).split('');
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',1)';
  }
  return hexColor

  // Since input type color provides hex and ImageData accepts RGB need to transform
  const m = hexColor.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  return [
    parseInt(m[1], 16),
    parseInt(m[2], 16),
    parseInt(m[3], 16)
  ];
};

exports.matchColor = (data, compR, compG, compB, compA) => (pixelPos) => {
  // Pixel color equals comp color?
  const r = data[pixelPos];
  const g = data[pixelPos + 1];
  const b = data[pixelPos + 2];
  const a = data[pixelPos + 3];

  return (r === compR && g === compG && b === compB && a === compA);
};

exports.colorPixel = (data, fillR, fillG, fillB, alpha, startColor) => {
  const matcher = exports.matchColor(data, ...startColor);

  return (pixelPos) => {
    // Update fill color in matrix
    data[pixelPos] = fillR;
    data[pixelPos + 1] = fillG;
    data[pixelPos + 2] = fillB;
    data[pixelPos + 3] = alpha;

    if (!matcher(pixelPos + 4)) {
      data[pixelPos + 4] = data[pixelPos + 4] * 0.01 + fillR * 0.99;
      data[pixelPos + 4 + 1] = data[pixelPos + 4 + 1] * 0.01 + fillG * 0.99;
      data[pixelPos + 4 + 2] = data[pixelPos + 4 + 2] * 0.01 + fillB * 0.99;
      data[pixelPos + 4 + 3] = data[pixelPos + 4 + 3] * 0.01 + alpha * 0.99;
    }

    if (!matcher(pixelPos - 4)) {
      data[pixelPos - 4] = data[pixelPos - 4] * 0.01 + fillR * 0.99;
      data[pixelPos - 4 + 1] = data[pixelPos - 4 + 1] * 0.01 + fillG * 0.99;
      data[pixelPos - 4 + 2] = data[pixelPos - 4 + 2] * 0.01 + fillB * 0.99;
      data[pixelPos - 4 + 3] = data[pixelPos - 4 + 3] * 0.01 + alpha * 0.99;
    }
  };
};
