import {
  ImageOperation,
  rotateImage,
  drawSingleBound,
  detectionDocumentBound,
} from "../detectionProcess.js";
import { ControllerCamera } from "./camera.js";

const videoInput = document.getElementById("videoInput");
const canvasOutput = document.getElementById("canvasOutput");

const videoWidth = 1600;
const videoHeight = 1200;

const CAMERA = new ControllerCamera(videoInput, videoWidth, videoHeight);

CAMERA.initCamera().then(() => {
  start();
});

function start() {
  const canvasWidth = 1280;
  const canvasHeight = 960;
  const cap = new cv.VideoCapture(videoInput);
  const srcDst = new cv.Mat(canvasHeight, canvasWidth, cv.CV_8UC4);
  videoInput.width = canvasWidth;
  videoInput.height = canvasHeight;

  function draw() {
    let begin = Date.now();

    cap.read(srcDst);

    const drawDst = new cv.Mat(
      srcDst.rows,
      srcDst.cols,
      cv.CV_8UC4,
      new cv.Scalar(0, 0, 0, 0)
    );

    ImageOperation.rotateImage(drawDst, 0);
    ImageOperation.rotateImage(srcDst, 0);

    let boundInfo = ImageOperation.detectionDocumentBound(srcDst);

    ImageOperation.drawSingleBound(drawDst, boundInfo["bigRectPoint"]["point"]);

    cv.imshow("canvasBack", drawDst);

    drawDst.delete();

    let delay = 1000 / 30 - (Date.now() - begin);

    setTimeout(() => {
      draw();
    }, delay);
  }

  draw();
}
