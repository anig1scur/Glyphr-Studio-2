import "./chunk-BUSYA2B4.js";

// node_modules/svg-to-bezier/dist/svg-to-bezier/tag-convert-circle-ellipse.js
function tagConvertCircleEllipse(tagData) {
  let bezierPath = [];
  let data = (tagData == null ? void 0 : tagData.attributes) || {};
  let rx, ry;
  let cx = Number(data.cx) || 0;
  let cy = Number(data.cy) || 0;
  if (tagData.name === "circle") {
    data.r = data.r || 0;
    rx = Number(data.r) || 0;
    ry = rx;
  } else if (tagData.name === "ellipse") {
    rx = Number(data.rx);
    ry = Number(data.ry);
    if (isNaN(rx) && !isNaN(ry)) rx = ry;
    if (isNaN(ry) && !isNaN(rx)) ry = rx;
    if (isNaN(rx)) rx = 0;
    if (isNaN(ry)) ry = 0;
  }
  let ellipseMaxes = {
    xMin: cx - rx,
    xMax: cx + rx,
    yMin: cy - ry,
    yMax: cy + ry
  };
  bezierPath = ovalPathFromMaxes(ellipseMaxes);
  return [bezierPath];
}
function ovalPathFromMaxes(maxes) {
  let lx = maxes.xMin;
  let ty = maxes.yMax;
  let rx = maxes.xMax;
  let by = maxes.yMin;
  let hw = (rx - lx) / 2;
  let hh = (ty - by) / 2;
  let hwd = hw * 0.448;
  let hhd = hh * 0.448;
  let Pt = { x: roundAndSanitize(lx + hw), y: roundAndSanitize(ty) };
  let H1t = { x: roundAndSanitize(lx + hwd), y: roundAndSanitize(ty) };
  let H2t = { x: roundAndSanitize(rx - hwd), y: roundAndSanitize(ty) };
  let Pr = { x: roundAndSanitize(rx), y: roundAndSanitize(by + hh) };
  let H1r = { x: roundAndSanitize(rx), y: roundAndSanitize(ty - hhd) };
  let H2r = { x: roundAndSanitize(rx), y: roundAndSanitize(by + hhd) };
  let Pb = { x: roundAndSanitize(lx + hw), y: roundAndSanitize(by) };
  let H1b = { x: roundAndSanitize(rx - hwd), y: roundAndSanitize(by) };
  let H2b = { x: roundAndSanitize(lx + hwd), y: roundAndSanitize(by) };
  let Pl = { x: roundAndSanitize(lx), y: roundAndSanitize(by + hh) };
  let H1l = { x: roundAndSanitize(lx), y: roundAndSanitize(by + hhd) };
  let H2l = { x: roundAndSanitize(lx), y: roundAndSanitize(ty - hhd) };
  let paths = [
    [Pt, H2t, H1r, Pr],
    [Pr, H2r, H1b, Pb],
    [Pb, H2b, H1l, Pl],
    [Pl, H2l, H1t, Pt]
  ];
  return paths;
}

