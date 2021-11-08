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

function detectionRectangle(dst, drawDst, videoWidth, videoHeight) {
  let framePointXY = [];

  cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 17, 9)

  let erodeKernelSize = new cv.Size(3, 3);
  let kernel = cv.getStructuringElement(cv.MORPH_RECT, erodeKernelSize)
  cv.erode(dst, dst, kernel);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

  let hierarchyArr = getHierarchy(hierarchy)
  for (let i = 0; i < contours.size(); i++) {

    const ci = contours.get(i)
    let peri1 = cv.arcLength(ci, true);
    let peri2 = 0.01 * peri1;
    let approx = new cv.Mat();

    cv.approxPolyDP(ci, approx, peri2, true);

    let t1 = 3.0
    let t2 = 25.0

    let filterContours = () => {

      if (approx.rows == 4 && peri2 > t1 && peri2 < t2) {

        let maxArea = 0;
        let totalArea = 0;

        let bigContoursJudge =
          hierarchyArr[i][0] > 0 && hierarchyArr[i][1] > 0 &&
          hierarchyArr[i][3] > 0 && hierarchyArr[i][2] == -1 &&
          peri2 > 10;

        let smallContoursJudge = hierarchyArr[i][3] == -1 && hierarchyArr[i][0] != -1;

        //提取大的輪廓
        if (bigContoursJudge) {
          let boundingRect = cv.boundingRect(ci)
          if (boundingRect.width > videoWidth * 0.15 && boundingRect.height > videoWidth * 0.15) {

            let point_XY = [];
            let Area = cv.contourArea(ci);
            if (maxArea < Area) {
              maxArea = Area;
            }

            for (let i = 0; i < approx.data32S.length; i += 2) {
              let cnt = []
              cnt['x'] = approx.data32S[i]
              cnt['y'] = approx.data32S[i + 1]
              point_XY.push(cnt)
              cnt = []
            }

            let { point: sortEndPoint, center: center } = getSortedPoint(point_XY, ci);
            framePointXY['bigRect'] = sortEndPoint;
            framePointXY['maxArea'] = maxArea;
            framePointXY['bigBoundingRect'] = boundingRect;
            // cv.drawContours(drawDst, contours, i, new cv.Scalar(100, 100, 255, 255), 2, cv.LINE_8, hierarchy, false)
          }
        }

        //提取小的輪廓
        if (smallContoursJudge) {
          let point_XY = [];

          for (let i = 0; i < approx.data32S.length; i += 2) {
            let cnt = []
            cnt['x'] = approx.data32S[i]
            cnt['y'] = approx.data32S[i + 1]

            point_XY.push(cnt)
            cnt = []
          }

          let { point: sortEndPoint, center: center } = getSortedPoint(point_XY, ci);
          let boundingRect = cv.boundingRect(ci)
          let pointsSorted = {
            "cntPoint": []
          }

          // 根據角度排序矩形輪廓的點
          pointsSorted["cntPoint"] = sortEndPoint;

          //過濾
          const judge = () => {

            let lock = true;
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
            if (!(tempValue > 30)) {
              lock = false;
            }

            let ratio = boundingRect.height / boundingRect.width
            if (ratio > 4 || ratio < 0.2) {
              lock = false
            }

            // 過濾奇怪形狀的矩形
            if (!(tempAngle > 350 && tempAngle < 370)) {
              lock = false;
            }

            // 過濾邊邊的矩形或是太大的矩形
            let temp1 = boundingRect.x + boundingRect.width;
            let temp2 = boundingRect.y + boundingRect.height;
            if (temp1 == videoWidth || temp2 == videoHeight) {
              lock = false;
            }

            //x or y == 0 就濾除
            //之前是同時等於0才濾除
            if ((boundingRect.x == 0 || boundingRect.y == 0)) {
              lock = false;
            }

            return lock;
          }

          if (judge()) {

            //let b1 = new cv.Point(boundingRect.x, boundingRect.y);
            //let b2 = new cv.Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
            //cv.rectangle(drawDst, b1, b2, new cv.Scalar(0, 255, 0, 255), 1, cv.LINE_AA, 0)

            // cv.drawContours(drawDst, contours, i, new cv.Scalar(100, 100, 255, 255), 2, cv.LINE_AA, hierarchy, false)

            let line = new cv.Mat();
            cv.fitLine(ci, line, cv.DIST_L2, 0, 0.01, 0.01);
            let vx = line.data32F[0];

            pointsSorted['cntInfo'] = {}
            pointsSorted['cntInfo']['center'] = center;
            pointsSorted['cntInfo']['angle'] = Math.acos(vx) * 180 / Math.PI;
            pointsSorted['cntInfo']['counter'] = Math.random().toFixed(4);
            pointsSorted['cntInfo']['boundingRect'] = boundingRect;
            framePointXY['totalArea'] = totalArea;

            framePointXY.push(pointsSorted);
          }

        }
      }
    }

    filterContours();
    ci.delete();
    approx.delete();
  }

  hierarchyArr = [];
  contours.delete();
  hierarchy.delete();
  return framePointXY;
}

