// points.push({ ...endPoint, curve: true })

// const dx = endPoint.x - prevPoint.x
// const dy = endPoint.y - prevPoint.y
// var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

// const smoothingFactor = Math.min(Constants.minSmoothingFactor, Constants.initialSmoothingFactor + (dist - 60) / 3000);

// // processed coordinates
// const procX = endPoint.x - dx * smoothingFactor
// const procY = endPoint.y - dy * smoothingFactor

// //path.quadraticCurveTo(prevPoint.x, prevPoint.y, procX, procY)
// var x_mid = (prevPoint.x + endPoint.x) / 2
// var y_mid = (prevPoint.y + endPoint.y) / 2

// var cp_x1 = (x_mid + prevPoint.x) / 2
// var cp_x2 = (x_mid + endPoint.x) / 2
// // path.quadraticCurveTo(cp_x1, prevPoint.y, x_mid, y_mid)
// // path.quadraticCurveTo(cp_x2, endPoint.y, endPoint.x, endPoint.y)
// //path.quadraticCurveTo(endPoint.x, endPoint.y, endPoint.x, endPoint.y)

// console.log(cp_x1, prevPoint.y, x_mid, y_mid)
// console.log(cp_x2, endPoint.y, endPoint.x, endPoint.y)

// if (i >= -1) {

//     var p0 = (i > 0) ? points[i - 1] : points[0];
//     var p1 = points[i];
//     var p2 = points[i + 1];
//     var p3 = (i != points.length - 2) ? points[i + 2] : p2;

//     var cp1x = p1.x + (p2.x - p0.x) / 6 * t;
//     var cp1y = p1.y + (p2.y - p0.y) / 6 * t;

//     var cp2x = p2.x - (p3.x - p1.x) / 6 * t;
//     var cp2y = p2.y - (p3.y - p1.y) / 6 * t;

//     path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
// }
// context.stroke(path);
// //draw.draw(context, points)
// prevPoint = endPoint
// i++
// })