// node_modules/svg-to-bezier/dist/svg-to-bezier/tag-convert-path-arc.js
function convertArcToCommandToBezier(startX, startY, radiusX, radiusY, rotationDegrees, largeArcFlag, sweepFlag, endX, endY, subPath) {
  let startPoint = { x: startX, y: startY };
  let endPoint = { x: endX, y: endY };
  if (startX === endX && startY === endY || !radiusX || !radiusY) {
    return [startPoint.x, startPoint.y, endPoint.x, endPoint.y, endPoint.x, endPoint.y];
  }
  let rotationRadians = rad(rotationDegrees);
  largeArcFlag = !!largeArcFlag;
  sweepFlag = !!sweepFlag;
  let center = {};
  let angleStart;
  let angleEnd;
  if (subPath) {
    angleStart = subPath[0];
    angleEnd = subPath[1];
    center = {
      x: subPath[2],
      y: subPath[3]
    };
  } else {
    startPoint = rotate(startPoint, rotationRadians * -1);
    endPoint = rotate(endPoint, rotationRadians * -1);
    let halfWidth = (startPoint.x - endPoint.x) / 2;
    let halfHeight = (startPoint.y - endPoint.y) / 2;
    let halfHeightSquared = halfHeight * halfHeight;
    let halfWidthSquared = halfWidth * halfWidth;
    let hyp = halfWidthSquared / (radiusX * radiusX) + halfHeightSquared / (radiusY * radiusY);
    if (hyp > 1) {
      hyp = Math.sqrt(hyp);
      radiusX *= hyp;
      radiusY *= hyp;
    }
    let radiusXSquared = radiusX * radiusX;
    let radiusYSquared = radiusY * radiusY;
    let sign = largeArcFlag === sweepFlag ? -1 : 1;
    sign *= Math.sqrt(
      Math.abs(
        (radiusXSquared * radiusYSquared - radiusXSquared * halfHeightSquared - radiusYSquared * halfWidthSquared) / (radiusXSquared * halfHeightSquared + radiusYSquared * halfWidthSquared)
      )
    );
    center.x = sign * radiusX * halfHeight / radiusY + (startPoint.x + endPoint.x) / 2;
    center.y = sign * -1 * radiusY * halfWidth / radiusX + (startPoint.y + endPoint.y) / 2;
    angleStart = Math.asin((startPoint.y - center.y) / radiusY);
    angleEnd = Math.asin((endPoint.y - center.y) / radiusY);
    angleStart = startPoint.x < center.x ? Math.PI - angleStart : angleStart;
    angleEnd = endPoint.x < center.x ? Math.PI - angleEnd : angleEnd;
    let twoPI = Math.PI * 2;
    if (angleStart < 0) angleStart = twoPI + angleStart;
    if (angleEnd < 0) angleEnd = twoPI + angleEnd;
    if (sweepFlag && angleStart > angleEnd) angleStart = angleStart - twoPI;
    if (!sweepFlag && angleEnd > angleStart) angleEnd = angleEnd - twoPI;
  }
  let angleDelta = angleEnd - angleStart;
  let result = [];
  let threshold = Math.PI * 120 / 180;
  if (Math.abs(angleDelta) > threshold) {
    let angleEndOld = angleEnd;
    let endPointXOld = endPoint.x;
    let endPointYOld = endPoint.y;
    angleEnd = angleStart + threshold * (sweepFlag && angleEnd > angleStart ? 1 : -1);
    endPoint.x = center.x + radiusX * Math.cos(angleEnd);
    endPoint.y = center.y + radiusY * Math.sin(angleEnd);
    result = convertArcToCommandToBezier(
      endPoint.x,
      endPoint.y,
      radiusX,
      radiusY,
      rotationDegrees,
      0,
      sweepFlag,
      endPointXOld,
      endPointYOld,
      [angleEnd, angleEndOld, center.x, center.y]
    );
  }
  let tempPointOne = {
    x: Math.cos(angleStart),
    y: Math.sin(angleStart)
  };
  let tempPointTwo = {
    x: Math.cos(angleEnd),
    y: Math.sin(angleEnd)
  };
  angleDelta = angleEnd - angleStart;
  let multiplier = Math.tan(angleDelta / 4) * 4 / 3;
  let p1 = { x: startPoint.x, y: startPoint.y };
  let p2 = {
    x: startPoint.x + radiusX * multiplier * tempPointOne.y,
    y: startPoint.y - radiusY * multiplier * tempPointOne.x
  };
  p2.x = 2 * p1.x - p2.x;
  p2.y = 2 * p1.y - p2.y;
  let p3 = {
    x: endPoint.x + radiusX * multiplier * tempPointTwo.y,
    y: endPoint.y - radiusY * multiplier * tempPointTwo.x
  };
  let p4 = { x: endPoint.x, y: endPoint.y };
  result = [p2.x, p2.y, p3.x, p3.y, p4.x, p4.y].concat(result);
  if (subPath) {
    return result;
  } else {
    let finalResult = [];
    for (let i = 0; i < result.length; i++) {
      if (i % 2) {
        finalResult[i] = rotate({ x: result[i - 1], y: result[i] }, rotationRadians).y;
      } else {
        finalResult[i] = rotate({ x: result[i], y: result[i + 1] }, rotationRadians).x;
      }
      finalResult[i] = roundAndSanitize(finalResult[i]);
    }
    return finalResult;
  }
}
function rad(deg) {
  return deg * (Math.PI / 180);
}
function rotate(point, deltaRad, about) {
  if (!point) return;
  if (deltaRad === 0) return point;
  about = about || {};
  about.x = about.x || 0;
  about.y = about.y || 0;
  const newPoint = { x: 0, y: 0 };
  newPoint.x = Math.cos(deltaRad) * (point.x - about.x) - Math.sin(deltaRad) * (point.y - about.y) + about.x;
  newPoint.y = Math.sin(deltaRad) * (point.x - about.x) + Math.cos(deltaRad) * (point.y - about.y) + about.y;
  return newPoint;
}

