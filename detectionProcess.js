// Contours Info
function getHierarchy(hierarchy) {
  let hierarchyArr = [];
  let start = 0;
  let end = 4;
  let row = hierarchy.data32S.length / end;
  for (let i = 0; i < row; i++) {
    hierarchyArr[i] = [];
    for (let k = 0; k < 4; k++) {
      hierarchyArr[i][k] = hierarchy.data32S[start];
      start++;
    }
    start = end;
    end = end + 4;
  }
  return hierarchyArr;
}
// 極角排序
function getSortedPoint(point, contours) {
  // 輪廓中心
  const M = cv.moments(contours, false);
  const center = {
    x: M.m10 / M.m00,
    y: M.m01 / M.m00,
  };
  // 計算輪廓每個點的角度
  point = point.map(({ x, y }) => {
    return {
      x,
      y,
      angle: (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI,
    };
  });
  // 依照角度順時針排序輪廓的每個點
  point = point.sort((a, b) => a.angle - b.angle);
  return { point: point, center: center };
}

// rotate opencv mat(image data) object
function rotateImage(dst, degree) {
  switch (degree) {
    case 0:
      // 不用做任何處理
      break;
    case 90:
      cv.rotate(dst, dst, cv.ROTATE_90_CLOCKWISE);
      break;
    case 180:
      cv.rotate(dst, dst, cv.ROTATE_180);
      break;
    case 270:
      cv.rotate(dst, dst, cv.ROTATE_90_COUNTERCLOCKWISE);
      break;
    default:
      // 不用做任何處理
      break;
  }
}

/**
 * @param {*cvMat} drawDst cvMat
 * @param {*array} points points array
 * @param {*object} option draw style
 */
function drawSingleBound(drawDst, points, option) {
  if (!option) {
    option = {
      lineColor: new cv.Scalar(0, 64, 255, 255),
      lineWidth: 4,
    };
  }
  const lineColor = option.lineColor
    ? option.lineColor
    : new cv.Scalar(0, 128, 255, 255);
  const lineWidth = option.lineWidth ? option.lineWidth : 4;

  //畫矩形
  const point1 = new cv.Point(points[0]["x"], points[0]["y"]);
  const point2 = new cv.Point(points[1]["x"], points[1]["y"]);
  const point3 = new cv.Point(points[2]["x"], points[2]["y"]);
  const point4 = new cv.Point(points[3]["x"], points[3]["y"]);
  cv.line(drawDst, point1, point2, lineColor, lineWidth, cv.LINE_AA, 0);
  cv.line(drawDst, point1, point4, lineColor, lineWidth, cv.LINE_AA, 0);
  cv.line(drawDst, point3, point2, lineColor, lineWidth, cv.LINE_AA, 0);
  cv.line(drawDst, point3, point4, lineColor, lineWidth, cv.LINE_AA, 0);
}

function detectionDocumentBound(sourceDst) {
  let srcDst = sourceDst.clone();
  let calcDst = new cv.Mat();
  let dstWidth = srcDst.cols;
  let dstHeight = srcDst.rows;
  let borderRect = { x: 0, y: 0, width: dstWidth, height: dstHeight }; // 最小外接矩形
  let BoundInfo = {
    success: false,
    bigRectBound: borderRect,
    bigRectPoint: {
      // 矩形的四個頂點和中心
      point: [
        { x: 0, y: 0 },
        { x: dstWidth, y: 0 },
        { x: dstWidth, y: dstHeight },
        { x: 0, y: dstHeight },
      ],
      center: {
        x: dstWidth / 2,
        y: dstHeight / 2,
      },
    },
    naturalWidth: dstWidth, // 原始圖寬度
    naturalHeight: dstHeight, // 原始圖高度
  };
  // 灰度化
  cv.cvtColor(srcDst, calcDst, cv.COLOR_RGBA2GRAY);
  // 高斯模糊
  let ksize = new cv.Size(3, 3);
  cv.GaussianBlur(calcDst, calcDst, ksize, 0, 0, cv.BORDER_DEFAULT);
  // 繪製邊框
  let borderSxSy = new cv.Point(borderRect.x, borderRect.y);
  let borderDxDy = new cv.Point(borderRect.width, borderRect.height);
  cv.rectangle(
    calcDst,
    borderSxSy,
    borderDxDy,
    new cv.Scalar(0, 0, 0, 255),
    6,
    cv.LINE_AA,
    0
  );
  // Canny邊緣檢測算子
  cv.Canny(calcDst, calcDst, 30, 150, 3, false);
  // 膨脹白色線條
  let erodeKernelSize = new cv.Size(2, 2);
  let kernel = cv.getStructuringElement(cv.MORPH_RECT, erodeKernelSize);
  cv.dilate(calcDst, calcDst, kernel);
  // 輪廓查找
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(
    calcDst,
    contours,
    hierarchy,
    cv.RETR_CCOMP,
    cv.CHAIN_APPROX_SIMPLE
  );

  const handleBoundInfo = function () {
    // 範圍最大的矩形(文件)條件
    let bigBoundArea = 0;
    for (let contourIdx = 0; contourIdx < contours.size(); contourIdx++) {
      const contour = contours.get(contourIdx);
      const approx = new cv.Mat();
      const perimeter = 0.01 * cv.arcLength(contour, true);
      cv.approxPolyDP(contour, approx, perimeter, true);
      const boundFilter = () => {
        const area = cv.contourArea(contour, false);
        if (area > 3000) {
          // 面積大於3000的輪廓
          let boundRect = cv.boundingRect(contour); // 最小外接矩形(輪廓)的範圍
          let boundPoint = []; // 矩形(輪廓)的四個頂點
          for (let i = 0; i < approx.data32S.length; i += 2) {
            let cnt = [];
            cnt["x"] = approx.data32S[i];
            cnt["y"] = approx.data32S[i + 1];
            boundPoint.push(cnt);
            cnt = [];
          }
          // 輪廓頂點順時針排序
          boundPoint = getSortedPoint(boundPoint, contour);
          // 邊界高度過濾條件 boundWidth < 10 and boundWidth > borderWidth - 10
          let widthFilter = !(
            boundRect.x <= 10 && boundRect.width >= borderRect.width - 10
          );
          // 邊界寬度過濾條件 boundHeight < 10 and boundHeight > borderHeight - 10
          let heightFilter = !(
            boundRect.y <= 10 && boundRect.height >= borderRect.height - 10
          );
          // 面積占比過濾條件
          let areaPercentFilter =
            area / (borderRect.width * borderRect.height) > 0.15;
          // 位於邊界的輪廓不會被篩選進入
          if (widthFilter && heightFilter) {
            // 最大面積的輪廓的面積占整體比例超過15%
            if (area > bigBoundArea && areaPercentFilter) {
              bigBoundArea = area;
              BoundInfo["success"] = true;
              BoundInfo["bigRectBound"] = boundRect;
              BoundInfo["bigRectPoint"] = boundPoint;
            }
          }
        }
      };
      if (approx.rows === 4 && perimeter > 10) {
        boundFilter();
      }
      contour.delete();
      approx.delete();
    }
  };

  handleBoundInfo();

  srcDst.delete();
  calcDst.delete();
  contours.delete();
  hierarchy.delete();
  return BoundInfo;
}

function detectionQuestionBound(sourceDst) {
  const dst = calcDst.clone();
  cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 17, 9)

  const erodeKernelSize = new cv.Size(2, 2);
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, erodeKernelSize)
  cv.erode(dst, dst, kernel);

  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

  let hierarchyArr = getHierarchy(hierarchy);
  let periThreshold1 = 2.0, periThreshold2 = 30.0;
  let framePoints = [];
  let totalArcLength = 0, avgArcLength = 0, arcRange = 6, rectCount = 0;

  for (let i = 0; i < contours.size(); i++) {
    const ci = contours.get(i)
    let peri = cv.arcLength(ci, true) * 0.01;
    let approx = new cv.Mat();

    cv.approxPolyDP(ci, approx, peri, true);

    const filterContours = () => {
      // 第一層過濾
      if (approx.rows == 4 && peri > periThreshold1 && peri < periThreshold2) {
        let maxArea = 0;
        let totalArea = 0;

        let isSmallRect =
          hierarchyArr[i][0] > 0 && hierarchyArr[i][1] > 0 &&
          hierarchyArr[i][3] > 0 && hierarchyArr[i][2] == -1 &&
          peri > 10;
        isSmallRect = false

        let isMiniRect = hierarchyArr[i][3] == -1 && hierarchyArr[i][0] != -1;

        // 只要小輪廓的不要大的輪廓
        if (isMiniRect) {
          totalArcLength = totalArcLength + peri;
          rectCount = rectCount + 1;
          avgArcLength = totalArcLength / rectCount;
          if (peri > (avgArcLength - arcRange) && peri < (avgArcLength + arcRange)) {
            isMiniRect = true;
          } else {
            isMiniRect = false;
          }
        }

        //提取小的輪廓
        if (isMiniRect) {
          let filterJudge = true;
          let pointsSorted = {"cntPoint": []}
          let boundingRect = {};
          let center = {};

          const sortPoint = () => {
            let point_XY = [];
            for (let i = 0; i < approx.data32S.length; i += 2) {
              let cnt = []
              cnt['x'] = approx.data32S[i]
              cnt['y'] = approx.data32S[i + 1]

              point_XY.push(cnt)
              cnt = []
            }

            let {point: sortEndPoint, center: moments} = getSortedPoint(point_XY, ci);
            boundingRect = cv.boundingRect(ci)
            // 根據角度排序矩形輪廓的點
            pointsSorted["cntPoint"] = sortEndPoint;
            center = moments;
          }

          sortPoint();

          const filter = () => {
            let tempAngle = 0;
            let tempValue = 500000;
            //太扁的矩形和奇怪形狀的矩形的數據
            let lineMidPoints = [];
            for (let index = 0; index < pointsSorted["cntPoint"].length; index++) {
              if (index != 3) {
                let temp = {};
                temp.x = (pointsSorted["cntPoint"][index].x + pointsSorted["cntPoint"][index + 1].x) / 2;
                temp.y = (pointsSorted["cntPoint"][index].y + pointsSorted["cntPoint"][index + 1].y) / 2;

                let p1 = {
                  x: pointsSorted["cntPoint"][index].x,
                  y: pointsSorted["cntPoint"][index].y
                }
                let p2 = {
                  x: pointsSorted["cntPoint"][index + 1].x,
                  y: pointsSorted["cntPoint"][index + 1].y
                }
                let angle = Math.atan2((p1.y - p2.y), (p2.x - p1.x)) //弧度
                let theta = angle * (180 / Math.PI); //角度  36.86989764584402
                temp.angle = theta;

                lineMidPoints.push(temp)
              } else if (index == 3) {
                let temp = {};
                temp.x = (pointsSorted["cntPoint"][index].x + pointsSorted["cntPoint"][index - index].x) / 2;
                temp.y = (pointsSorted["cntPoint"][index].y + pointsSorted["cntPoint"][index - index].y) / 2;

                let p1 = {
                  x: pointsSorted["cntPoint"][index].x,
                  y: pointsSorted["cntPoint"][index].y
                }
                let p2 = {
                  x: pointsSorted["cntPoint"][index - index].x,
                  y: pointsSorted["cntPoint"][index - index].y
                }
                let angle = Math.atan2((p1.y - p2.y), (p2.x - p1.x)) //弧度
                let theta = angle * (180 / Math.PI); //角度  36.86989764584402
                temp.angle = theta;

                lineMidPoints.push(temp)
              }
            }
            for (let index = 0; index < lineMidPoints.length; index++) {
              let tempVal = 0;
              tempVal = Math.pow(lineMidPoints[index].x - center.x, 2)
              tempVal += Math.pow(lineMidPoints[index].y - center.y, 2)
              tempVal = Math.sqrt(tempVal);
              if (tempVal < tempValue) {
                tempValue = tempVal
              }
              tempAngle += Math.abs(lineMidPoints[index].angle);
            }
            // 過濾太扁的矩形
            if (tempValue < 30) {
              filterJudge = false;
            }
            // 過濾奇怪形狀的矩形
            let ratio = boundingRect.height / boundingRect.width;
            if (ratio > 4.5 || ratio < 0.25) {
              filterJudge = false
            }
            if (tempAngle > 350 && tempAngle < 370) {
              // filterJudge = false;
            }
            // 過濾邊邊的矩形或是太大的矩形
            let temp1 = boundingRect.x + boundingRect.width;
            let temp2 = boundingRect.y + boundingRect.height;
            if (temp1 == videoWidth || temp2 == videoHeight) {
              filterJudge = false;
            }
            //x or y == 0 就濾除
            if ((boundingRect.x > 0 && boundingRect.x < 10) || (boundingRect.y > 0 && boundingRect.y < 10)) {
              filterJudge = false;
            }
          }

          filter();

          if (filterJudge) {
            let line = new cv.Mat();
            cv.fitLine(ci, line, cv.DIST_L2, 0, 0.01, 0.01);
            let vx = line.data32F[0];

            pointsSorted['cntInfo'] = {}
            pointsSorted['cntInfo']['area'] = cv.contourArea(ci);
            pointsSorted['cntInfo']['center'] = center;
            pointsSorted['cntInfo']['angle'] = Math.acos(vx) * 180 / Math.PI;
            pointsSorted['cntInfo']['counter'] = Math.random().toFixed(4);
            pointsSorted['cntInfo']['boundingRect'] = boundingRect;
            framePoints['totalArea'] = totalArea;
            framePoints.push(pointsSorted);
          }
        }
      }
    }

    filterContours();
    ci.delete();
    approx.delete();
  }

  hierarchyArr = [];
  dst.delete();
  contours.delete();
  hierarchy.delete();

  return framePoints;
}

class ImageOperation {
  static rotateImage(dst, degree) {
    rotateImage(dst, degree);
  }
  static drawSingleBound(drawDst, points, option) {
    drawSingleBound(drawDst, points, option);
  }
  static detectionDocumentBound(sourceDst) {
    return detectionDocumentBound(sourceDst);
  }
}

export { ImageOperation, rotateImage, drawSingleBound, detectionDocumentBound };
