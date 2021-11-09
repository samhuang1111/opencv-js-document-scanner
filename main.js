
import { ControllerCamera } from "./js/camera.js";
import { detectionDocument } from "./js/fixRectangle.js";
window.addEventListener("load", () => {
  const videoWidth = 1280;
  const videoHeight = 720;
  const streamVideo = document.getElementById("streamVideo");
  const editCanvas = document.getElementById("editCanvas");
  const saveCanvas = document.getElementById("saveCanvas");
  const fixCanvas = document.getElementById("fixCanvas");
  const editContext = editCanvas.getContext("2d");
  const snapShot = document.getElementById("snapShot");
  const rotate = document.getElementById("rotate");
  const correction = document.getElementById("correction");
  const reset = document.getElementById("reset")
  const CAMERA = new ControllerCamera(streamVideo, videoWidth, videoHeight);

  let degree = 0;
  let pauseCanvas = false;

  let cvMat = {
    cap: null,
    srcDst: null,
    calcDst: null,
    drawDst: null
  }
  let boundRectData = {
    refreshBoundRectInfo: {},
    saveBoundRectInfo: {},
    backupBoundRectInfo: {}
  }
  let circleCompoentInfo = {
    radius: 40,
    lineWidth: 1,
    lineStrokeStyle: "blue",
    circleStrokeStyle: "rgba(255, 255, 255, 0.5)",
    circleFillStyle: "rgba(255, 255, 255, 0.7)"
  };

  async function startUpCamera(deviceId) {
    if (!deviceId) {
      deviceId = CAMERA.currentDeviceId
    }

    CAMERA.webcam.width = CAMERA.videoWidth;
    CAMERA.webcam.height = CAMERA.videoHeight;

    await CAMERA.stopStream().catch(err => console.log(err));
    await CAMERA.getStream(deviceId)
    await CAMERA.handleStream(CAMERA.webcam, CAMERA.mediaStream);

    return true
  }

  async function initCamera() {
    let devices = await CAMERA.getDeviceList()

    await startUpCamera();

    // frist access camera is reload
    if (devices.length === 1 && devices[0] === "") {
      await CAMERA.stopStream();
      await CAMERA.getDeviceList() // frist access camera
      await CAMERA.getStream(CAMERA.currentDeviceId)
      await CAMERA.handleStream(CAMERA.webcam, CAMERA.mediaStream);
    }

    return true
  }

  function rotateDst(dst) {
    switch (degree) {
      case 0:
        // 不用做任何處理
        break;
      case 90:
        cv.flip(dst, dst, 0);
        cv.transpose(dst, dst);
        break;
      case 180:
        cv.flip(dst, dst, 1);
        cv.flip(dst, dst, 0);
        break;
      case 270:
        cv.flip(dst, dst, 1);
        cv.transpose(dst, dst);
        break;
      default:
        // 不用做任何處理
        break;
    }
  }

  function drawBoundRectangle(dst, boundRectInfo) {
    let red = new cv.Scalar(255, 0, 50, 255);
    let green = new cv.Scalar(50, 255, 0, 255);

    // 畫最小外接矩形
    let boundPoint1 = new cv.Point(boundRectInfo["bigBoundingRect"].x, boundRectInfo["bigBoundingRect"].y);
    let boundPoint2 = new cv.Point(boundRectInfo["bigBoundingRect"].x + boundRectInfo["bigBoundingRect"].width, boundRectInfo["bigBoundingRect"].y + boundRectInfo["bigBoundingRect"].height);
    cv.rectangle(dst, boundPoint1, boundPoint2, green, 5, cv.LINE_AA, 0)

    // 矩形的所有頂點
    let rectPoint = boundRectInfo["bigRect"]["point"];
    // 頂點
    let point1 = new cv.Point(rectPoint[0]['x'], rectPoint[0]['y']);
    let point2 = new cv.Point(rectPoint[1]['x'], rectPoint[1]['y']);
    let point3 = new cv.Point(rectPoint[2]['x'], rectPoint[2]['y']);
    let point4 = new cv.Point(rectPoint[3]['x'], rectPoint[3]['y']);

    //畫矩形
    cv.line(dst, point1, point2, red, 4, cv.LINE_AA, 0)
    cv.line(dst, point1, point4, red, 4, cv.LINE_AA, 0)
    cv.line(dst, point3, point2, red, 4, cv.LINE_AA, 0)
    cv.line(dst, point3, point4, red, 4, cv.LINE_AA, 0)

    // 畫頂點圓
    cv.circle(dst, point1, 6, red, 12, cv.FILLED, 0)
    cv.circle(dst, point2, 6, red, 12, cv.FILLED, 0)
    cv.circle(dst, point3, 6, red, 12, cv.FILLED, 0)
    cv.circle(dst, point4, 6, red, 12, cv.FILLED, 0)

  }

  function canvasStart() {
    if (cvMat.cap) cvMat.cap = null;
    if (cvMat.srcDst) cvMat.srcDst.delete();
    if (cvMat.calcDst) cvMat.calcDst.delete();
    if (cvMat.drawDst) cvMat.drawDst.delete();

    let canvasWidth = videoWidth;
    let canvasHeight = videoHeight;

    if (canvasHeight / canvasWidth == 0.5625) {
      if (canvasWidth < 1280) {
        canvasWidth = 1280
      }
      if (canvasHeight < 720) {
        canvasHeight = 720
      }
    }

    if (canvasHeight / canvasWidth == 0.75) {
      if (canvasWidth < 1024) {
        canvasWidth = 1024
      }
      if (canvasHeight < 768) {
        canvasHeight = 768
      }
    }

    streamVideo.width = canvasWidth;
    streamVideo.height = canvasHeight;
    pauseCanvas = false;

    const showCanvas = function () {
      cvMat.cap = new cv.VideoCapture(streamVideo); // 攝像頭
      cvMat.srcDst = new cv.Mat(canvasHeight, canvasWidth, cv.CV_8UC4); // 攝像頭資料
      cvMat.calcDst = new cv.Mat(canvasHeight, canvasWidth, cv.CV_8UC1); // 計算畫面資料
      cvMat.drawDst = new cv.Mat(canvasHeight, canvasWidth, cv.CV_8UC4, new cv.Scalar(255, 0, 255, 0)); // 繪製畫面資料

      const drawCanvas = function () {
        const begin = Date.now();

        cvMat.cap.read(cvMat.srcDst); //

        cvMat.srcDst.copyTo(cvMat.drawDst); // 繪製全新的 drawDst

        cv.cvtColor(cvMat.srcDst, cvMat.calcDst, cv.COLOR_RGBA2GRAY);

        rotateDst(cvMat.calcDst);

        rotateDst(cvMat.drawDst);

        if (degree === 90 || degree === 270) {
          boundRectData.refreshBoundRectInfo = detectionDocument(cvMat.calcDst, cvMat.drawDst, videoHeight, videoWidth)
        } else {
          boundRectData.refreshBoundRectInfo = detectionDocument(cvMat.calcDst, cvMat.drawDst, videoWidth, videoHeight)
        }

        cv.imshow('drawOutput', cvMat.drawDst);

        if (pauseCanvas === true) {
          clearTimeout(window.processVideoCanvasID);
          return false;
        }

        let timer = 33 - (Date.now() - begin);

        if (pauseCanvas === false) {
          window.processVideoCanvasID = setTimeout(() => {
            drawCanvas();
          }, timer)
        }
      }

      drawCanvas();
    }

    showCanvas();
  }

  function calcBoundRectSize(boundRectInfo) {
    let points = boundRectInfo["bigRect"]["point"];
    let totalX = [], totalY = [], centerX = 0, centerY = 0;
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      centerX += point['x'];
      centerY += point['y'];
      totalX.push(point['x']);
      totalY.push(point['y']);
    }

    //最小外接矩形左上最小的x y座標
    let leftTopX = Math.min(...totalX);
    let leftTopY = Math.min(...totalY);
    //最小外接矩形右下最大的x y座標
    let rightBottomX = Math.max(...totalX);
    let rightBottomY = Math.max(...totalY);
    //最小外接矩形長寬
    let width = rightBottomX - leftTopX;
    let height = rightBottomY - leftTopY;
    centerX = centerX / points.length;
    centerY = centerY / points.length;

    // 計算角度
    const newPoints = points.map(({ x, y }) => {
      return {
        x, y, angle: Math.atan2(y - centerY, x - centerX) * 180 / Math.PI
      }
    });

    // 依照角度排序
    newPoints.sort((a, b) => a.angle - b.angle)

    boundRectInfo["bigBoundingRect"] = {
      x: leftTopX,
      y: leftTopY,
      width: width,
      height: height
    }
    boundRectInfo["bigRect"]["center"] = {
      x: centerX,
      y: centerY
    }
    boundRectInfo["bigRect"]["point"] = newPoints;

    return boundRectInfo;
  }

  // 繪製圓形控制項目和線條
  function rendererEditCompoent(boundRectInfo) {

    const radius = (circleCompoentInfo.radius + (circleCompoentInfo.lineWidth / 2));

    editContext.clearRect(0, 0, editCanvas.width, editCanvas.height);

    boundRectInfo = calcBoundRectSize(boundRectInfo);

    const drawBoundRect = () => {
      // 畫最小外接矩形
      let boundPoint = new cv.Point(boundRectInfo["bigBoundingRect"].x, boundRectInfo["bigBoundingRect"].y);
      let boundSize = {
        width: boundRectInfo["bigBoundingRect"].width,
        height: boundRectInfo["bigBoundingRect"].height
      }

      // 繪製最小外接矩形
      editContext.beginPath();
      editContext.lineWidth = "6";
      editContext.strokeStyle = "blue";
      editContext.rect(boundPoint.x, boundPoint.y, boundSize.width, boundSize.height);
      editContext.stroke();
    }

    const drawRect = () => {
      const points = boundRectInfo["bigRect"]["point"];

      let point1 = new cv.Point(points[0]['x'], points[0]['y']);
      let point2 = new cv.Point(points[1]['x'], points[1]['y']);
      let point3 = new cv.Point(points[2]['x'], points[2]['y']);
      let point4 = new cv.Point(points[3]['x'], points[3]['y']);

      //畫矩形
      editContext.beginPath();
      editContext.lineWidth = "6";
      editContext.strokeStyle = "red";
      editContext.moveTo(point1.x, point1.y);
      editContext.lineTo(point2.x, point2.y);
      editContext.moveTo(point1.x, point1.y);
      editContext.lineTo(point4.x, point4.y);
      editContext.moveTo(point3.x, point3.y);
      editContext.lineTo(point2.x, point2.y);
      editContext.moveTo(point3.x, point3.y);
      editContext.lineTo(point4.x, point4.y);
      editContext.stroke();

    }

    const drawCircle = () => {
      // 繪製圓形控制項目
      const points = boundRectInfo["bigRect"]["point"];

      editContext.lineWidth = circleCompoentInfo.lineWidth; // 圓形線條的寬度
      editContext.strokeStyle = circleCompoentInfo.circleStrokeStyle; // 圓形線條的顏色
      editContext.fillStyle = circleCompoentInfo.circleFillStyle; // 圓形內部的顏色

      // 繪製圓形控制項目
      for (let i = 0; i < points.length; i++) {
        const point = points[i];

        editContext.beginPath();
        editContext.arc(point['x'], point['y'], radius, 0, 2 * Math.PI, false);
        editContext.fill();
        editContext.stroke();
      }

    }

    drawBoundRect();
    drawRect();
    drawCircle();
  }

  // 初始化繪製圓形控制項目和線條
  function initEditCompoent(boundRectInfo) {
    editCanvas.width = boundRectInfo.naturalWidth;
    editCanvas.height = boundRectInfo.naturalHeight;
    rendererEditCompoent(boundRectInfo);
  }

  // 註冊圓形控制項目的動作
  function subscribeEditCompoentEvent(editCanvas, boundRectInfo) {

    const radius = (circleCompoentInfo.radius + (circleCompoentInfo.lineWidth / 2));
    let hold = false;
    let holdCircleIndex = null;

    // 取得滑鼠座標在canvas當中的原始數值
    const getRealOffseValue = (event) => {
      let ratio = editCanvas.width / editCanvas.clientWidth;
      let offsetX = event.offsetX;
      let offsetY = event.offsetY;

      offsetX = (offsetX * ratio).toFixed(2);
      offsetY = (offsetY * ratio).toFixed(2);

      return { offsetX: offsetX, offsetY: offsetY };
    }

    // 判斷當前滑鼠所在位置是不是位於任一一個圓形控制鈕當中
    const getIsOffsetValeInCircle = (offsetX, offsetY, boundRectInfo, radius) => {
      let inCircle = false, inCircleIndex = null;
      let points = boundRectInfo["bigRect"]["point"];
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        // 滑鼠的點擊位置是否在圓形之內
        const distance = Math.sqrt(Math.pow(offsetX - point['x'], 2) + Math.pow(offsetY - point['y'], 2))
        if (distance < radius) {
          inCircle = true;
          inCircleIndex = i;
        }
      }
      return { inCircle: inCircle, inCircleIndex: inCircleIndex };
    }

    // 移動圓形控制鈕後要刷新座標點的位置
    const updateOffsetValueToBoundInfo = (newX, newY, index, boundRectInfo) => {
      boundRectInfo["bigRect"]["point"][index].x = parseFloat(newX);
      boundRectInfo["bigRect"]["point"][index].y = parseFloat(newY);
    }

    editCanvas.onmousedown = (event) => {
      let { offsetX: offsetX, offsetY: offsetY } = getRealOffseValue(event);
      let { inCircle: inCircle, inCircleIndex: inCircleIndex } = getIsOffsetValeInCircle(offsetX, offsetY, boundRectInfo, radius);
      if (inCircle === true) {
        pauseCanvas = true;
        holdCircleIndex = inCircleIndex;
        editCanvas.style.cursor = "pointer";
        hold = true;
      }
    }

    editCanvas.onmousemove = (event) => {
      let { offsetX: offsetX, offsetY: offsetY } = getRealOffseValue(event);
      let { inCircle: inCircle } = getIsOffsetValeInCircle(offsetX, offsetY, boundRectInfo, radius);

      if (inCircle) {
        editCanvas.style.cursor = "pointer";
      } else {
        editCanvas.style.cursor = "default";
      }

      if (hold) {
        pauseCanvas = true;
        updateOffsetValueToBoundInfo(offsetX, offsetY, holdCircleIndex, boundRectInfo);
        rendererEditCompoent(boundRectInfo);
      }

    }

    editCanvas.onmouseup = (event) => {
      if (pauseCanvas === true) {
        canvasStart();
      }
      if (hold === true) {
        let { offsetX: offsetX, offsetY: offsetY } = getRealOffseValue(event);
        updateOffsetValueToBoundInfo(offsetX, offsetY, holdCircleIndex, boundRectInfo);
        rendererEditCompoent(boundRectInfo);
      }
      hold = false;
      editCanvas.style.cursor = "default";
    }

    editCanvas.onmouseleave = (event) => {
      hold = false;
      if (pauseCanvas === true) {
        canvasStart();
      }
      editCanvas.style.cursor = "default";
    }

  }


  // 將方框內的圖片裁切出來然後做透視變換
  function warpPerspective(srcDst, cutDst, fixDst, boundRectInfo) {
    const rect = boundRectInfo["bigBoundingRect"];
    const points = boundRectInfo["bigRect"]["point"];
    let cutPoints = [];

    cutDst = srcDst.roi(rect);

    for (let index = 0; index < points.length; index++) {
      //小圖中的四個頂點
      cutPoints.push(points[index]["x"] - rect.x);
      cutPoints.push(points[index]["y"] - rect.y);
    }

    const dsize = new cv.Size(rect.width, rect.height);

    const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, cutPoints);
    const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
      0,
      0,
      rect.width,
      0,
      rect.width,
      rect.height,
      0,
      rect.height,
    ]);

    const M = cv.getPerspectiveTransform(srcTri, dstTri);
    cv.warpPerspective(
      cutDst,
      fixDst,
      M,
      dsize,
      cv.INTER_LINEAR,
      cv.BORDER_CONSTANT,
      new cv.Scalar()
    );
  }

  // 掃描文件
  function documentScanner(boundRectInfo) {
    const rect = boundRectInfo["bigBoundingRect"];
    const srcDst = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4); // 原圖
    const cutDst = new cv.Mat(); // 裁切後的圖
    const fixDst = new cv.Mat(); // 裁切後做透視變換的圖，也就是結果

    let saveDst = cv.imread(saveCanvas);

    fixCanvas.width = rect.width;
    fixCanvas.height = rect.height;

    saveDst.copyTo(srcDst);

    warpPerspective(srcDst, cutDst, fixDst, boundRectInfo)

    cv.imshow('fixCanvas', fixDst);

    cutDst.delete();
    fixDst.delete();
  }

  snapShot.onclick = () => {
    // 原始圖片的canvas
    const saveDst = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);

    cvMat.srcDst.copyTo(saveDst);

    rotateDst(saveDst);

    cv.imshow('saveCanvas', saveDst);

    boundRectData.refreshBoundRectInfo.naturalWidth = saveDst['cols'];
    boundRectData.refreshBoundRectInfo.naturalHeight = saveDst['rows'];

    // 儲存辨識結果資料
    boundRectData.saveBoundRectInfo = Object.assign({}, boundRectData.refreshBoundRectInfo);
    // 備份辨識結果資料
    boundRectData.backupBoundRectInfo = JSON.parse(JSON.stringify(boundRectData.saveBoundRectInfo));

    initEditCompoent(boundRectData.saveBoundRectInfo);
    subscribeEditCompoentEvent(editCanvas, boundRectData.saveBoundRectInfo);
  }

  reset.onclick = () => {
    // 從備份資料還原
    boundRectData.saveBoundRectInfo = JSON.parse(JSON.stringify(boundRectData.backupBoundRectInfo));;

    initEditCompoent(boundRectData.saveBoundRectInfo);
    subscribeEditCompoentEvent(editCanvas, boundRectData.saveBoundRectInfo);
  }

  rotate.onclick = () => {
    degree = degree + 90;
    if (degree === 360) {
      degree = 0;
    }
  }

  correction.onclick = () => {
    documentScanner(boundRectData.saveBoundRectInfo, "saveCanvas", "fixCanvas");
  }

  initCamera().then(() => {
    canvasStart();
  }).catch(err => console.log(err));

});