// node_modules/svg-to-bezier/dist/svg-to-bezier/tag-convert-path.js
function tagConvertPath(tagData = {}) {
  const dAttribute = tagData.attributes.d || "";
  if (dAttribute.length === 0 || dAttribute.length === 1) {
    return [];
  }
  let commands = chunkCommands(dAttribute);
  commands = convertToAbsolute(commands);
  commands = splitChainParameters(commands);
  commands = convertLineTo(commands);
  commands = convertSmoothBeziers(commands);
  commands = convertQuadraticBeziers(commands);
  commands = convertArcs(commands);
  const bezierPaths = convertCommandsToBezierPaths(commands);
  return bezierPaths;
}
function convertCommandsToBezierPaths(commands) {
  let bezierPaths = [];
  let currentPath = [];
  let currentX = 0;
  let currentY = 0;
  commands.forEach((command) => {
    const params = command.parameters || [];
    params.forEach((param, i) => params[i] = roundAndSanitize(param));
    if (command.type === "M") {
      currentX = params[0];
      currentY = params[1];
    }
    if (command.type === "L") {
      currentPath.push([
        { x: currentX, y: currentY },
        false,
        false,
        { x: params[0], y: params[1] }
      ]);
      currentX = params[0];
      currentY = params[1];
    }
    if (command.type === "C") {
      currentPath.push([
        { x: currentX, y: currentY },
        { x: params[0], y: params[1] },
        { x: params[2], y: params[3] },
        { x: params[4], y: params[5] }
      ]);
      currentX = params[4];
      currentY = params[5];
    }
    if (command.type === "Z") {
      if (currentPath[0] && currentPath[0][0]) {
        currentPath.push([
          { x: currentX, y: currentY },
          false,
          false,
          { x: currentPath[0][0].x, y: currentPath[0][0].y }
        ]);
        currentX = currentPath[0][0].x;
        currentY = currentPath[0][0].y;
      }
      bezierPaths.push(currentPath);
      currentPath = [];
    }
  });
  if (currentPath.length) bezierPaths.push(currentPath);
  return bezierPaths;
}
function chunkCommands(dAttribute) {
  let result = [];
  let commandStart = false;
  let data = sanitizeParameterData(dAttribute);
  for (let j = 0; j < data.length; j++) {
    if (isCommand(data.charAt(j))) {
      commandStart = j;
      break;
    }
  }
  if (commandStart === false) {
    return [{ type: "Z" }];
  }
  for (let i = commandStart + 1; i < data.length; i++) {
    if (isCommand(data.charAt(i))) {
      result.push({
        type: data.charAt(commandStart),
        parameters: chunkAndValidateParameters(data.substring(commandStart + 1, i))
      });
      commandStart = i;
    }
  }
  if (commandStart < data.length) {
    result.push({
      type: data.charAt(commandStart),
      parameters: chunkAndValidateParameters(data.substring(commandStart + 1, data.length))
    });
  }
  return result;
}
function convertToAbsolute(commands) {
  let result = [];
  let newCommand = {};
  let currentPoint = { x: 0, y: 0 };
  let newPoint = { x: 0, y: 0 };
  firstPoint = {};
  commands.forEach((command) => {
    if (command.type === "m" || command.type === "l") {
      newCommand = {
        type: command.type === "m" ? "M" : "L",
        parameters: []
      };
      for (let i = 0; i < command.parameters.length; i += 2) {
        newPoint.x = command.parameters[i + 0] + currentPoint.x;
        newPoint.y = command.parameters[i + 1] + currentPoint.y;
        newCommand.parameters.push(newPoint.x);
        newCommand.parameters.push(newPoint.y);
        currentPoint.x = newPoint.x;
        currentPoint.y = newPoint.y;
        if (command.type === "m") {
          setFirstPoint(newPoint);
        }
      }
      result.push(newCommand);
    } else if (command.type === "h") {
      newCommand = {
        type: "H",
        parameters: []
      };
      for (let i = 0; i < command.parameters.length; i++) {
        newPoint.x = command.parameters[i] + currentPoint.x;
        newCommand.parameters.push(newPoint.x);
        currentPoint.x = newPoint.x;
        setFirstPoint(newPoint);
      }
      result.push(newCommand);
    } else if (command.type === "v") {
      newCommand = {
        type: "V",
        parameters: []
      };
      for (let i = 0; i < command.parameters.length; i++) {
        newPoint.y = command.parameters[i] + currentPoint.y;
        newCommand.parameters.push(newPoint.y);
        currentPoint.y = newPoint.y;
        setFirstPoint(newPoint);
      }
      result.push(newCommand);
    } else if (command.type === "c") {
      newCommand = {
        type: "C",
        parameters: []
      };
      for (let i = 0; i < command.parameters.length; i += 6) {
        newCommand.parameters.push(command.parameters[i + 0] + currentPoint.x);
        newCommand.parameters.push(command.parameters[i + 1] + currentPoint.y);
        newCommand.parameters.push(command.parameters[i + 2] + currentPoint.x);
        newCommand.parameters.push(command.parameters[i + 3] + currentPoint.y);
        newPoint.x = command.parameters[i + 4] + currentPoint.x;
        newPoint.y = command.parameters[i + 5] + currentPoint.y;
        newCommand.parameters.push(newPoint.x);
        newCommand.parameters.push(newPoint.y);
        currentPoint.x = newPoint.x;
        currentPoint.y = newPoint.y;
        setFirstPoint(newPoint);
      }
      result.push(newCommand);
    } else if (command.type === "s") {
      newCommand = {
        type: "S",
        parameters: []
      };
      for (let i = 0; i < command.parameters.length; i += 4) {
        newCommand.parameters.push(command.parameters[i + 0] + currentPoint.x);
        newCommand.parameters.push(command.parameters[i + 1] + currentPoint.y);
        newPoint.x = command.parameters[i + 2] + currentPoint.x;
        newPoint.y = command.parameters[i + 3] + currentPoint.y;
        newCommand.parameters.push(newPoint.x);
        newCommand.parameters.push(newPoint.y);
        currentPoint.x = newPoint.x;
        currentPoint.y = newPoint.y;
        setFirstPoint(newPoint);
      }
      result.push(newCommand);
    } else if (command.type === "q") {
      newCommand = {
        type: "Q",
        parameters: []
      };
      for (let i = 0; i < command.parameters.length; i += 4) {
        newCommand.parameters.push(command.parameters[i + 0] + currentPoint.x);
        newCommand.parameters.push(command.parameters[i + 1] + currentPoint.y);
        newPoint.x = command.parameters[i + 2] + currentPoint.x;
        newPoint.y = command.parameters[i + 3] + currentPoint.y;
        newCommand.parameters.push(newPoint.x);
        newCommand.parameters.push(newPoint.y);
        currentPoint.x = newPoint.x;
        currentPoint.y = newPoint.y;
        setFirstPoint(newPoint);
      }
      result.push(newCommand);
    } else if (command.type === "t") {
      newCommand = {
        type: "T",
        parameters: []
      };
      for (let i = 0; i < command.parameters.length; i += 2) {
        newPoint.x = command.parameters[i + 0] + currentPoint.x;
        newPoint.y = command.parameters[i + 1] + currentPoint.y;
        newCommand.parameters.push(newPoint.x);
        newCommand.parameters.push(newPoint.y);
        currentPoint.x = newPoint.x;
        currentPoint.y = newPoint.y;
        setFirstPoint(newPoint);
      }
      result.push(newCommand);
    } else if (command.type === "a") {
      newCommand = {
        type: "A",
        parameters: []
      };
      for (let i = 0; i < command.parameters.length; i += 7) {
        newCommand.parameters.push(command.parameters[i + 0]);
        newCommand.parameters.push(command.parameters[i + 1]);
        newCommand.parameters.push(command.parameters[i + 2]);
        newCommand.parameters.push(command.parameters[i + 3]);
        newCommand.parameters.push(command.parameters[i + 4]);
        newPoint.x = command.parameters[i + 5] + currentPoint.x;
        newPoint.y = command.parameters[i + 6] + currentPoint.y;
        newCommand.parameters.push(newPoint.x);
        newCommand.parameters.push(newPoint.y);
        currentPoint.x = newPoint.x;
        currentPoint.y = newPoint.y;
        setFirstPoint(newPoint);
      }
      result.push(newCommand);
    } else if (command.type === "z" || command.type === "Z") {
      currentPoint = { x: firstPoint.x, y: firstPoint.y };
      firstPoint = false;
      result.push({ type: "Z" });
    } else {
      if (command.type === "M") {
        currentPoint.x = command.parameters[0];
        currentPoint.y = command.parameters[1];
      }
      result.push(command);
      setFirstPoint(currentPoint);
      currentPoint = getNewEndPoint(currentPoint, command);
    }
  });
  return result;
}
function splitChainParameters(commands) {
  let result = [];
  commands.forEach((command) => {
    if (command.type) {
      switch (command.type) {
        case "Z":
        case "z":
          result.push({ type: "Z" });
          break;
        case "H":
        case "V":
        case "h":
        case "v":
          for (let p = 0; p < command.parameters.length; p++) {
            result.push({
              type: command.type,
              parameters: [command.parameters[p]]
            });
          }
          break;
        case "M":
          for (let p = 0; p < command.parameters.length; p += 2) {
            result.push({
              type: p < 2 ? "M" : "L",
              parameters: [command.parameters[p], command.parameters[p + 1]]
            });
          }
          break;
        case "m":
          for (let p = 0; p < command.parameters.length; p += 2) {
            result.push({
              type: p < 2 ? "m" : "l",
              parameters: [command.parameters[p], command.parameters[p + 1]]
            });
          }
          break;
        case "L":
        case "T":
        case "l":
        case "t":
          for (let p = 0; p < command.parameters.length; p += 2) {
            result.push({
              type: command.type,
              parameters: [command.parameters[p], command.parameters[p + 1]]
            });
          }
          break;
        case "Q":
        case "S":
        case "q":
        case "s":
          for (let p = 0; p < command.parameters.length; p += 4) {
            result.push({
              type: command.type,
              parameters: [
                command.parameters[p],
                command.parameters[p + 1],
                command.parameters[p + 2],
                command.parameters[p + 3]
              ]
            });
          }
          break;
        case "C":
        case "c":
          for (let p = 0; p < command.parameters.length; p += 6) {
            result.push({
              type: command.type,
              parameters: [
                command.parameters[p],
                command.parameters[p + 1],
                command.parameters[p + 2],
                command.parameters[p + 3],
                command.parameters[p + 4],
                command.parameters[p + 5]
              ]
            });
          }
          break;
        case "A":
        case "a":
          for (let p = 0; p < command.parameters.length; p += 7) {
            result.push({
              type: command.type,
              parameters: [
                command.parameters[p],
                command.parameters[p + 1],
                command.parameters[p + 2],
                command.parameters[p + 3],
                command.parameters[p + 4],
                command.parameters[p + 5],
                command.parameters[p + 6]
              ]
            });
          }
          break;
      }
    }
  });
  return result;
}
function convertLineTo(commands) {
  let result = [];
  let currentPoint = { x: 0, y: 0 };
  commands.forEach((command) => {
    if (command.type === "H") {
      for (let p = 0; p < command.parameters.length; p++) {
        result.push({
          type: "L",
          parameters: [command.parameters[p], currentPoint.y]
        });
      }
    } else if (command.type === "V") {
      for (let p = 0; p < command.parameters.length; p++) {
        result.push({
          type: "L",
          parameters: [currentPoint.x, command.parameters[p]]
        });
      }
    } else {
      result.push(command);
    }
    currentPoint = getNewEndPoint(currentPoint, command);
  });
  return result;
}
function convertSmoothBeziers(commands) {
  let result = [];
  let currentPoint = { x: 0, y: 0 };
  let previousHandle = { x: 0, y: 0 };
  let smoothHandle = { x: 0, y: 0 };
  let previousResult;
  commands.forEach((command) => {
    if (command.type === "S" || command.type === "T") {
      previousResult = result.length > 1 ? result.at(-1) : false;
      if (previousResult && previousResult.type === "C") {
        previousHandle.x = previousResult.parameters[2];
        previousHandle.y = previousResult.parameters[3];
      } else if (previousResult && previousResult.type === "Q") {
        previousHandle.x = previousResult.parameters[0];
        previousHandle.y = previousResult.parameters[1];
      } else {
        previousHandle.x = currentPoint.x;
        previousHandle.y = currentPoint.y;
      }
      smoothHandle = {
        x: currentPoint.x - previousHandle.x + currentPoint.x,
        y: currentPoint.y - previousHandle.y + currentPoint.y
      };
      if (command.type === "S") {
        result.push({
          type: "C",
          parameters: [
            smoothHandle.x,
            smoothHandle.y,
            command.parameters[0],
            command.parameters[1],
            command.parameters[2],
            command.parameters[3]
          ]
        });
      } else if (command.type === "T") {
        result.push({
          type: "Q",
          parameters: [
            smoothHandle.x,
            smoothHandle.y,
            command.parameters[0],
            command.parameters[1]
          ]
        });
      }
    } else {
      result.push(command);
    }
    currentPoint = getNewEndPoint(currentPoint, command);
  });
  return result;
}
function convertQuadraticBeziers(commands) {
  let result = [];
  let currentPoint = { x: 0, y: 0 };
  let q0x;
  let q0y;
  let q1x;
  let q1y;
  let q2x;
  let q2y;
  let c1x;
  let c1y;
  let c2x;
  let c2y;
  commands.forEach((command) => {
    if (command.type === "Q") {
      q0x = currentPoint.x;
      q0y = currentPoint.y;
      q1x = command.parameters[0];
      q1y = command.parameters[1];
      q2x = command.parameters[2];
      q2y = command.parameters[3];
      c1x = q0x + 2 / 3 * (q1x - q0x);
      c1y = q0y + 2 / 3 * (q1y - q0y);
      c2x = q2x + 2 / 3 * (q1x - q2x);
      c2y = q2y + 2 / 3 * (q1y - q2y);
      result.push({ type: "C", parameters: [c1x, c1y, c2x, c2y, q2x, q2y] });
    } else {
      result.push(command);
    }
    currentPoint = getNewEndPoint(currentPoint, command);
  });
  return result;
}
function convertArcs(commands) {
  let result = [];
  let convertedBeziers = [];
  let currentPoint = { x: 0, y: 0 };
  commands.forEach((command) => {
    if (command.type === "A") {
      for (let p = 0; p < command.parameters.length; p += 7) {
        convertedBeziers = convertArcToCommandToBezier(
          currentPoint.x,
          currentPoint.y,
          command.parameters[p + 0],
          command.parameters[p + 1],
          command.parameters[p + 2],
          command.parameters[p + 3],
          command.parameters[p + 4],
          command.parameters[p + 5],
          command.parameters[p + 6],
          false
        );
        for (let i = 0; i < convertedBeziers.length; i += 6) {
          result.push({
            type: "C",
            parameters: [
              convertedBeziers[i + 0],
              convertedBeziers[i + 1],
              convertedBeziers[i + 2],
              convertedBeziers[i + 3],
              convertedBeziers[i + 4],
              convertedBeziers[i + 5]
            ]
          });
        }
        currentPoint = {
          x: convertedBeziers.at(-2),
          y: convertedBeziers.at(-1)
        };
      }
    } else {
      result.push(command);
      currentPoint = getNewEndPoint(currentPoint, command);
    }
  });
  return result;
}
var firstPoint = {};
function setFirstPoint(point) {
  if (!firstPoint.hasOwnProperty("x") && !firstPoint.hasOwnProperty("y")) {
    firstPoint = {
      x: point.x,
      y: point.y
    };
  }
}
function getNewEndPoint(currentPoint, command) {
  let returnPoint = {
    x: currentPoint.x || 0,
    y: currentPoint.y || 0
  };
  switch (command.type) {
    case "Z":
    case "z":
      break;
    case "H":
      returnPoint.x = command.parameters.at(-1);
      break;
    case "V":
      returnPoint.y = command.parameters.at(-1);
      break;
    case "M":
    case "L":
    case "C":
    case "S":
    case "A":
    case "Q":
    case "T":
      returnPoint.x = command.parameters.at(-2);
      returnPoint.y = command.parameters.at(-1);
      break;
    case "h":
      for (let p = 0; p < command.parameters.length; p++) {
        returnPoint.x += command.parameters[p];
      }
      break;
    case "v":
      for (let p = 0; p < command.parameters.length; p++) {
        returnPoint.y += command.parameters[p];
      }
      break;
    case "m":
    case "l":
    case "t":
      for (let p = 0; p < command.parameters.length; p += 2) {
        returnPoint.x += command.parameters[p + 0];
        returnPoint.y += command.parameters[p + 1];
      }
      break;
    case "q":
    case "s":
      for (let p = 0; p < command.parameters.length; p += 4) {
        returnPoint.x += command.parameters[p + 2];
        returnPoint.y += command.parameters[p + 3];
      }
      break;
    case "c":
      for (let p = 0; p < command.parameters.length; p += 6) {
        returnPoint.x += command.parameters[p + 4];
        returnPoint.y += command.parameters[p + 5];
      }
      break;
    case "a":
      for (let p = 0; p < command.parameters.length; p += 7) {
        returnPoint.x += command.parameters[p + 5];
        returnPoint.y += command.parameters[p + 6];
      }
      break;
  }
  return returnPoint;
}
function isCommand(c) {
  if ("MmLlCcSsZzHhVvAaQqTt".indexOf(c) > -1) return true;
  return false;
}

