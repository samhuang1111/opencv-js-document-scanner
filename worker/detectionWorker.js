self.importScripts("../opencv.js");

self.importScripts("./fixRectangle.js");

let cvMat = {
  srcDst: null,
  calcDst: null,
  drawDst: null,
};

let boundRectData = {
  refreshBoundRectInfo: null,
};

function rotateDst(dst, degree) {
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

function waitForOpencv(callbackFn, waitTimeMs = 30000, stepTimeMs = 100) {
  if (cv.Mat) callbackFn(true);
  let timeSpentMs = 0;
  const interval = setInterval(() => {
    const limitReached = timeSpentMs > waitTimeMs;
    if (cv.Mat || limitReached) {
      clearInterval(interval);
      return callbackFn(!limitReached);
    } else {
      timeSpentMs += stepTimeMs;
    }
  }, stepTimeMs);
}

function detectionProcess(imageUint8Array, degree, width, height) {
  cvMat.srcDst = cv.matFromArray(height, width, cv.CV_8UC4, imageUint8Array);
  cvMat.calcDst = new cv.Mat();
  cvMat.drawDst = new cv.Mat();

  rotateDst(cvMat.srcDst, degree);

  cvMat.srcDst.copyTo(cvMat.calcDst);

  cvMat.srcDst.copyTo(cvMat.drawDst);

  cv.cvtColor(cvMat.calcDst, cvMat.calcDst, cv.COLOR_RGBA2GRAY);

  let bound={}, dstUint8Array, dstWidth, dstHeight;

  if (degree === 90 || degree === 270) {
    bound["refreshBoundRectInfo"] = detectionDocument(
      cvMat.calcDst,
      cvMat.drawDst,
      height,
      width
    );
  } else {
    bound["refreshBoundRectInfo"] = detectionDocument(
      cvMat.calcDst,
      cvMat.drawDst,
      width,
      height
    );
  }

  dstUint8Array = new Uint8Array(cvMat.drawDst.data);
  dstWidth = cvMat.drawDst.cols;
  dstHeight = cvMat.drawDst.rows;

  cvMat.srcDst.delete();
  cvMat.drawDst.delete();
  cvMat.calcDst.delete();

  return {
    dstUint8Array: dstUint8Array,
    dstWidth: dstWidth,
    dstHeight: dstHeight,
    bound: bound,
  };
}

function sendMessageInWebWorker(dstUint8Array, width, height, boundInfo) {
  let dstMessage = {
    type: "data",
    width: width,
    height: height,
    boundInfo: boundInfo,
    dstUint8Array,
  };
  self.postMessage(dstMessage);
}

self.onmessage = function (e) {
  if (e.data.type === "load") {
    waitForOpencv(function (success) {
      if (success) {
        self.postMessage({
          msg: "OpenCV.js Web Worker Load Success.",
          type: "load",
        });
      } else {
        throw new Error("Error on loading OpenCV");
      }
    });
  }

  if (e.data.type === "data") {

    const {
      originUint8ArrayBuffer: originUint8ArrayBuffer,
      videoWidth: canvasWidth,
      videoHeight: canvasHeight,
      degree: degree,
    } = e.data;

    const originUint8Array = new Uint8Array(originUint8ArrayBuffer);

    const {
      dstUint8Array: dstUint8Array,
      dstWidth: dstWidth,
      dstHeight: dstHeight,
      bound:bound
    } = detectionProcess(originUint8Array, degree, canvasWidth, canvasHeight);

    sendMessageInWebWorker(
      dstUint8Array,
      dstWidth,
      dstHeight,
      bound
    );


  }
};
