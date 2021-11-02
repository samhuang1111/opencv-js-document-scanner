
import { detectionDocument } from "./js/fixRectangle.js";
import { ControllerCamera } from "./js/camera.js";
window.addEventListener("load", () => {
  const streamVideo = document.getElementById("streamVideo");
  const videoOutput = document.getElementById("videoOutput");
  const editSection = document.getElementById("editSection")
  const snapShot = document.getElementById("snapShot");
  const rotate = document.getElementById("rotate");
  const sheetType = document.getElementById("sheetType");
  const correction = document.getElementById("correction");
  const videoWidth = 1280;
  const videoHeight = 720;
  const CAMERA = new ControllerCamera(streamVideo, videoWidth, videoHeight);

  let workSheetNmae = "A8"
  let cap = null;
  let src = null;
  let dst = null;
  let drawDst = null;
  let cleanDst = null;
  let degree = 0;
  let canvasLoopLock = true;
  let boundRectInfo = [];
  let saveBoundRectInfo = [];

  window.processVideoCanvasID = null;

  function AllSortRectangleV2(momentPointXY, drawDst, drawLine) {

    let totlaResult = []

    let horizon = false;

    for (let k = 0; k < momentPointXY.length; k++) {

      const element = momentPointXY[k].cntInfo.angle;

      if (typeof element !== "undefined" && workSheetNmae == 'A8')
        horizon = element < 50 ? false : true;

      if (typeof element !== "undefined" && workSheetNmae == 'B4')
        horizon = element < 20 ? false : true;

      if (workSheetNmae == 'A4')
        horizon = true;

    }

    if (workSheetNmae == 'B4') {

      if (horizon)
        momentPointXY.sort(function (a, b) {
          return a['cntInfo']['center'].x - b['cntInfo']['center'].x
        });
      else
        momentPointXY.sort(function (a, b) {
          return a['cntInfo']['center'].y - b['cntInfo']['center'].y
        });

      return momentPointXY
    }

    let horizontalSort = function () {

      if (momentPointXY.length != 0) {

        let newSortEndPointXY = [...momentPointXY];

        let center = {
          'x': 0,
          'y': 0,
          'totalAngle': 0,
          'tx': 0,
          'ty': 0
        }

        for (let d = 0; d < newSortEndPointXY.length; d++) {
          center.totalAngle += newSortEndPointXY[d].cntInfo.angle
          center.x += newSortEndPointXY[d].cntInfo.center.x;
          center.y += newSortEndPointXY[d].cntInfo.center.y;
        }

        center.totalAngle /= newSortEndPointXY.length;
        center.x /= newSortEndPointXY.length;
        center.y /= newSortEndPointXY.length;

        let dxdy =
          (newSortEndPointXY[0]['cntPoint'][1].x - newSortEndPointXY[0]['cntPoint'][2].x) /
          (newSortEndPointXY[0]['cntPoint'][1].y - newSortEndPointXY[0]['cntPoint'][2].y)


        let d2 = center.x * 2 * dxdy / 2;
        let y2 = new cv.Point(0, center.y + d2);
        let y1 = new cv.Point(center.x * 2, center.y - d2);

        let b = (dxdy * center.x - center.y) * -1

        if (0) {

          cv.circle(drawDst, new cv.Point(0, center.y), 5, new cv.Scalar(255, 255, 255), 10, cv.LINE_AA, 0);
          cv.circle(drawDst, new cv.Point(y1.x, center.y), 5, new cv.Scalar(255, 255, 255), 10, cv.LINE_AA, 0);
          cv.line(drawDst, new cv.Point(0, center.y), new cv.Point(y1.x, center.y), new cv.Scalar(255, 0, 0), 10, cv.LINE_AA, 0)

          cv.line(drawDst, y1, new cv.Point(center.x, center.y), new cv.Scalar(255, 0, 0), 6, cv.LINE_AA, 0)
          cv.line(drawDst, y2, new cv.Point(center.x, center.y), new cv.Scalar(255, 0, 255), 3, cv.LINE_AA, 0)

        }

        if (newSortEndPointXY.length) {

          let result1 = newSortEndPointXY.filter(function (ele) {
            // m * x - y + b = 0
            // m * x - y + b > 0
            // m * x - y + b < 0
            let val = ((y2.x - y1.x) * (ele.cntInfo.center.y - y1.y) - (y2.y - y1.y) * (ele.cntInfo.center.x - y1.x)).toFixed(0)

            return val > 0
          })
          let result2 = newSortEndPointXY.filter(function (ele) {

            let val = ((y2.x - y1.x) * (ele.cntInfo.center.y - y1.y) - (y2.y - y1.y) * (ele.cntInfo.center.x - y1.x)).toFixed(0)

            return val < 0
          })

          result1.sort(function (a, b) {
            return a['cntInfo']['center'].x - b['cntInfo']['center'].x
          })
          result2.sort(function (a, b) {
            return a['cntInfo']['center'].x - b['cntInfo']['center'].x
          })

          totlaResult = result1.concat(result2);

          let vJudge = function (totlaResult) {

            let ret = [];

            for (let e = 0; e < totlaResult.length - 1; e++) {

              const element1 = newSortEndPointXY[e];
              const element2 = newSortEndPointXY[e + 1];

              let ddd = Math.pow(element2.cntInfo.center.x - element1.cntInfo.center.x, 2) +
                Math.pow(element2.cntInfo.center.y - element1.cntInfo.center.y, 2)

              ddd = Math.sqrt(ddd)
              ret.push(ddd)

            }

            const map1 = ret.map(x => (x / 200).toFixed(0));

            let lock = 0;

            for (let t = 0; t < map1.length; t++) {
              const element = map1[t];
              if (element != "1") {
                lock = 1;
                break;
              }

            }

            return lock
          }

          const tempRes = vJudge(totlaResult) ? totlaResult : totlaResult.sort(function (a, b) {
            return a['cntInfo']['center'].x - b['cntInfo']['center'].x
          });

          totlaResult = []
          totlaResult = tempRes;

        }

      } else {

        totlaResult = momentPointXY
      }

    }

    let verticalSort = function () {
      let newSortEndPointXY = [...momentPointXY];

      let center = {
        'x': 0,
        'y': 0,
        'totalAngle': 0,
        'tx': 0,
        'ty': 0
      }

      for (let d = 0; d < newSortEndPointXY.length; d++) {
        center.totalAngle += newSortEndPointXY[d].cntInfo.angle
        center.x += newSortEndPointXY[d].cntInfo.center.x;
        center.y += newSortEndPointXY[d].cntInfo.center.y;
      }

      center.totalAngle /= newSortEndPointXY.length;
      center.x /= newSortEndPointXY.length;
      center.y /= newSortEndPointXY.length;

      let dxdy =
        (newSortEndPointXY[0]['cntPoint'][1].x - newSortEndPointXY[0]['cntPoint'][2].x) /
        (newSortEndPointXY[0]['cntPoint'][1].y - newSortEndPointXY[0]['cntPoint'][2].y)

      let d1 = center.x * 2 * dxdy / 2;
      let d = center.y * 2 * dxdy / 2;

      let x1 = new cv.Point(center.x + d, center.y * 2);
      let x2 = new cv.Point(center.x - d, 0);

      let y1 = new cv.Point(center.x * 2, center.y - d1);
      let y2 = new cv.Point(0, center.y + d1);

      // cv.line(drawDst, x1, new cv.Point(center.x, center.y), new cv.Scalar(200, 0, 200), 10, cv.LINE_AA, 0)
      // cv.line(drawDst, x2, new cv.Point(center.x, center.y), new cv.Scalar(200, 0, 200), 10, cv.LINE_AA, 0)
      // cv.line(drawDst, new cv.Point(center.x, center.y), y1, new cv.Scalar(200, 0, 200), 10, cv.LINE_AA, 0)
      // cv.line(drawDst, new cv.Point(center.x, center.y), y2, new cv.Scalar(200, 0, 200), 10, cv.LINE_AA, 0)
      // cv.circle(drawDst, new cv.Point(center.x, center.y), 10, new cv.Scalar(255, 255, 255), 6, cv.LINE_AA, 0);

      //多次分割 線上方 線中間 線下方
      let result1 = newSortEndPointXY.filter(function (ele) {

        let c = {
          'x': ele.cntInfo.center.x,
          'y': ele.cntInfo.center.y
        }
        let val = ((y2.x - y1.x) * (c.y - y1.y) - (y2.y - y1.y) * (c.x - y1.x)).toFixed(0)

        return val > 0 && val > 7000;
      })

      let result2 = newSortEndPointXY.filter(function (ele) {

        let c = {
          'x': ele.cntInfo.center.x,
          'y': ele.cntInfo.center.y
        }
        let val = ((y2.x - y1.x) * (c.y - y1.y) - (y2.y - y1.y) * (c.x - y1.x)).toFixed(0)

        return val < 0 && val < -7000;
      })

      let result3 = newSortEndPointXY.filter(function (ele) {

        let c = {
          'x': ele.cntInfo.center.x,
          'y': ele.cntInfo.center.y
        }
        let val = ((y2.x - y1.x) * (c.y - y1.y) - (y2.y - y1.y) * (c.x - y1.x)).toFixed(0)

        return val > -7000 && val < 7000;
      })

      // console.log('===============')
      // newSortEndPointXY.forEach(function (ele) {
      // 	let c = {
      // 		'x': ele.cntInfo.center.x,
      // 		'y': ele.cntInfo.center.y
      // 	}
      // 	let val = ((y2.x - y1.x) * (c.y - y1.y) - (y2.y - y1.y) * (c.x - y1.x)).toFixed(0)
      // 	console.log(val)
      // })
      // console.log('===============')

      let sort = function (array) {

        let ctx = 0,
          cty = 0;

        for (let d = 0; d < array.length; d++) {
          ctx += array[d].cntInfo.center.x;
          cty += array[d].cntInfo.center.y;
        }

        center.totalAngle /= array.length;
        ctx /= array.length;
        cty /= array.length;

        let sortdxdy =
          (array[0]['cntPoint'][1].x - array[0]['cntPoint'][2].x) /
          (array[0]['cntPoint'][1].y - array[0]['cntPoint'][2].y)

        let d1 = ctx * 2 * sortdxdy / 2;

        let y1 = new cv.Point(ctx * 2, cty - d1);
        let y2 = new cv.Point(0, cty + d1);

        // cv.circle(drawDst, new cv.Point(ctx, cty), 20, new cv.Scalar(0, 180, 180), 10, cv.LINE_AA, 0);
        // cv.line(drawDst, new cv.Point(ctx, cty), y1, new cv.Scalar(200, 0, 200), 10, cv.LINE_AA, 0)
        // cv.line(drawDst, new cv.Point(ctx, cty), y2, new cv.Scalar(200, 0, 200), 10, cv.LINE_AA, 0)

        let r1 = array.filter(function (ele) {
          let c = {
            'x': ele.cntInfo.center.x,
            'y': ele.cntInfo.center.y
          }

          return ((y2.x - y1.x) * (c.y - y1.y) - (y2.y - y1.y) * (c.x - y1.x)) > 0
        });

        let r2 = array.filter(function (ele) {
          let c = {
            'x': ele.cntInfo.center.x,
            'y': ele.cntInfo.center.y
          }
          return ((y2.x - y1.x) * (c.y - y1.y) - (y2.y - y1.y) * (c.x - y1.x)) < 0
        });

        r1.sort(function (a, b) {
          return a['cntInfo']['center'].x - b['cntInfo']['center'].x
        })

        r2.sort(function (a, b) {
          return a['cntInfo']['center'].x - b['cntInfo']['center'].x
        })

        let r1Andr2 = r1.concat(r2);

        if (r1Andr2.length == 2) {

          let rdxdy =
            (r1Andr2[0]['cntInfo']['center'].x - r1Andr2[1]['cntInfo']['center'].x) /
            (r1Andr2[0]['cntInfo']['center'].y - r1Andr2[1]['cntInfo']['center'].y)

          if (isFinite(rdxdy)) {

            let rdxdyAbs = Math.abs(rdxdy)

            let vJudge = function (totlaResult) {

              let ret = [];
              let lock = false;

              for (let e = 0; e < totlaResult.length - 1; e++) {
                const element1 = totlaResult[e];
                const element2 = totlaResult[e + 1];

                // cv.line(drawDst,
                // 	new cv.Point(element2.cntInfo.center.x, element2.cntInfo.center.y),
                // 	new cv.Point(element1.cntInfo.center.x, element1.cntInfo.center.y),
                // 	new cv.Scalar(200, 0, 200), 2, cv.LINE_AA, 0)

                let ddd = Math.pow(element2.cntInfo.center.x - element1.cntInfo.center.x, 2) +
                  Math.pow(element2.cntInfo.center.y - element1.cntInfo.center.y, 2)
                ddd = Math.sqrt(ddd)
                ret.push(ddd)
              }

              const map1 = ret.filter(x => 200 * 2 < x);

              if (map1.length)
                lock = true

              return lock;
            }

            let Diagonal = vJudge(r1Andr2)

            if (Diagonal) {

              //console.log('對角')
              r1Andr2.sort(function (a, b) {
                //水平由左而右排列
                return a.cntInfo.center.x - b.cntInfo.center.x
              })
              if (r1Andr2[1].cntInfo.center.y < r1Andr2[0].cntInfo.center.y) {
                let temp = r1Andr2[1];
                r1Andr2[1] = r1Andr2[0];
                r1Andr2[0] = temp;
                // cv.circle(drawDst, new cv.Point(r1Andr2[1].cntInfo.center.x, r1Andr2[1].cntInfo.center.x),
                // 10, new cv.Scalar(0, 0, 180), 6, cv.LINE_AA, 0);
              }


            } else {


              let hjudge = 0;

              r1Andr2.forEach(function (ele) {

                if (ele.cntInfo.center.x < (ctx + 70) && ele.cntInfo.center.x > (ctx - 70)) {
                  hjudge = 0
                  //console.log('垂直')
                } else {
                  hjudge = 1;
                  //console.log('水平')
                }

              })

              if (hjudge) {
                r1Andr2.sort(function (a, b) {

                  return a.cntInfo.center.x - b.cntInfo.center.x
                })
              } else {
                r1Andr2.sort(function (a, b) {

                  return a.cntInfo.center.y - b.cntInfo.center.y
                })
              }

            }

          }

        }

        if (array.length == 1) {

          return array;
        }

        return r1Andr2
      }

      //console.log(result3.length, result2.length, result1.length)
      if (result3.length && result2.length && result1.length) {
        result1 = sort(result1);
        result2 = sort(result2);
        result3 = sort(result3);

      } else if (result2.length && result1.length) {
        result1 = sort(result1);
        result2 = sort(result2);

      }

      // totlaResult = result1
      // totlaResult = result2
      // totlaResult = result3

      totlaResult = result1.concat(result3).concat(result2)
    }

    if (momentPointXY.length)
      horizon ? horizontalSort() : verticalSort();

    return totlaResult
  }

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

  function rotateImageDst(dst) {
    switch (degree) {
      case 0:
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

  function warpPerspective(dst, boundRectInfo) {





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
    canvasLoopLock = true;

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

      const drawCanvas = function () {
        const begin = Date.now();

        cap.read(src);

        src.copyTo(drawDst); // 繪製全新的 drawDst

        cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);

        rotateImageDst(dst);
        rotateImageDst(drawDst);

        if (degree === 90 || degree === 270) {
          boundRectInfo = detectionDocument(dst, drawDst, videoHeight, videoWidth)
        } else {
          boundRectInfo = detectionDocument(dst, drawDst, videoWidth, videoHeight)
        }

        cv.imshow('drawOutput', drawDst);

        cv.imshow('videoOutput', dst);

        if (canvasLoopLock === false) {
          clearTimeout(window.processVideoCanvasID);
          return false;
        }

        let timer = 60 - (Date.now() - begin);

        if (canvasLoopLock === true) {
          window.processVideoCanvasID = setTimeout(() => {
            drawCanvas();
          }, timer)
        }

      }

      drawCanvas();
    }

    showCanvas();
  }

  function appendCanvasEdit(dst, boundRectInfo) {
    drawBoundRectangle(dst, boundRectInfo);
    cv.imshow('editCanvas', dst);
  }

  initCamera().then(() => {
    canvasStart();
  }).catch(err => console.log(err));

  snapShot.onclick = () => {
    const saveDst = new cv.Mat(videoHeight, videoWidth, cv.CV_8UC4);
    src.copyTo(saveDst);

    rotateImageDst(saveDst)

    //把截圖後需要處理的資料數據存下來
    saveBoundRectInfo = boundRectInfo;
    saveBoundRectInfo["dst"] = saveDst;
    appendCanvasEdit(saveDst, saveBoundRectInfo)
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