// node_modules/svg-to-bezier/dist/svg-to-bezier/tag-convert-polygon-polyline.js
function tagConvertPolygonPolyline(tagData) {
  var _a;
  let bezierPath = [];
  let initialData = (_a = tagData == null ? void 0 : tagData.attributes) == null ? void 0 : _a.points;
  initialData = sanitizeParameterData(initialData);
  let data = chunkAndValidateParameters(initialData);
  let firstX = Number(data[0]) || 0;
  let firstY = Number(data[1]) || 0;
  let previousX = Number(data[0]) || 0;
  let previousY = Number(data[1]) || 0;
  if (data.length > 4) {
    for (let i = 0; i < data.length; i += 2) {
      let px = Number(data[i]) || 0;
      let py = Number(data[i + 1]) || 0;
      bezierPath.push([
        { x: roundAndSanitize(previousX), y: roundAndSanitize(previousY) },
        false,
        false,
        { x: roundAndSanitize(px), y: roundAndSanitize(py) }
      ]);
      previousX = px;
      previousY = py;
    }
  }
  if (tagData.name === "polygon" && data.length > 2) {
    bezierPath.push([
      { x: roundAndSanitize(previousX), y: roundAndSanitize(previousY) },
      false,
      false,
      { x: roundAndSanitize(firstX), y: roundAndSanitize(firstY) }
    ]);
  }
  return [bezierPath];
}

