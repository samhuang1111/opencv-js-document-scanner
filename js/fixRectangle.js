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

function detectionSamllRectangle(dst, drawDst, videoWidth, videoHeight) {
  let framePointXY = [];

  cv.adaptiveThreshold(dst, dst, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 11, 5)

  let erodeKernelSize = new cv.Size(2, 2);
  let kernel = cv.getStructuringElement(cv.MORPH_RECT, erodeKernelSize)
  cv.erode(dst, dst, kernel);

  let contours = new cv.MatVector();
  let hierarchy = new cv.Mat();

  cv.findContours(dst, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

  let hierarchyArr = getHierarchy(hierarchy)
  for (let i = 0; i < contours.size(); i++) {

    const ci = contours.get(i)
    const peri1 = cv.arcLength(ci, true);
    const peri2 = 0.01 * peri1;
    const distance1 = 2.0;
    const distance2 = 30.0;
    const approx = new cv.Mat();

    cv.approxPolyDP(ci, approx, peri2, true);

    const filterContours = () => {
      let isBigContours = false;
      let isSmallContours = false;
      let maxArea = 0;
      let totalArea = 0;
      if (approx.rows == 4 && peri2 > distance1 && peri2 < distance2) {

        isBigContours = (
          hierarchyArr[i][0] > 0 &&
          hierarchyArr[i][1] > 0 &&
          hierarchyArr[i][3] > 0 &&
          hierarchyArr[i][2] == -1 &&
          peri2 > 10
        );

        isSmallContours = (hierarchyArr[i][3] == -1 && hierarchyArr[i][0] != -1);
      }

      //提取大的輪廓
      if (false) {
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
        }
      }

      //提取小的輪廓
      if (isSmallContours) {
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
        cv.drawContours(drawDst, contours, i, new cv.Scalar(0, 255, 50, 255), 2, cv.LINE_AA, hierarchy, false)

      }

    }

    filterContours();
    ci.delete();
    approx.delete();
  }
  contours.delete();
  hierarchy.delete();
  hierarchyArr = [];
  return framePointXY;
}

function detectionDocument(dst, drawDst, videoWidth, videoHeight) {

  let BoundRectInfo = [];
  BoundRectInfo['bigRect'] = {};
  BoundRectInfo['bigRect']['point'] = [];
  BoundRectInfo["naturalWidth"] = drawDst.cols;
  BoundRectInfo["naturalHeight"] = drawDst.rows;
  
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
              BoundRectInfo['bigBoundingRect'] = boundingRect;
              BoundRectInfo['bigRect'] = point_XY;
              BoundRectInfo['maxArea'] = area;
              BoundRectInfo['contours'] = i;
              BoundRectInfo["success"] = true;
            }
          }

        }
        RectFilter();
      }
    }

    ci.delete();
    approx.delete();
  }

  if (BoundRectInfo["success"]) {
    cv.drawContours(drawDst, contours, maxIndex, new cv.Scalar(0, 0, 255, 255), 4, cv.LINE_AA, hierarchy, false);
    contours.delete();
    hierarchy.delete();
    return BoundRectInfo
  } else {
    BoundRectInfo["success"] = false;
    BoundRectInfo['bigBoundingRect'] = borderRect;
    BoundRectInfo['bigRect']['point'] = [
      { x: 0, y: 0 },
      { x: borderRect.width, y: 0 },
      { x: borderRect.width, y: borderRect.height },
      { x: 0, y: borderRect.height }
    ]
    contours.delete();
    hierarchy.delete();
    return BoundRectInfo;
  }

}

export { detectionSamllRectangle, detectionDocument };