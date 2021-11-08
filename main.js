
import { detectionDocument } from "./js/fixRectangle.js";
import { ControllerCamera } from "./js/camera.js";
window.addEventListener("load", () => {
  const videoWidth = 1280;
  const videoHeight = 720;
  const streamVideo = document.getElementById("streamVideo");
  const editCanvas = document.getElementById("editCanvas");
  const editContext = editCanvas.getContext("2d");

  const snapShot = document.getElementById("snapShot");
  const rotate = document.getElementById("rotate");
  const correction = document.getElementById("correction");
  const reset = document.getElementById("reset")

  const CAMERA = new ControllerCamera(streamVideo, videoWidth, videoHeight);

  let cap = null;
  let src = null;
  let dst = null;
  let drawDst = null;
  let cleanDst = null;
  let degree = 0;
  let pauseCanvas = false;
  let boundRectInfo = {};
  let saveBoundRectInfo = {};
  let editCircleInfo = {
    radius: 37,
    lineWidth: 1,
    realRadius: 40,
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
    if (cap) cap = null;
    if (src) src.delete()
    if (dst) dst.delete()
    if (drawDst) drawDst.delete()
    if (cleanDst) cleanDst.delete()
    if (window.processVideoCanvasID) clearTimeout(window.processVideoCanvasID);

    let canvasWidth = videoWidth;
    let canvasHeight = videoHeight;
    pauseCanvas = false;

    if (canvasHeight / canvasWidth == 0.5625) {
      if (canvasWidth < 1280)
        canvasWidth = 1280
      if (canvasHeight < 720)
        canvasHeight = 720
    }

    if (canvasHeight / canvasWidth == 0.75) {
      if (canvasWidth < 1024)
        canvasWidth = 1024
      if (canvasHeight < 768)
        canvasHeight = 768
    }

    streamVideo.width = canvasWidth;
    streamVideo.height = canvasHeight;

    const showCanvas = function () {

      cap = new cv.VideoCapture(streamVideo);
      src = new cv.Mat(canvasHeight, canvasWidth, cv.CV_8UC4);
      dst = new cv.Mat(canvasHeight, canvasWidth, cv.CV_8UC1);
      drawDst = new cv.Mat(canvasHeight, canvasWidth, cv.CV_8UC4, new cv.Scalar(255, 0, 255, 0));
      cleanDst = new cv.Mat(canvasHeight, canvasWidth, cv.CV_8UC4, new cv.Scalar(255, 0, 255, 0));
      const drawCanvas = function () {

        const begin = Date.now();

        cap.read(src);

        src.copyTo(drawDst); // 繪製全新的 drawDst

        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

        rotateDst(dst);

        rotateDst(drawDst);

        if (degree === 90 || degree === 270) {
          boundRectInfo = detectionDocument(dst, drawDst, videoHeight, videoWidth)
        } else {
          boundRectInfo = detectionDocument(dst, drawDst, videoWidth, videoHeight)
        }

        cv.imshow('drawOutput', drawDst);


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

  function calcBoundRectData(boundRectInfo){
    
  }

  function rendererEditCompoent(boundRectInfo) {

    editContext.clearRect(0, 0, editCanvas.width, editCanvas.height);

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

      editContext.lineWidth = editCircleInfo.lineWidth; // 圓形線條的寬度
      editContext.strokeStyle = editCircleInfo.circleStrokeStyle; // 圓形線條的顏色
      editContext.fillStyle = editCircleInfo.circleFillStyle; // 圓形內部的顏色

      // 繪製圓形控制項目
      for (let i = 0; i < points.length; i++) {
        const point = points[i];

        editContext.beginPath();
        editContext.arc(point['x'], point['y'], editCircleInfo.realRadius, 0, 2 * Math.PI, false);
        editContext.fill();
        editContext.stroke();
      }


      editContext.lineWidth = "5" // 圓形線條的寬度
      editContext.strokeStyle = "black"; // 圓形線條的顏色

      editContext.beginPath();
      editContext.moveTo(points[0]['x'], points[0]['y'])
      editContext.lineTo(points[0]['x'], points[0]['y'] + 40)
      editContext.stroke();

    }

    drawBoundRect();
    drawRect();
    drawCircle();
  }

  function initEditCompoent(boundRectInfo) {
    editCanvas.width = boundRectInfo.naturalWidth;
    editCanvas.height = boundRectInfo.naturalHeight;
    rendererEditCompoent(boundRectInfo);
  }

  function subscribeEditCompoentEvent(editCanvas, boundRectInfo) {
    let points = boundRectInfo["bigRect"]["point"];
    let radius = editCircleInfo.realRadius
    let hold = false;
    let holdCircleIndex = null;

    // 取得滑鼠座標在canvas當中的原始數值
    const getRealOffseValue = (event) => {
      let offsetX = event.offsetX;
      let offsetY = event.offsetY;
      let ratio = editCanvas.width / editCanvas.clientWidth;

      offsetX = event.offsetX;
      offsetY = event.offsetY;

      offsetX = (offsetX * ratio).toFixed(2);
      offsetY = (offsetY * ratio).toFixed(2);

      return { offsetX: offsetX, offsetY: offsetY };
    }

    // 判斷當前滑鼠所在位置是不是位於任一一個圓形控制鈕當中
    const getIsOffsetValeInCircle = (offsetX, offsetY, points, radius) => {
      let inCircle = false, inCircleIndex = null;

      for (let i = 0; i < points.length; i++) {
        const point = points[i];

        const distance = Math.sqrt(Math.pow(offsetX - point['x'], 2) + Math.pow(offsetY - point['y'], 2))

        if (distance < radius) {


          inCircleIndex = i;
          inCircle = true;
        }

      }

      return { inCircle: inCircle, inCircleIndex: inCircleIndex };
    }

    // 移動圓形控制鈕後要刷新座標點的位置
    const updateOffsetValueToBoundInfo = (newX, newY, index, points) => {
      points[index].x = parseFloat(newX);
      points[index].y = parseFloat(newY);
    }

    editCanvas.onmousedown = (event) => {
      let { offsetX: offsetX, offsetY: offsetY } = getRealOffseValue(event);
      let { inCircle: inCircle, inCircleIndex: inCircleIndex } = getIsOffsetValeInCircle(offsetX, offsetY, points, radius);
      if (inCircle === true) {
        pauseCanvas = true;
        holdCircleIndex = inCircleIndex;
        editCanvas.style.cursor = "pointer";
        hold = true;
      }
    }

    editCanvas.onmousemove = (event) => {
      let { offsetX: offsetX, offsetY: offsetY } = getRealOffseValue(event);
      let { inCircle: inCircle } = getIsOffsetValeInCircle(offsetX, offsetY, points, radius);

      if (inCircle) {
        editCanvas.style.cursor = "pointer";
      } else {
        editCanvas.style.cursor = "default";
      }

      if (hold) {
        pauseCanvas = true;
        updateOffsetValueToBoundInfo(offsetX, offsetY, holdCircleIndex, boundRectInfo["bigRect"]["point"]);
        rendererEditCompoent(boundRectInfo);
      }

    }

    editCanvas.onmouseup = (event) => {
      hold = false;
      if (pauseCanvas === true) {
        canvasStart();
      }
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


  initCamera().then(() => {
    canvasStart();
  }).catch(err => console.log(err));

  snapShot.onclick = () => {
    // 原始圖片的canvas
    const saveDst = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);

    src.copyTo(saveDst);

    rotateDst(saveDst);

    cv.imshow('saveCanvas', saveDst);

    boundRectInfo.naturalWidth = saveDst['cols'];
    boundRectInfo.naturalHeight = saveDst['rows'];
    console.log(boundRectInfo)
    // rect data
    boundRectInfo = Object.assign({}, boundRectInfo);
    // save backup rect data
    saveBoundRectInfo = JSON.parse(JSON.stringify(boundRectInfo));

    initEditCompoent(boundRectInfo);
    subscribeEditCompoentEvent(editCanvas, boundRectInfo);
  }

  reset.onclick = () => {
    boundRectInfo = JSON.parse(JSON.stringify(saveBoundRectInfo));;

    initEditCompoent(boundRectInfo);
    subscribeEditCompoentEvent(editCanvas, boundRectInfo);
  }

  rotate.onclick = () => {
    degree = degree + 90;
    if (degree === 360) {
      degree = 0;
    }
  }

  correction.onclick = () => {


  }

});