// node_modules/svg-to-bezier/dist/svg-to-bezier/tag-convert-rect.js
function tagConvertRect(tagData) {
  let data = tagData.attributes || {};
  let x = roundAndSanitize(data.x) || 0;
  let y = roundAndSanitize(data.y) || 0;
  let w = roundAndSanitize(data.width) || 0;
  let h = roundAndSanitize(data.height) || 0;
  let right = x + w;
  let bottom = y + h;
  let upperLeft = { x, y };
  let upperRight = { x: right, y };
  let lowerRight = { x: right, y: bottom };
  let lowerLeft = { x, y: bottom };
  let bezierPath = [];
  if (data.rx || data.ry) {
    let rx = Number(data.rx);
    let ry = Number(data.ry);
    if (isNaN(rx) && !isNaN(ry)) rx = ry;
    if (isNaN(ry) && !isNaN(rx)) ry = rx;
    if (isNaN(rx)) rx = 0;
    if (isNaN(ry)) ry = 0;
    if (rx > w / 2) rx = w / 2;
    if (ry > h / 2) ry = h / 2;
    let handleWidth = rx * 0.448;
    let handleHeight = ry * 0.448;
    let leftXCurveStart = roundAndSanitize(x + rx);
    let rightXCurveStart = roundAndSanitize(right - rx);
    let topYCurveStart = roundAndSanitize(y + ry);
    let bottomYCurveStart = roundAndSanitize(bottom - ry);
    let leftXHandle = roundAndSanitize(x + handleWidth);
    let rightXHandle = roundAndSanitize(right - handleWidth);
    let topYHandle = roundAndSanitize(y + handleHeight);
    let bottomYHandle = roundAndSanitize(bottom - handleHeight);
    bezierPath = [
      [{ x: leftXCurveStart, y }, false, false, { x: rightXCurveStart, y }],
      [
        { x: rightXCurveStart, y },
        { x: rightXHandle, y },
        { x: right, y: topYHandle },
        { x: right, y: topYCurveStart }
      ],
      [{ x: right, y: topYCurveStart }, false, false, { x: right, y: bottomYCurveStart }],
      [
        { x: right, y: bottomYCurveStart },
        { x: right, y: bottomYHandle },
        { x: rightXHandle, y: bottom },
        { x: rightXCurveStart, y: bottom }
      ],
      [{ x: rightXCurveStart, y: bottom }, false, false, { x: leftXCurveStart, y: bottom }],
      [
        { x: leftXCurveStart, y: bottom },
        { x: leftXHandle, y: bottom },
        { x, y: bottomYHandle },
        { x, y: bottomYCurveStart }
      ],
      [{ x, y: bottomYCurveStart }, false, false, { x, y: topYCurveStart }],
      [
        { x, y: topYCurveStart },
        { x, y: topYHandle },
        { x: leftXHandle, y },
        { x: leftXCurveStart, y }
      ]
    ];
  } else {
    bezierPath = [
      [upperLeft, false, false, upperRight],
      [upperRight, false, false, lowerRight],
      [lowerRight, false, false, lowerLeft],
      [lowerLeft, false, false, upperLeft]
    ];
  }
  return [bezierPath];
}