function detectionDocument(dst, drawDst, videoWidth, videoHeight) {

  let framePointXY = [];
  framePointXY['bigRect']={};
  framePointXY['bigRect']['point'] = [];
  
  // 高斯模糊
  let ksize = new cv.Size(3, 3);
  cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
  // Canny邊緣檢測算子
  cv.Canny(dst, dst, 30, 150, 3, false);

  // 膨脹白色線條
  let erodeKernelSize = new cv.Size(2, 2);
  let kernel = cv.getStructuringElement(cv.MORPH_RECT, erodeKernelSize)
  cv.dilate(dst, dst, kernel);

  // borderLine
  const borderRect = { x: 0, y: 0, width: videoWidth, height: videoHeight };
  const borderRect1 = new cv.Point(borderRect.x, borderRect.y);
  const borderRect2 = new cv.Point(borderRect.width, borderRect.height);
  cv.rectangle(dst, borderRect1, borderRect2, new cv.Scalar(255, 255, 255, 255), 7, cv.LINE_AA, 0);

  // 輪廓查找
  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();
  cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
  let hierarchyArr = getHierarchy(hierarchy)

  let maxArea = 0;
  let maxIndex = 0;

  for (let i = 0; i < contours.size(); i++) {

    const ci = contours.get(i)
    let peri1 = cv.arcLength(ci, true);
    let peri2 = 0.01 * peri1;
    let approx = new cv.Mat();

    cv.approxPolyDP(ci, approx, peri2, true);
    if (approx.rows === 4) {
      const area = cv.contourArea(ci, false);
      if (area > 3000) {
        // 輪廓外接矩形
        const boundingRect = cv.boundingRect(ci);
        const RectFilter = () => {

          // 輪廓頂點
          let point_XY = [];

          for (let i = 0; i < approx.data32S.length; i += 2) {
            let cnt = []
            cnt['x'] = approx.data32S[i]
            cnt['y'] = approx.data32S[i + 1]
            point_XY.push(cnt)
            cnt = []
          }
          // 輪廓頂點順時針排序
          point_XY = getSortedPoint(point_XY, ci)

          // 根據外接矩形數據篩選不要的矩形(去除位於左側邊邊的矩形)
          let boundJudge = (boundingRect.x > 10 && boundingRect.x !== 0 && boundingRect.y !== 0);

          if (boundJudge) {

            // 根據輪廓頂點數據篩選不要的矩形(去除位於右側邊邊的矩形)
            let pointJudge =
              !(point_XY["point"][1].x > borderRect.width - 10) &&
              !(point_XY["point"][2].x > borderRect.width - 10)

            // 根據輪廓大小篩選輪廓，只取最大的輪廓
            if (area > maxArea && pointJudge) {
              maxArea = area;
              maxIndex = i;
              framePointXY['bigBoundingRect'] = boundingRect;
              framePointXY['bigRect'] = point_XY;
              framePointXY['maxArea'] = area;
              framePointXY['contours'] = i;
              framePointXY["success"] = true;
            }

          }

        }
        RectFilter();
      }
    }

    ci.delete();
    approx.delete();
  }

  if (framePointXY["success"]) {
    cv.drawContours(drawDst, contours, maxIndex, new cv.Scalar(0, 0, 255, 255), 4, cv.LINE_AA, hierarchy, false);
    hierarchyArr = [];
    contours.delete();
    hierarchy.delete();
    return framePointXY
  } else {

    framePointXY["success"] = false;
    framePointXY['bigBoundingRect'] = borderRect;
    framePointXY['bigRect']['point'] = [
      { x: 0, y: 0 },
      { x: borderRect.width, y: 0 },
      { x: borderRect.width, y: borderRect.height },
      { x: 0, y: borderRect.height }
    ]

    hierarchyArr = [];
    contours.delete();
    hierarchy.delete();
    return framePointXY;
  }

}


export { detectionRectangle, detectionDocument };