// node_modules/svg-to-bezier/dist/svg-to-bezier/transforms.js
function getTransformData(tag) {
  var _a;
  if (!tag || !(tag == null ? void 0 : tag.attributes)) return [];
  const supported = ["matrix", "translate", "scale", "rotate", "skewx", "skewy"];
  let transforms = [];
  let temp;
  let validatedArgs;
  if ((_a = tag.attributes) == null ? void 0 : _a.transform) {
    temp = tag.attributes.transform.replaceAll(",", " ");
    temp = temp.replaceAll("  ", " ");
    temp = temp.toLowerCase();
    temp = temp.split(")");
    temp.forEach((value) => {
      let data = value.split("(");
      if (data.length === 2) {
        data[0] = data[0].trim();
        data[1] = data[1].trim();
        if (supported.indexOf(data[0]) > -1) {
          validatedArgs = data[1].split(" ");
          validatedArgs = validatedArgs.map((arg) => Number(arg));
          transforms.push({
            name: data[0],
            args: validatedArgs
          });
        }
      }
    });
  }
  if (tag.attributes["transform-origin"]) {
    temp = tag.attributes["transform-origin"];
    temp = temp.replaceAll(",", " ");
    temp = temp.replaceAll("  ", " ");
    validatedArgs = temp.split(" ");
    validatedArgs = validatedArgs.map((arg) => Number(arg));
    transforms.push({
      name: "origin",
      args: validatedArgs
    });
  }
  return transforms;
}
function applyTransformData(bezierPaths = [], transformData = []) {
  const resultBezierPaths = structuredClone(bezierPaths);
  let orderedTransforms = transformData.reverse();
  let originData = [0, 0];
  for (let t = 0; t < orderedTransforms.length; t++) {
    if (orderedTransforms[t].name === "origin") {
      originData = orderedTransforms.splice(t, 1);
      originData = originData[0].args;
      break;
    }
  }
  orderedTransforms.forEach((oneTransform) => {
    if (transformCurve[oneTransform.name]) {
      const transformFn = transformCurve[oneTransform.name];
      resultBezierPaths.forEach((singlePath, pathIndex) => {
        singlePath.forEach((singleCurve, curveIndex) => {
          const resultCurve = transformFn(singleCurve, oneTransform.args, originData);
          resultBezierPaths[pathIndex][curveIndex] = resultCurve;
        });
      });
    }
  });
  return resultBezierPaths;
}
var transformCurve = {
  matrix: matrixTransformCurve,
  translate: translateTransformCurve,
  scale: scaleTransformCurve,
  rotate: rotateTransformCurve,
  skewx: skewxTransformCurve,
  skewy: skewyTransformCurve
};
function matrixTransformCurve(curve = [], args = [], origin = []) {
  const resultCurve = [];
  const defaults = [1, 0, 0, 1, 0, 0];
  while (args.length < 6) {
    args.push(defaults[args.length]);
  }
  let originX = origin[0] || 0;
  let originY = origin[1] || 0;
  function calculateNewPoint(oldPoint) {
    if (oldPoint === false) return false;
    const newPoint = { x: 0, y: 0 };
    const translatedX = oldPoint.x - originX;
    const translatedY = oldPoint.y - originY;
    const transformedX = args[0] * translatedX + args[2] * translatedY + args[4];
    const transformedY = args[1] * translatedX + args[3] * translatedY + args[5];
    newPoint.x = roundAndSanitize(transformedX + originX);
    newPoint.y = roundAndSanitize(transformedY + originY);
    return newPoint;
  }
  resultCurve[0] = calculateNewPoint(curve[0]);
  resultCurve[1] = calculateNewPoint(curve[1]);
  resultCurve[2] = calculateNewPoint(curve[2]);
  resultCurve[3] = calculateNewPoint(curve[3]);
  return resultCurve;
}
function translateTransformCurve(curve = [], args = []) {
  const resultCurve = [];
  let dx = args[0] || 0;
  let dy = args[1] || 0;
  function calculateNewPoint(oldPoint) {
    if (oldPoint === false) return false;
    const newPoint = { x: 0, y: 0 };
    newPoint.x = roundAndSanitize(oldPoint.x + dx);
    newPoint.y = roundAndSanitize(oldPoint.y + dy);
    return newPoint;
  }
  resultCurve[0] = calculateNewPoint(curve[0]);
  resultCurve[1] = calculateNewPoint(curve[1]);
  resultCurve[2] = calculateNewPoint(curve[2]);
  resultCurve[3] = calculateNewPoint(curve[3]);
  return resultCurve;
}
function scaleTransformCurve(curve = [], args = [], origin = []) {
  const scaleX = args[0];
  let scaleY = args[1];
  if (!scaleY) scaleY = scaleX;
  const resultCurve = [];
  let originX = origin[0] || 0;
  let originY = origin[1] || 0;
  function calculateNewPoint(oldPoint) {
    if (oldPoint === false) return false;
    const newPoint = { x: 0, y: 0 };
    newPoint.x = roundAndSanitize((oldPoint.x - originX) * scaleX + originX);
    newPoint.y = roundAndSanitize((oldPoint.y - originY) * scaleY + originY);
    return newPoint;
  }
  resultCurve[0] = calculateNewPoint(curve[0]);
  resultCurve[1] = calculateNewPoint(curve[1]);
  resultCurve[2] = calculateNewPoint(curve[2]);
  resultCurve[3] = calculateNewPoint(curve[3]);
  return resultCurve;
}
function rotateTransformCurve(curve = [], args = [], origin = []) {
  const angle = angleToRadians(args[0]);
  const about = { x: 0, y: 0 };
  if (!args[1]) args[1] = 0;
  if (!args[2]) args[2] = 0;
  about.x = args[1] + origin[0];
  about.y = args[2] + origin[1];
  const resultCurve = [];
  function calculateNewPoint(point) {
    if (!point) return false;
    const newPoint = { x: 0, y: 0 };
    newPoint.x = roundAndSanitize(
      Math.cos(angle) * (point.x - about.x) - Math.sin(angle) * (point.y - about.y) + about.x
    );
    newPoint.y = roundAndSanitize(
      Math.sin(angle) * (point.x - about.x) + Math.cos(angle) * (point.y - about.y) + about.y
    );
    return newPoint;
  }
  resultCurve[0] = calculateNewPoint(curve[0]);
  resultCurve[1] = calculateNewPoint(curve[1]);
  resultCurve[2] = calculateNewPoint(curve[2]);
  resultCurve[3] = calculateNewPoint(curve[3]);
  return resultCurve;
}
function skewxTransformCurve(curve = [], args = [], origin = []) {
  const resultCurve = [];
  const radians = angleToRadians(args[0]);
  const yMultiplier = Math.tan(radians);
  let originX = origin[0] || 0;
  let originY = origin[1] || 0;
  function calculateNewPoint(oldPoint) {
    if (!oldPoint) return false;
    const oldX = oldPoint.x;
    const oldY = oldPoint.y;
    const newPoint = { x: 0, y: 0 };
    newPoint.x = roundAndSanitize(
      oldPoint.x - originX + yMultiplier * (oldPoint.y - originY) + originX
    );
    newPoint.y = roundAndSanitize(oldY);
    return newPoint;
  }
  resultCurve[0] = calculateNewPoint(curve[0]);
  resultCurve[1] = calculateNewPoint(curve[1]);
  resultCurve[2] = calculateNewPoint(curve[2]);
  resultCurve[3] = calculateNewPoint(curve[3]);
  return resultCurve;
}
function skewyTransformCurve(curve = [], args = [], origin = []) {
  const resultCurve = [];
  const radians = angleToRadians(args[0]);
  const xMultiplier = Math.tan(radians);
  let originX = origin[0] || 0;
  let originY = origin[1] || 0;
  function calculateNewPoint(oldPoint) {
    if (!oldPoint) return false;
    const newPoint = { x: 0, y: 0 };
    newPoint.x = roundAndSanitize(oldPoint.x);
    newPoint.y = roundAndSanitize(
      oldPoint.y - originY + xMultiplier * (oldPoint.x - originX) + originY
    );
    return newPoint;
  }
  resultCurve[0] = calculateNewPoint(curve[0]);
  resultCurve[1] = calculateNewPoint(curve[1]);
  resultCurve[2] = calculateNewPoint(curve[2]);
  resultCurve[3] = calculateNewPoint(curve[3]);
  return resultCurve;
}
function angleToRadians(angle) {
  let result = Math.PI / 180 * parseFloat(angle);
  return result;
}

// node_modules/svg-to-bezier/dist/svg-to-bezier/xml-to-json.js
function XMLtoJSON(inputXML) {
  let xmlDoc;
  let xmlError;
  if (typeof window.DOMParser !== "undefined") {
    xmlDoc = new window.DOMParser().parseFromString(inputXML, "text/xml");
  } else if (typeof window.ActiveXObject !== "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
    xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = "false";
    xmlDoc.loadXML(inputXML);
  } else {
    console.warn("No XML document parser found.");
    xmlError = new SyntaxError("No XML document parser found.");
    throw xmlError;
  }
  const error = xmlDoc.getElementsByTagName("parserError");
  if (error.length) {
    const message = xmlDoc.getElementsByTagName("div")[0].innerHTML;
    xmlError = new SyntaxError(trim(message));
    throw xmlError;
  }
  const result = {
    name: xmlDoc.documentElement.nodeName,
    attributes: tag_getAttributes(xmlDoc.documentElement.attributes),
    content: tag_getContent(xmlDoc.documentElement)
  };
  return result;
}
function tag_getContent(parent) {
  const kids = parent.childNodes;
  if (kids.length === 0) return trim(parent.nodeValue);
  const result = [];
  let tagResult;
  let tagContent;
  let tagAttributes;
  for (const node of kids) {
    tagResult = {};
    if (node.nodeName === "#comment") continue;
    tagContent = tag_getContent(node);
    tagAttributes = tag_getAttributes(node.attributes);
    if (node.nodeName === "#text" && JSON.stringify(tagAttributes) === "{}") {
      tagResult = trim(tagContent);
    } else {
      tagResult.name = node.nodeName;
      tagResult.attributes = tagAttributes;
      tagResult.content = tagContent;
    }
    if (tagResult !== "") result.push(tagResult);
  }
  return result;
}
function tag_getAttributes(attributes) {
  if (!attributes || !attributes.length) return {};
  const result = {};
  for (const attribute of attributes) {
    result[attribute.name] = trim(attribute.value);
  }
  return result;
}
function trim(text) {
  try {
    text = text.replace(/^\s+|\s+$/g, "");
    return text.replace(/(\r\n|\n|\r|\t)/gm, "");
  } catch (e) {
    return "";
  }
}

// node_modules/svg-to-bezier/dist/svg-to-bezier/svg-to-bezier.js
var enableConsoleLogging = false;
var roundToDecimalPrecision = false;
function SVGtoBezier(inputSVG) {
  let svgDocumentData = XMLtoJSON(inputSVG);
  let bezierPaths = convertTags(svgDocumentData, svgDocumentData);
  return bezierPaths;
}
function convertTags(tagData, svgDocumentData) {
  if (!(tagData == null ? void 0 : tagData.content)) return [];
  let resultBezierPaths = [];
  tagData.content.forEach((tag) => {
    let name = tag.name.toLowerCase();
    if (name === "use") {
      let id = tag.attributes["href"] || tag.attributes["xlink:href"];
      if (id) {
        tag.name = "g";
        name = "g";
        if (id.charAt(0) === "#") id = id.substring(1);
        tag.content = getCopyOfTagByID(id, svgDocumentData);
        if (!tag.attributes.transform) tag.attributes.transform = "";
        tag.attributes.transform += `translate(${tag.attributes.x || 0}, ${tag.attributes.y || 0})`;
      }
    }
    const tagTransforms = getTransformData(tag);
    if (convert[name]) {
      let bezierPaths;
      if (name === "g") bezierPaths = convertTags(tag, svgDocumentData);
      else bezierPaths = convert[name](tag);
      if (tagTransforms) {
        bezierPaths = applyTransformData(bezierPaths, tagTransforms);
      }
      resultBezierPaths = resultBezierPaths.concat(bezierPaths);
    }
  });
  return resultBezierPaths;
}
var convert = {
  circle: tagConvertCircleEllipse,
  ellipse: tagConvertCircleEllipse,
  path: tagConvertPath,
  glyph: tagConvertPath,
  polygon: tagConvertPolygonPolyline,
  polyline: tagConvertPolygonPolyline,
  rect: tagConvertRect,
  g: convertTags
};
function sanitizeParameterData(data) {
  data = data.replace(/\s+/g, ",");
  data = data.replace(/e/gi, "e");
  data = data.replace(/e-/g, "~~~");
  data = data.replace(/-/g, ",-");
  data = data.replace(/~~~/g, "e-");
  data = data.replace(/e\+/g, "~~~");
  data = data.replace(/\+/g, ",");
  data = data.replace(/~~~/g, "e+");
  data = data.replace(/,+/g, ",");
  return data;
}
function chunkAndValidateParameters(data = "") {
  let validatedParameters = [];
  if (data.charAt(0) === ",") {
    data = data.substring(1);
  }
  if (data.charAt(data.length - 1) === ",") {
    data = data.substring(0, data.length - 1);
  }
  if (data.length > 0) {
    data = data.split(",");
    data.forEach((param) => {
      param = param.split(".");
      if (param.length === 1) validatedParameters.push(Number(param[0]));
      else if (param.length === 2) validatedParameters.push(Number(param.join(".")));
      else if (param.length > 2) {
        validatedParameters.push(Number(`${param[0]}.${param[1]}`));
        for (let p = 2; p < param.length; p++) {
          validatedParameters.push(Number(`0.${param[p]}`));
        }
      }
    });
  }
  return validatedParameters;
}
function getCopyOfTagByID(id, rootNode) {
  var _a;
  let result = [];
  if (((_a = rootNode.attributes) == null ? void 0 : _a.id) === id) {
    result = [rootNode];
  } else if (rootNode.content) {
    for (let i = 0; i < rootNode.content.length; i++) {
      const childNode = rootNode.content[i];
      const childResult = getCopyOfTagByID(id, childNode);
      if (Array.isArray(childResult) && childResult.length > 0) {
        result = childResult;
        break;
      }
    }
  }
  return result;
}
function roundAndSanitize(num) {
  num = floatSanitize(num);
  num = round(num, roundToDecimalPrecision);
  return num;
}
function round(num, dec = false) {
  if (!num) return 0;
  if (dec === false) return parseFloat(num);
  num = parseFloat(num);
  return Number(Math.round(`${num}e${dec}`) + `e-${dec}`) || 0;
}
function floatSanitize(num) {
  const stringNum = String(num);
  if (stringNum.indexOf("00000") > -1 || stringNum.indexOf("99999") > -1) {
    num = round(num, 5);
  }
  return num;
}
function log(message) {
  if (enableConsoleLogging) console.log(message);
}
export {
  SVGtoBezier,
  chunkAndValidateParameters,
  enableConsoleLogging,
  floatSanitize,
  getCopyOfTagByID,
  log,
  round,
  roundAndSanitize,
  roundToDecimalPrecision,
  sanitizeParameterData
};
//# sourceMappingURL=svg-to-bezier.js.map
