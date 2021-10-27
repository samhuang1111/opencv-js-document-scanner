function B4_sheet(pointArr, resultX, resultY, screen_rect_info) {

  let resultNum = pointArr.length;
  let horizontal = screen_rect_info.horizontal

  let circle_range = 7,
    circle_thickness = 7,
    circle_color = new cv.Scalar(200, 0, 0, 255);

  let OneRectangle = function () {

    let newPointArr = [...pointArr];
    let centerLack = false;
    let centerLackValue = 0;
    let totaldistance = [];
    var LackOneCenter = {};

    //判斷是否在中間
    for (let index = 0; index < pointArr.length - 1; index++) {
      let index1 = index;
      let index2 = index + 1;
      let distance = Math.sqrt(Math.pow(pointArr[index1].cntInfo.center.x - pointArr[index2].cntInfo.center.x, 2) +
        Math.pow(pointArr[index1].cntInfo.center.y - pointArr[index2].cntInfo.center.y, 2))

      totaldistance.push(distance)
    }
    if (totaldistance[0] / totaldistance[1] > 1.9 || totaldistance[0] / totaldistance[1] < 0.6) {
      centerLack = true;
      centerLackValue = totaldistance[0] / totaldistance[1];
    }

    let LackRectangle = function (index1, index2, idx0, idx1, idx2, idx3) {

      this.index1 = index1;
      this.idx0 = idx0;
      this.idx1 = idx1;

      this.index2 = index2;
      this.idx2 = idx2;
      this.idx3 = idx3;

      this.cntPointArr = [];
      this.cntPoint = [];

      let x, y;

      this.calcSideRectangle = function () {

        x = pointArr[this.index1].cntPoint[this.idx1].x
        y = pointArr[this.index1].cntPoint[this.idx1].y
        cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = pointArr[this.index1].cntPoint[this.idx3].x
        y = pointArr[this.index1].cntPoint[this.idx3].y
        cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (2 * pointArr[this.index1].cntPoint[this.idx1].x - 1 * pointArr[this.index1].cntPoint[this.idx0].x) / 1
        y = (2 * pointArr[this.index1].cntPoint[this.idx1].y - 1 * pointArr[this.index1].cntPoint[this.idx0].y) / 1
        cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (2 * pointArr[this.index1].cntPoint[this.idx3].x - 1 * pointArr[this.index1].cntPoint[this.idx2].x) / 1
        y = (2 * pointArr[this.index1].cntPoint[this.idx3].y - 1 * pointArr[this.index1].cntPoint[this.idx2].y) / 1
        cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })


      }

      this.calcCenterRectangle = function () {

        x = pointArr[this.index1].cntPoint[this.idx0].x
        y = pointArr[this.index1].cntPoint[this.idx0].y
        cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = pointArr[this.index1].cntPoint[this.idx1].x
        y = pointArr[this.index1].cntPoint[this.idx1].y
        cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = pointArr[this.index2].cntPoint[this.idx2].x
        y = pointArr[this.index2].cntPoint[this.idx2].y
        cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = pointArr[this.index2].cntPoint[this.idx3].x
        y = pointArr[this.index2].cntPoint[this.idx3].y
        cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })

      }

    }

    //缺失  補正中間
    //反之  補正旁邊
    if (centerLack) {

      if (horizontal) {
        if (centerLackValue > 1) {
          LackOneCenter = new LackRectangle(0, 1, 1, 2, 0, 3);
          //console.log('centerlack 水平 0 1')
        } else {
          LackOneCenter = new LackRectangle(1, 2, 1, 2, 0, 3);
          //console.log('centerlack 水平 1 2')
        }
      } else {

        if (centerLackValue > 1) {
          LackOneCenter = new LackRectangle(0, 1, 2, 3, 0, 1);
          //console.log('centerlack 垂直 0 1')
        } else {
          LackOneCenter = new LackRectangle(1, 2, 2, 3, 0, 1);
          //console.log('centerlack 垂直 1 2')
        }
      }


      LackOneCenter.calcCenterRectangle();


    } else {


      if (horizontal) {
        if (degree == 0 || degree == 180) {

          if (resultX < videoWidth / 2) {
            LackOneCenter = new LackRectangle(2, null, 0, 1, 3, 2);
            console.log('水平 補右邊')
          } else if (resultX > videoWidth / 2) {
            LackOneCenter = new LackRectangle(0, null, 1, 0, 2, 3);
            console.log('水平 補左邊')
          }

        } else if (degree == 90 || degree == 270) {

          if (resultX < videoHeight / 2) {
            LackOneCenter = new LackRectangle(2, null, 0, 1, 3, 2);
            console.log('水平 補右邊')
          } else if (resultX > videoHeight / 2) {
            LackOneCenter = new LackRectangle(0, null, 1, 0, 2, 3);
            console.log('水平 補左邊')
          }

        }

      } else {

        if (degree == 0 || degree == 180) {

          if (resultY < videoHeight / 2) {
            LackOneCenter = new LackRectangle(2, null, 1, 2, 0, 3);
            console.log('垂直 補下邊')
          } else if (resultY > videoHeight / 2) {
            LackOneCenter = new LackRectangle(0, null, 2, 1, 3, 0);
            console.log('垂直 補上邊')
          }

        } else if (degree == 90 || degree == 270) {

          if (resultY < videoWidth / 2) {
            LackOneCenter = new LackRectangle(2, null, 1, 2, 0, 3);
            console.log('垂直 補下邊')
          } else if (resultY > videoWidth / 2) {
            LackOneCenter = new LackRectangle(0, null, 2, 1, 3, 0);
            console.log('垂直 補上邊')
          }

        }

      }
      console.log(LackOneCenter)
      LackOneCenter.calcSideRectangle()

    }

    newPointArr.push(calcCntInfo(LackOneCenter.cntPoint));
    newPointArr.sort(function (a, b) {
      return (a.cntInfo.boundingRect.x + a.cntInfo.boundingRect.y) - (b.cntInfo.boundingRect.x + b.cntInfo.boundingRect.y);
    });
    pointArr = AllSortRectangleV2(newPointArr, drawDst)

  }

  let TwoRectangle = function () {

    let newPointArr = [...pointArr];
    let tiedSticky = false;
    let intervalBig = false;
    let intervalSmall = false;

    let LackTwoRect = function () {

      let x, y;

      this.cntPoint = [];
      this.cntPointArr = [];
      this.side = '';
      this.sideIndex = '';

      this.intervalBigCalc = function (idx1, idx2, idx3, idx4) {

        // 0 1 2 3
        // 1 2 3 0
        x = (pointArr[1].cntPoint[idx1].x)
        y = (pointArr[1].cntPoint[idx1].y)
        cv.circle(drawDst, new cv.Point(x, y), 25, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (pointArr[1].cntPoint[idx4].x)
        y = (pointArr[1].cntPoint[idx4].y)
        cv.circle(drawDst, new cv.Point(x, y), 25, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (pointArr[0].cntPoint[idx1].x + pointArr[1].cntPoint[idx2].x) / 2
        y = (pointArr[0].cntPoint[idx1].y + pointArr[1].cntPoint[idx2].y) / 2
        cv.circle(drawDst, new cv.Point(x, y), 25, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (pointArr[0].cntPoint[idx3].x + pointArr[1].cntPoint[idx4].x) / 2
        y = (pointArr[0].cntPoint[idx3].y + pointArr[1].cntPoint[idx4].y) / 2
        cv.circle(drawDst, new cv.Point(x, y), 25, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })

        this.cntPointArr.push(this.cntPoint)
        this.cntPoint = [];

        x = (pointArr[0].cntPoint[idx2].x)
        y = (pointArr[0].cntPoint[idx2].y)
        cv.circle(drawDst, new cv.Point(x, y), 20, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (pointArr[0].cntPoint[idx3].x)
        y = (pointArr[0].cntPoint[idx3].y)
        cv.circle(drawDst, new cv.Point(x, y), 20, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (pointArr[0].cntPoint[idx1].x + pointArr[1].cntPoint[idx2].x) / 2
        y = (pointArr[0].cntPoint[idx1].y + pointArr[1].cntPoint[idx2].y) / 2
        cv.circle(drawDst, new cv.Point(x, y), 20, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (pointArr[0].cntPoint[idx3].x + pointArr[1].cntPoint[idx4].x) / 2
        y = (pointArr[0].cntPoint[idx3].y + pointArr[1].cntPoint[idx4].y) / 2
        cv.circle(drawDst, new cv.Point(x, y), 20, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })

        this.cntPointArr.push(this.cntPoint)
        this.cntPoint = [];

      }

      this.intervalSmallCalc = function () {

        let firstIndex = 0;
        let secondIndex = 1;
        let fIdx0, fIdx1, sIdx0, sIdx1;
        let p1, p2, p3, p4;
        let x, y;
        let m = 2,
          n = 1;

        if (this.side == 'right' || this.side == 'left') {

          fIdx0 = 1;
          fIdx1 = 2;
          sIdx0 = 0;
          sIdx1 = 3;
          // 0 -> 1 2
          // 1 -> 0 3

          if (this.sideIndex) {
            //0 1 3 2
            p1 = 0, p2 = 1, p3 = 3, p4 = 2;
          } else {
            //1 0 2 3
            p1 = 1, p2 = 0, p3 = 2, p4 = 3;
          }

        } else if (this.side == 'top' || this.side == 'bottom') {

          fIdx0 = 2;
          fIdx1 = 3;
          sIdx0 = 0;
          sIdx1 = 1;
          // 0 -> 2 3
          // 1 -> 0 1
          if (this.sideIndex) {
            //1 2 0 3
            p1 = 1, p2 = 2, p3 = 0, p4 = 3;
          } else {
            //2 1 3 0
            p1 = 2, p2 = 1, p3 = 3, p4 = 0;
          }

        }

        x = (pointArr[firstIndex].cntPoint[fIdx0].x)
        y = (pointArr[firstIndex].cntPoint[fIdx0].y)
        cv.circle(drawDst, new cv.Point(x, y), 25, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (pointArr[firstIndex].cntPoint[fIdx1].x)
        y = (pointArr[firstIndex].cntPoint[fIdx1].y)
        cv.circle(drawDst, new cv.Point(x, y), 25, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (pointArr[secondIndex].cntPoint[sIdx0].x)
        y = (pointArr[secondIndex].cntPoint[sIdx0].y)
        cv.circle(drawDst, new cv.Point(x, y), 25, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        x = (pointArr[secondIndex].cntPoint[sIdx1].x)
        y = (pointArr[secondIndex].cntPoint[sIdx1].y)
        cv.circle(drawDst, new cv.Point(x, y), 25, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPoint.push({ 'x': x, 'y': y })
        this.cntPointArr.push(this.cntPoint)
        this.cntPoint = [];

        x = pointArr[this.sideIndex].cntPoint[p2].x
        y = pointArr[this.sideIndex].cntPoint[p2].y
        this.cntPoint.push({ 'x': x, 'y': y })
        cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        x = pointArr[this.sideIndex].cntPoint[p4].x
        y = pointArr[this.sideIndex].cntPoint[p4].y
        this.cntPoint.push({ 'x': x, 'y': y })
        cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        x = (m * pointArr[this.sideIndex].cntPoint[p2].x - n * pointArr[this.sideIndex].cntPoint[p1].x) / (m - n)
        y = (m * pointArr[this.sideIndex].cntPoint[p2].y - n * pointArr[this.sideIndex].cntPoint[p1].y) / (m - n)
        this.cntPoint.push({ 'x': x, 'y': y })
        cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        x = (m * pointArr[this.sideIndex].cntPoint[p4].x - n * pointArr[this.sideIndex].cntPoint[p3].x) / (m - n)
        y = (m * pointArr[this.sideIndex].cntPoint[p4].y - n * pointArr[this.sideIndex].cntPoint[p3].y) / (m - n)
        this.cntPoint.push({ 'x': x, 'y': y })
        cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
        this.cntPointArr.push(this.cntPoint)
        this.cntPoint = [];


      }

      this.intervalTiedStickyCalc = function (diect, index0, index1) {


        if (diect == 'center') {

          let m = 2,
            n = 1;
          let index = index0[0];
          let p1 = index0[1],
            p2 = index0[2],
            p3 = index0[3],
            p4 = index0[4];

          x = (m * pointArr[index].cntPoint[p2].x - n * pointArr[index].cntPoint[p1].x) / (m - n)
          y = (m * pointArr[index].cntPoint[p2].y - n * pointArr[index].cntPoint[p1].y) / (m - n)
          this.cntPoint.push({ 'x': x, 'y': y })
          cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
          x = (m * pointArr[index].cntPoint[p4].x - n * pointArr[index].cntPoint[p3].x) / (m - n)
          y = (m * pointArr[index].cntPoint[p4].y - n * pointArr[index].cntPoint[p3].y) / (m - n)
          this.cntPoint.push({ 'x': x, 'y': y })
          cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
          x = (pointArr[index].cntPoint[p2].x)
          y = (pointArr[index].cntPoint[p2].y)
          this.cntPoint.push({ 'x': x, 'y': y })
          cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
          x = (pointArr[index].cntPoint[p4].x)
          y = (pointArr[index].cntPoint[p4].y)
          this.cntPoint.push({ 'x': x, 'y': y })
          cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
          this.cntPointArr.push(this.cntPoint)
          this.cntPoint = [];

          index = index1[0];
          p1 = index1[1], p2 = index1[2], p3 = index1[3], p4 = index1[4];
          // 0 1 3 2
          x = (m * pointArr[index].cntPoint[p2].x - n * pointArr[index].cntPoint[p1].x) / (m - n)
          y = (m * pointArr[index].cntPoint[p2].y - n * pointArr[index].cntPoint[p1].y) / (m - n)
          this.cntPoint.push({ 'x': x, 'y': y })
          cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
          x = (m * pointArr[index].cntPoint[p4].x - n * pointArr[index].cntPoint[p3].x) / (m - n)
          y = (m * pointArr[index].cntPoint[p4].y - n * pointArr[index].cntPoint[p3].y) / (m - n)
          this.cntPoint.push({ 'x': x, 'y': y })
          cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
          x = (pointArr[index].cntPoint[p2].x)
          y = (pointArr[index].cntPoint[p2].y)
          this.cntPoint.push({ 'x': x, 'y': y })
          cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
          x = (pointArr[index].cntPoint[p4].x)
          y = (pointArr[index].cntPoint[p4].y)
          this.cntPoint.push({ 'x': x, 'y': y })
          cv.circle(drawDst, new cv.Point(x, y), 10, new cv.Scalar(255, 255, 0), 1, cv.LINE_AA, 0)
          this.cntPointArr.push(this.cntPoint)
          this.cntPoint = [];

        } else if (diect == 'right' || diect == 'left' || diect == 'top' || diect == 'bottom') {

          let p1 = index0[1],
            p2 = index0[2],
            p3 = index0[3],
            p4 = index0[4];
          let index = index0[0];

          for (let f = 3; f > 1; f--) {

            let m = f,
              n = f - 1;


            x = (m * pointArr[index].cntPoint[p2].x - n * pointArr[index].cntPoint[p1].x) / (m - n)
            y = (m * pointArr[index].cntPoint[p2].y - n * pointArr[index].cntPoint[p1].y) / (m - n)
            cv.circle(drawDst, new cv.Point(x, y), 30, new cv.Scalar(255, 255, 0), 2, cv.LINE_AA, 0);
            this.cntPoint.push({ 'x': x, 'y': y })

            x = (m * pointArr[index].cntPoint[p4].x - n * pointArr[index].cntPoint[p3].x) / (m - n)
            y = (m * pointArr[index].cntPoint[p4].y - n * pointArr[index].cntPoint[p3].y) / (m - n)
            cv.circle(drawDst, new cv.Point(x, y), 30, new cv.Scalar(255, 255, 0), 2, cv.LINE_AA, 0);

            this.cntPoint.push({ 'x': x, 'y': y })


            if (f == 2) {
              this.cntPointArr.push(this.cntPoint)
              this.cntPoint = []

              x = (m * pointArr[index].cntPoint[p2].x - n * pointArr[index].cntPoint[p1].x) / (m - n)
              y = (m * pointArr[index].cntPoint[p2].y - n * pointArr[index].cntPoint[p1].y) / (m - n)
              this.cntPoint.push({ 'x': x, 'y': y })
              cv.circle(drawDst, new cv.Point(x, y), 20, new cv.Scalar(255, 255, 0), 2, cv.LINE_AA, 0);

              x = (m * pointArr[index].cntPoint[p4].x - n * pointArr[index].cntPoint[p3].x) / (m - n)
              y = (m * pointArr[index].cntPoint[p4].y - n * pointArr[index].cntPoint[p3].y) / (m - n)
              this.cntPoint.push({ 'x': x, 'y': y })
              cv.circle(drawDst, new cv.Point(x, y), 20, new cv.Scalar(255, 255, 0), 2, cv.LINE_AA, 0);

              x = pointArr[index].cntPoint[p2].x
              y = pointArr[index].cntPoint[p2].y
              this.cntPoint.push({ 'x': x, 'y': y })
              cv.circle(drawDst, new cv.Point(x, y), 20, new cv.Scalar(255, 255, 0), 2, cv.LINE_AA, 0);


              x = pointArr[index].cntPoint[p4].x
              y = pointArr[index].cntPoint[p4].y
              this.cntPoint.push({ 'x': x, 'y': y })
              cv.circle(drawDst, new cv.Point(x, y), 20, new cv.Scalar(255, 255, 0), 2, cv.LINE_AA, 0);

              this.cntPointArr.push(this.cntPoint)
              this.cntPoint = []

            }
          }
        }
      }
    }

    let filterClass = function () {

      let p1, p2;

      if (horizontal) {
        p1 = 0;
        p2 = 1;
      } else {
        p1 = 1;
        p2 = 2;
      }

      //console.log(horizontal, p1, p2)

      pointArr.forEach(function (ele, idx) {

        let distance = Math.sqrt(Math.pow(ele.cntInfo.center.x - resultX, 2) + Math.pow(ele.cntInfo.center.y - resultY, 2))
        let length = Math.sqrt(Math.pow(ele.cntPoint[p1].x - ele.cntPoint[p2].x, 2) + Math.pow(ele.cntPoint[p1].y - ele.cntPoint[p2].y, 2))


        cv.circle(drawDst, new cv.Point(ele.cntPoint[p1].x, ele.cntPoint[p1].y), 10, new cv.Scalar(255, 255, 255), 6, cv.LINE_AA, 0);
        cv.circle(drawDst, new cv.Point(ele.cntPoint[p2].x, ele.cntPoint[p2].y), 10, new cv.Scalar(255, 255, 255), 6, cv.LINE_AA, 0);


        if ((distance / length) > 1.45) {
          //console.log('intervalBig')
          intervalBig = true;
        } else if ((distance / length) > 0.95) {
          //console.log('intervalSmall')
          intervalSmall = true
        } else if ((distance / length) > 0.45) {
          //console.log('tiedSticky')
          tiedSticky = true
        }

      });


    }

    let run = function () {


      let twoLack = new LackTwoRect();

      if (intervalBig) {

        if (horizontal) {
          twoLack.intervalBigCalc(0, 1, 2, 3)
        } else {
          twoLack.intervalBigCalc(1, 2, 3, 0)
        }

        newPointArr.push(calcCntInfo(twoLack.cntPointArr[0]));
        newPointArr.push(calcCntInfo(twoLack.cntPointArr[1]));

        pointArr = AllSortRectangleV2(newPointArr, drawDst)


      } else if (intervalSmall) {

        if (horizontal) {
          if (degree == 0 || degree == 180) {

            if (resultX < videoWidth / 2) {

              twoLack.side = 'right'
              twoLack.sideIndex = 1;
              console.log('紙張水平 畫面水平 補右邊')
            } else if (resultX > videoWidth / 2) {


              twoLack.side = 'left'
              twoLack.sideIndex = 0;
              console.log('紙張水平 畫面水平 補左邊')
            }

          } else if (degree == 90 || degree == 270) {

            if (resultY < videoHeight / 2) {

              twoLack.side = 'right'
              twoLack.sideIndex = 1;
              console.log('紙張水平 畫面垂直 補右邊')
            } else if (resultY > videoHeight / 2) {


              twoLack.side = 'left'
              twoLack.sideIndex = 0;
              console.log('紙張水平 畫面垂直 補左邊')
            }

          }

        } else {

          if (degree == 0 || degree == 180) {

            if (resultY < videoHeight / 2) {

              twoLack.side = 'bottom';
              twoLack.sideIndex = 1;
              console.log('紙張垂直 畫面水平 補下邊')
            } else if (resultY > videoHeight / 2) {


              twoLack.side = 'top';
              twoLack.sideIndex = 0;
              console.log('紙張垂直 畫面水平 補上邊')
            }

          } else if (degree == 90 || degree == 270) {

            if (resultY < videoWidth / 2) {

              twoLack.side = 'bottom';
              twoLack.sideIndex = 1;
              console.log('紙張垂直 畫面垂直 補下邊')

            } else if (resultY > videoWidth / 2) {

              twoLack.side = 'top';
              twoLack.sideIndex = 0;
              console.log('紙張垂直 畫面垂直 補上邊')
            }

          }

        }

        console.log(twoLack.side, twoLack.sideIndex)

        twoLack.intervalSmallCalc();
        newPointArr.push(calcCntInfo(twoLack.cntPointArr[0]));
        newPointArr.push(calcCntInfo(twoLack.cntPointArr[1]));

        pointArr = AllSortRectangleV2(newPointArr, drawDst)

      } else if (tiedSticky) {

        let x1;
        let x2;
        let z1;
        let z2;

        if (degree == 90 || degree == 270) {

          let tmpw = videoHeight
          let tmph = videoWidth
          x1 = tmpw / 2 - 100;
          x2 = tmph / 2 - 100;
          z1 = tmpw / 2 + 100;
          z2 = tmph / 2 + 100;

        } else {

          x1 = videoWidth / 2 - 100;
          x2 = videoHeight / 2 - 100;
          z1 = videoWidth / 2 + 100;
          z2 = videoHeight / 2 + 100;
        }


        if (resultX > x1 && resultX < z1 && resultY > x2 && resultY < z2) {

          if (horizontal) {

            let index0 = [0, 1, 0, 2, 3];
            let index1 = [1, 0, 1, 3, 2];
            twoLack.intervalTiedStickyCalc('center', index0, index1);
            // 0 -> 1 0
            // 0 -> 2 3
            // 1 -> 0 1
            // 1 -> 3 2

          } else {

            let index0 = [0, 2, 1, 3, 0];
            let index1 = [1, 0, 3, 1, 2];
            twoLack.intervalTiedStickyCalc('center', index0, index1);
            // 0 -> 2 1
            // 0 -> 3 0
            // 1 -> 0 3
            // 1 -> 1 2

          }

        } else {

          if (horizontal) {

            if (resultX < x1) {

              let index0 = [1, 0, 1, 3, 2];
              twoLack.intervalTiedStickyCalc('right', index0, null);
              console.log('hr')
            } else if (resultX > z1) {

              let index0 = [0, 1, 0, 2, 3];
              twoLack.intervalTiedStickyCalc('left', index0, null);
              console.log('hl')
            } else {

              let index0 = [0, 1, 0, 2, 3];
              let index1 = [1, 0, 1, 3, 2];
              twoLack.intervalTiedStickyCalc('center', index0, index1);
              console.log('hc')
            }

          } else {

            if (resultY > z2) {

              let index0 = [0, 2, 1, 3, 0];
              twoLack.intervalTiedStickyCalc('top', index0, null);
              console.log('vt')
            } else if (resultY < x2) {

              console.log('vb')
              let index0 = [1, 1, 2, 0, 3];
              twoLack.intervalTiedStickyCalc('bottom', index0, null);
            } else {

              let index0 = [0, 2, 1, 3, 0];
              let index1 = [1, 0, 3, 1, 2];
              twoLack.intervalTiedStickyCalc('center', index0, index1);
              console.log('vc')
            }
          }
        }

        newPointArr.push(calcCntInfo(twoLack.cntPointArr[0]));
        newPointArr.push(calcCntInfo(twoLack.cntPointArr[1]));

        pointArr = AllSortRectangleV2(newPointArr, drawDst)

      }

    }


    filterClass();

    run();


  }

  if (resultNum === 3) {

    OneRectangle();

  } else if (resultNum === 2) {

    TwoRectangle();

  }

  return pointArr
}

function A4_sheet(A4_sheet_point, resultX, resultY) {
  let pointArr = A4_sheet_point
  let quadrant = [1, 2, 3, 4];
  let Horizontal = false;
  let vertical = false;
  let missRight = false;
  let missLeft = false;
  let missTop = false;
  let missBottom = false;

  //計算有的的象限 判斷缺失象限
  if (pointArr.length == 3) {

    for (let j = 0; j < pointArr.length; j++) {
      let x = pointArr[j].cntInfo.center.x
      let y = pointArr[j].cntInfo.center.y

      if (x < resultX && y < resultY) {
        let index = quadrant.indexOf(2);
        quadrant.splice(index, 1);
        //console.log("2象限")
      } else if (x > resultX && y < resultY) {
        let index = quadrant.indexOf(1);
        quadrant.splice(index, 1);
        //console.log("1象限")
      } else if (x < resultX && y > resultY) {
        let index = quadrant.indexOf(3);
        quadrant.splice(index, 1);
        //console.log("3象限")
      } else if (x > resultX && y > resultY) {
        let index = quadrant.indexOf(4);
        quadrant.splice(index, 1);
        //console.log("4象限")
      }
    }
  } else if (pointArr.length == 2) {

    for (let j = 0; j < pointArr.length; j++) {
      let x = pointArr[j].cntInfo.center.x
      let y = pointArr[j].cntInfo.center.y
      let tmp_x_1 = resultX + 75;
      let tmp_x_2 = resultX - 75;
      let tmp_y_1 = resultY + 75;
      let tmp_y_2 = resultY - 75;
      if (tmp_x_1 > x && tmp_x_2 < x) {
        console.log('垂直')
        //缺右側 反之 缺左側
        if (resultX < videoWidth / 2) {
          missRight = true
        } else {
          missLeft = true
        }
        Horizontal = true
      } else if (tmp_y_1 > y && tmp_y_2 < y) {
        console.log('水平')
        //缺上側 反之 缺下側
        if (resultY < videoHeight / 2) {
          missBottom = true
        } else {
          missTop = true
        }
        vertical = true;
      } else {
        if (x < resultX && y < resultY) {
          let index = quadrant.indexOf(2);
          quadrant.splice(index, 1);
          console.log("2象限")
        } else if (x > resultX && y < resultY) {
          let index = quadrant.indexOf(1);
          quadrant.splice(index, 1);
          console.log("1象限")
        } else if (x < resultX && y > resultY) {
          let index = quadrant.indexOf(3);
          quadrant.splice(index, 1);
          console.log("3象限")
        } else if (x > resultX && y > resultY) {
          let index = quadrant.indexOf(4);
          quadrant.splice(index, 1);
          console.log("4象限")
        }
      }
    }
  }

  //計算對角點
  let p1, p2, p3, p4, a1, b1, c1, a2, b2, c2, det;
  let Intersection = function () {
    a1 = p2.y - p1.y;
    b1 = p1.x - p2.x;
    c1 = p1.x * p2.y - p2.x * p1.y;
    a2 = p4.y - p3.y;
    b2 = p3.x - p4.x;
    c2 = p3.x * p4.y - p4.x * p3.y;
    det = a1 * b2 - a2 * b1;
  }

  //得出缺失的象限 缺一個 或是 缺兩個(對角) 進行補正
  if (quadrant.length == 1) {

    let newPointArr = [...pointArr];
    let missQuadrant = quadrant[0];
    let finalArray = [];
    let cntPoint = [];
    let cntPush = function (index) {

      cntPoint.push({ 'x': pointArr[0].cntPoint[index].x, 'y': pointArr[0].cntPoint[index].y })
      cntPoint.push({ 'x': pointArr[1].cntPoint[index].x, 'y': pointArr[1].cntPoint[index].y })
      cntPoint.push({ 'x': pointArr[2].cntPoint[index].x, 'y': pointArr[2].cntPoint[index].y })

    }

    switch (missQuadrant) {
      case 1:

        if (missQuadrant == 1)
          cntPush(1)

        p1 = { 'x': pointArr[0].cntPoint[0].x, 'y': pointArr[0].cntPoint[0].y }
        p2 = { 'x': pointArr[0].cntPoint[1].x, 'y': pointArr[0].cntPoint[1].y }
        p3 = { 'x': pointArr[2].cntPoint[1].x, 'y': pointArr[2].cntPoint[1].y }
        p4 = { 'x': pointArr[2].cntPoint[2].x, 'y': pointArr[2].cntPoint[2].y }
        Intersection();

        break;

      case 2:

        if (missQuadrant == 2)
          cntPush(0)


        pointArr.sort(function (a, b) {

          let X1 = 0;
          let Y1 = videoHeight;

          let aX2 = a.cntInfo.center.x
          let aY2 = a.cntInfo.center.y;
          let lineHeighta = Math.sqrt(((aX2 - X1) * (aX2 - X1)) + ((aY2 - Y1) * (aY2 - Y1)))

          let bX2 = b.cntInfo.center.x
          let bY2 = b.cntInfo.center.y;
          let lineHeightb = Math.sqrt(((bX2 - X1) * (bX2 - X1)) + ((bY2 - Y1) * (bY2 - Y1)))

          return lineHeighta - lineHeightb;

        });

        p1 = { 'x': pointArr[0].cntPoint[0].x, 'y': pointArr[0].cntPoint[0].y }
        p2 = { 'x': pointArr[0].cntPoint[3].x, 'y': pointArr[0].cntPoint[3].y }
        p3 = { 'x': pointArr[2].cntPoint[0].x, 'y': pointArr[2].cntPoint[0].y }
        p4 = { 'x': pointArr[2].cntPoint[1].x, 'y': pointArr[2].cntPoint[1].y }


        Intersection();

        break;
      case 3:

        if (missQuadrant == 3)
          cntPush(3)

        p1 = { 'x': pointArr[0].cntPoint[0].x, 'y': pointArr[0].cntPoint[0].y }
        p2 = { 'x': pointArr[0].cntPoint[3].x, 'y': pointArr[0].cntPoint[3].y }
        p3 = { 'x': pointArr[2].cntPoint[2].x, 'y': pointArr[2].cntPoint[2].y }
        p4 = { 'x': pointArr[2].cntPoint[3].x, 'y': pointArr[2].cntPoint[3].y }
        Intersection();


        break;
      case 4:

        if (missQuadrant == 4)
          cntPush(2)

        p1 = { 'x': pointArr[1].cntPoint[1].x, 'y': pointArr[1].cntPoint[1].y }
        p2 = { 'x': pointArr[1].cntPoint[2].x, 'y': pointArr[1].cntPoint[2].y }
        p3 = { 'x': pointArr[2].cntPoint[3].x, 'y': pointArr[2].cntPoint[3].y }
        p4 = { 'x': pointArr[2].cntPoint[2].x, 'y': pointArr[2].cntPoint[2].y }
        Intersection();

        break;
    }


    cntPoint.push({ 'x': (c1 * b2 - c2 * b1) / det, 'y': (a1 * c2 - a2 * c1) / det })
    //計算缺失象限
    finalArray = calcCntInfo(cntPoint)
    newPointArr.push(finalArray)

    newPointArr.sort(function (a, b) {
      return (a.cntInfo.boundingRect.x + a.cntInfo.boundingRect.y) - (b.cntInfo.boundingRect.x + b.cntInfo.boundingRect.y);
    });

    pointArr = newPointArr

  } else if (quadrant.length == 2) {
    let cntPoint = [];

    if (pointArr[0].cntInfo.center.x > pointArr[1].cntInfo.center.x) {
      let temp = pointArr[0]
      pointArr[0] = pointArr[1]
      pointArr[1] = temp
    }

    let newPointArr = [...pointArr];
    let finalArray = [];

    console.log(newPointArr)
    //對角
    if (!(Horizontal) && !(vertical)) {

      let diagonal = function () {

        if (quadrant[0] == 1 && quadrant[1] == 3) {
          //計算第3象限
          cntPoint.push({ 'x': pointArr[0].cntPoint[3].x, 'y': pointArr[0].cntPoint[3].y })
          cntPoint.push({ 'x': pointArr[0].cntPoint[2].x, 'y': pointArr[0].cntPoint[2].y })
          cntPoint.push({ 'x': pointArr[1].cntPoint[3].x, 'y': pointArr[1].cntPoint[3].y })
          p1 = { 'x': pointArr[0].cntPoint[0].x, 'y': pointArr[0].cntPoint[0].y }
          p2 = { 'x': pointArr[0].cntPoint[3].x, 'y': pointArr[0].cntPoint[3].y }
          p3 = { 'x': pointArr[1].cntPoint[2].x, 'y': pointArr[1].cntPoint[2].y }
          p4 = { 'x': pointArr[1].cntPoint[3].x, 'y': pointArr[1].cntPoint[3].y }
          Intersection();
          cntPoint.push({ 'x': (c1 * b2 - c2 * b1) / det, 'y': (a1 * c2 - a2 * c1) / det })

          finalArray = calcCntInfo(cntPoint, 4)
          newPointArr.push(finalArray)

          finalArray = []
          cntPoint = []

          //計算第1象限
          cntPoint.push({ 'x': pointArr[0].cntPoint[1].x, 'y': pointArr[0].cntPoint[1].y })
          cntPoint.push({ 'x': pointArr[0].cntPoint[2].x, 'y': pointArr[0].cntPoint[2].y })
          cntPoint.push({ 'x': pointArr[1].cntPoint[1].x, 'y': pointArr[1].cntPoint[1].y })
          p1 = { 'x': pointArr[0].cntPoint[0].x, 'y': pointArr[0].cntPoint[0].y }
          p2 = { 'x': pointArr[0].cntPoint[1].x, 'y': pointArr[0].cntPoint[1].y }
          p3 = { 'x': pointArr[1].cntPoint[1].x, 'y': pointArr[1].cntPoint[1].y }
          p4 = { 'x': pointArr[1].cntPoint[2].x, 'y': pointArr[1].cntPoint[2].y }
          Intersection();
          cntPoint.push({ 'x': (c1 * b2 - c2 * b1) / det, 'y': (a1 * c2 - a2 * c1) / det })

          finalArray = calcCntInfo(cntPoint, 3)
          newPointArr.push(finalArray)
          console.log(newPointArr)
          newPointArr.sort(function (a, b) {
            return (a.cntInfo.boundingRect.x + a.cntInfo.boundingRect.y) - (b.cntInfo.boundingRect.x + b.cntInfo.boundingRect.y);
          });

        } else if (quadrant[0] == 2 && quadrant[1] == 4) {

          //計算第2象限
          p1 = { 'x': pointArr[0].cntPoint[0].x, 'y': pointArr[0].cntPoint[0].y }
          p2 = { 'x': pointArr[0].cntPoint[3].x, 'y': pointArr[0].cntPoint[3].y }
          p3 = { 'x': pointArr[1].cntPoint[0].x, 'y': pointArr[1].cntPoint[0].y }
          p4 = { 'x': pointArr[1].cntPoint[1].x, 'y': pointArr[1].cntPoint[1].y }
          Intersection();
          cntPoint.push({ 'x': (c1 * b2 - c2 * b1) / det, 'y': (a1 * c2 - a2 * c1) / det })

          cntPoint.push({ 'x': pointArr[1].cntPoint[0].x, 'y': pointArr[1].cntPoint[0].y })
          cntPoint.push({ 'x': pointArr[1].cntPoint[3].x, 'y': pointArr[1].cntPoint[3].y })
          cntPoint.push({ 'x': pointArr[0].cntPoint[0].x, 'y': pointArr[0].cntPoint[0].y })

          finalArray = calcCntInfo(cntPoint, 4)
          newPointArr.push(finalArray)

          finalArray = []
          cntPoint = []

          //計算第4象限
          cntPoint.push({ 'x': pointArr[0].cntPoint[1].x, 'y': pointArr[0].cntPoint[1].y })
          cntPoint.push({ 'x': pointArr[1].cntPoint[2].x, 'y': pointArr[1].cntPoint[2].y })

          p1 = { 'x': pointArr[0].cntPoint[2].x, 'y': pointArr[0].cntPoint[2].y }
          p2 = { 'x': pointArr[0].cntPoint[3].x, 'y': pointArr[0].cntPoint[3].y }
          p3 = { 'x': pointArr[1].cntPoint[1].x, 'y': pointArr[1].cntPoint[1].y }
          p4 = { 'x': pointArr[1].cntPoint[2].x, 'y': pointArr[1].cntPoint[2].y }
          Intersection();
          cntPoint.push({ 'x': (c1 * b2 - c2 * b1) / det, 'y': (a1 * c2 - a2 * c1) / det })

          cntPoint.push({ 'x': pointArr[0].cntPoint[2].x, 'y': pointArr[0].cntPoint[2].y })

          finalArray = calcCntInfo(cntPoint, 3)
          newPointArr.push(finalArray)
          console.log(newPointArr)
          newPointArr.sort(function (a, b) {
            return (a.cntInfo.boundingRect.x + a.cntInfo.boundingRect.y) - (b.cntInfo.boundingRect.x + b.cntInfo.boundingRect.y);
          });

        }
      }

      diagonal()


    }

    pointArr = newPointArr

  }

  //得出缺失的象限 垂直 進行補正
  if (Horizontal) {

    let cntPoint = [];
    let newPointArr = [...pointArr];
    let finalArray = [];

    if (missRight) {

      //計算第1象限
      for (let index = 0; index < pointArr[0].cntPoint.length; index++) {
        if (index == 0) {
          cntPoint.push({ 'x': pointArr[0].cntPoint[1].x, 'y': pointArr[0].cntPoint[1].y })
          let p1 = 2 * pointArr[0].cntPoint[1].x - 1 * pointArr[0].cntPoint[0].x / 1
          let p2 = 2 * pointArr[0].cntPoint[1].y - 1 * pointArr[0].cntPoint[0].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        } else if (index == 2) {
          cntPoint.push({ 'x': pointArr[0].cntPoint[2].x, 'y': pointArr[0].cntPoint[2].y })
          let p1 = 2 * pointArr[0].cntPoint[2].x - 1 * pointArr[0].cntPoint[3].x / 1
          let p2 = 2 * pointArr[0].cntPoint[2].y - 1 * pointArr[0].cntPoint[3].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        }
      }

      finalArray = calcCntInfo(cntPoint, 4)
      newPointArr.push(finalArray)

      finalArray = []
      cntPoint = []

      //計算第4象限
      for (let index = 0; index < pointArr[1].cntPoint.length; index++) {
        if (index == 0) {
          cntPoint.push({ 'x': pointArr[1].cntPoint[1].x, 'y': pointArr[1].cntPoint[1].y })
          let p1 = 2 * pointArr[1].cntPoint[1].x - 1 * pointArr[1].cntPoint[0].x / 1
          let p2 = 2 * pointArr[1].cntPoint[1].y - 1 * pointArr[1].cntPoint[0].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        } else if (index == 2) {
          cntPoint.push({ 'x': pointArr[1].cntPoint[2].x, 'y': pointArr[1].cntPoint[2].y })
          let p1 = 2 * pointArr[1].cntPoint[2].x - 1 * pointArr[1].cntPoint[3].x / 1
          let p2 = 2 * pointArr[1].cntPoint[2].y - 1 * pointArr[1].cntPoint[3].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        }
      }

      finalArray = calcCntInfo(cntPoint, 4)
      newPointArr.push(finalArray)

      newPointArr.sort(function (a, b) {
        return (a.cntInfo.boundingRect.x + a.cntInfo.boundingRect.y) - (b.cntInfo.boundingRect.x + b.cntInfo.boundingRect.y);
      });


    } else if (missLeft) {

      //計算第2象限
      for (let index = 0; index < pointArr[0].cntPoint.length; index++) {
        if (index == 0) {
          cntPoint.push({ 'x': pointArr[0].cntPoint[0].x, 'y': pointArr[0].cntPoint[0].y })
          let p1 = 2 * pointArr[0].cntPoint[0].x - 1 * pointArr[0].cntPoint[1].x / 1
          let p2 = 2 * pointArr[0].cntPoint[0].y - 1 * pointArr[0].cntPoint[1].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })

        } else if (index == 2) {
          cntPoint.push({ 'x': pointArr[0].cntPoint[3].x, 'y': pointArr[0].cntPoint[3].y })
          let p1 = 2 * pointArr[0].cntPoint[3].x - 1 * pointArr[0].cntPoint[2].x / 1
          let p2 = 2 * pointArr[0].cntPoint[3].y - 1 * pointArr[0].cntPoint[2].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        }
      }

      finalArray = calcCntInfo(cntPoint, 4)
      newPointArr.push(finalArray)

      finalArray = []
      cntPoint = []

      // //計算第3象限
      for (let index = 0; index < pointArr[1].cntPoint.length; index++) {
        if (index == 0) {
          cntPoint.push({ 'x': pointArr[1].cntPoint[0].x, 'y': pointArr[1].cntPoint[0].y })
          let p1 = 2 * pointArr[1].cntPoint[0].x - 1 * pointArr[1].cntPoint[1].x / 1
          let p2 = 2 * pointArr[1].cntPoint[0].y - 1 * pointArr[1].cntPoint[1].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })

        } else if (index == 2) {
          cntPoint.push({ 'x': pointArr[1].cntPoint[3].x, 'y': pointArr[1].cntPoint[3].y })
          let p1 = 2 * pointArr[1].cntPoint[3].x - 1 * pointArr[1].cntPoint[2].x / 1
          let p2 = 2 * pointArr[1].cntPoint[3].y - 1 * pointArr[1].cntPoint[2].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        }
      }

      finalArray = calcCntInfo(cntPoint, 4)
      newPointArr.push(finalArray)

      newPointArr.sort(function (a, b) {
        return (a.cntInfo.boundingRect.x + a.cntInfo.boundingRect.y) - (b.cntInfo.boundingRect.x + b.cntInfo.boundingRect.y);
      });

    }

    pointArr = newPointArr

  }

  //得出缺失的象限 水平 進行補正
  if (vertical) {

    let cntPoint = [];
    let newPointArr = [...pointArr];
    let finalArray = [];

    console.log(vertical)
    if (missTop) {


      for (let index = 0; index < pointArr[0].cntPoint.length; index++) {
        if (index == 0) {
          cntPoint.push({ 'x': pointArr[0].cntPoint[0].x, 'y': pointArr[0].cntPoint[0].y })
          let p1 = 2 * pointArr[0].cntPoint[0].x - 1 * pointArr[0].cntPoint[3].x / 1
          let p2 = 2 * pointArr[0].cntPoint[0].y - 1 * pointArr[0].cntPoint[3].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        } else if (index == 2) {
          cntPoint.push({ 'x': pointArr[0].cntPoint[1].x, 'y': pointArr[0].cntPoint[1].y })
          let p1 = 2 * pointArr[0].cntPoint[1].x - 1 * pointArr[0].cntPoint[2].x / 1
          let p2 = 2 * pointArr[0].cntPoint[1].y - 1 * pointArr[0].cntPoint[2].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        }
      }

      finalArray = calcCntInfo(cntPoint, 3)
      newPointArr.push(finalArray)

      finalArray = []
      cntPoint = []


      for (let index = 0; index < pointArr[1].cntPoint.length; index++) {
        if (index == 0) {
          cntPoint.push({ 'x': pointArr[1].cntPoint[0].x, 'y': pointArr[1].cntPoint[0].y })
          let p1 = 2 * pointArr[1].cntPoint[0].x - 1 * pointArr[1].cntPoint[3].x / 1
          let p2 = 2 * pointArr[1].cntPoint[0].y - 1 * pointArr[1].cntPoint[3].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        } else if (index == 2) {
          cntPoint.push({ 'x': pointArr[1].cntPoint[1].x, 'y': pointArr[1].cntPoint[1].y })
          let p1 = 2 * pointArr[1].cntPoint[1].x - 1 * pointArr[1].cntPoint[2].x / 1
          let p2 = 2 * pointArr[1].cntPoint[1].y - 1 * pointArr[1].cntPoint[2].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        }
      }

      finalArray = calcCntInfo(cntPoint, 4)
      newPointArr.push(finalArray)

      console.log(newPointArr)
      newPointArr.sort(function (a, b) {
        return (a.cntInfo.boundingRect.x + a.cntInfo.boundingRect.y) - (b.cntInfo.boundingRect.x + b.cntInfo.boundingRect.y);
      });


    } else if (missBottom) {

      for (let index = 0; index < pointArr[0].cntPoint.length; index++) {
        if (index == 0) {
          cntPoint.push({ 'x': pointArr[0].cntPoint[3].x, 'y': pointArr[0].cntPoint[3].y })
          let p1 = 2 * pointArr[0].cntPoint[3].x - 1 * pointArr[0].cntPoint[0].x / 1
          let p2 = 2 * pointArr[0].cntPoint[3].y - 1 * pointArr[0].cntPoint[0].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        } else if (index == 2) {
          cntPoint.push({ 'x': pointArr[0].cntPoint[2].x, 'y': pointArr[0].cntPoint[2].y })
          let p1 = 2 * pointArr[0].cntPoint[2].x - 1 * pointArr[0].cntPoint[1].x / 1
          let p2 = 2 * pointArr[0].cntPoint[2].y - 1 * pointArr[0].cntPoint[1].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        }
      }

      finalArray = calcCntInfo(cntPoint, 3)
      newPointArr.push(finalArray)

      finalArray = []
      cntPoint = []


      for (let index = 0; index < pointArr[1].cntPoint.length; index++) {
        if (index == 0) {
          cntPoint.push({ 'x': pointArr[1].cntPoint[3].x, 'y': pointArr[1].cntPoint[3].y })
          let p1 = 2 * pointArr[1].cntPoint[3].x - 1 * pointArr[1].cntPoint[0].x / 1
          let p2 = 2 * pointArr[1].cntPoint[3].y - 1 * pointArr[1].cntPoint[0].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        } else if (index == 2) {
          cntPoint.push({ 'x': pointArr[1].cntPoint[2].x, 'y': pointArr[1].cntPoint[2].y })
          let p1 = 2 * pointArr[1].cntPoint[2].x - 1 * pointArr[1].cntPoint[1].x / 1
          let p2 = 2 * pointArr[1].cntPoint[2].y - 1 * pointArr[1].cntPoint[1].y / 1
          cntPoint.push({ 'x': p1, 'y': p2 })
        }
      }

      finalArray = calcCntInfo(cntPoint, 4)
      newPointArr.push(finalArray)

      console.log(newPointArr)
      newPointArr.sort(function (a, b) {
        return (a.cntInfo.boundingRect.x + a.cntInfo.boundingRect.y) - (b.cntInfo.boundingRect.x + b.cntInfo.boundingRect.y);
      });


    }

    pointArr = newPointArr

  }

  return AllSortRectangleV2(pointArr);

}

function A8_sheet_ver2(A8_sheet_point, resultX, resultY) {

  let rectangle_point = A8_sheet_point;
  let horizon = false;
  let tempWidth = videoWidth;
  let tempHeight = videoHeight;
  let circle_range = 7,
    circle_thickness = 7,
    circle_color = new cv.Scalar(255, 0, 0, 255);

  if (degree == 90 || degree == 270) {
    tempWidth = videoHeight;
    tempHeight = videoWidth;
  }

  for (let k = 0; k < rectangle_point.length; k++) {
    const element = rectangle_point[k].cntInfo.angle;
    horizon = element < 50 ? false : true;
  }

  let three_rectangle_no_stick_calc = function (rectangle_1, rectangle_2) {

    let x = 0,
      y = 0,
      cntPoint = [];

    x = rectangle_1.square.cntPoint[rectangle_1.idx_1].x
    y = rectangle_1.square.cntPoint[rectangle_1.idx_1].y
    cntPoint.push({ 'x': x, 'y': y })
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
    x = rectangle_1.square.cntPoint[rectangle_1.idx_2].x
    y = rectangle_1.square.cntPoint[rectangle_1.idx_2].y
    cntPoint.push({ 'x': x, 'y': y })
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
    x = rectangle_2.square.cntPoint[rectangle_2.idx_1].x
    y = rectangle_2.square.cntPoint[rectangle_2.idx_1].y
    cntPoint.push({ 'x': x, 'y': y })
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
    x = rectangle_2.square.cntPoint[rectangle_2.idx_2].x
    y = rectangle_2.square.cntPoint[rectangle_2.idx_2].y
    cntPoint.push({ 'x': x, 'y': y })
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

    return calcCntInfo(cntPoint)
  }

  let two_rectangle_big_calc = function (rectangle_1, rectangle_2) {

    let x = 0,
      y = 0,
      cntPoint = [],
      cntArr = [];

    x = rectangle_1.square.cntPoint[rectangle_1.idx_1].x
    y = rectangle_1.square.cntPoint[rectangle_1.idx_1].y
    cntPoint.push({ 'x': x, 'y': y })
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

    x = rectangle_1.square.cntPoint[rectangle_1.idx_2].x
    y = rectangle_1.square.cntPoint[rectangle_1.idx_2].y
    cntPoint.push({ 'x': x, 'y': y })
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

    x = (rectangle_1.square.cntPoint[rectangle_1.idx_1].x + rectangle_2.square.cntPoint[rectangle_2.idx_1].x) / 2
    y = (rectangle_1.square.cntPoint[rectangle_1.idx_1].y + rectangle_2.square.cntPoint[rectangle_2.idx_1].y) / 2
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
    cntPoint.push({ 'x': x, 'y': y })

    x = (rectangle_1.square.cntPoint[rectangle_1.idx_2].x + rectangle_2.square.cntPoint[rectangle_2.idx_2].x) / 2
    y = (rectangle_1.square.cntPoint[rectangle_1.idx_2].y + rectangle_2.square.cntPoint[rectangle_2.idx_2].y) / 2
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
    cntPoint.push({ 'x': x, 'y': y })

    cntArr.push(calcCntInfo(cntPoint));
    cntPoint = [];

    x = (rectangle_1.square.cntPoint[rectangle_1.idx_1].x + rectangle_2.square.cntPoint[rectangle_2.idx_1].x) / 2
    y = (rectangle_1.square.cntPoint[rectangle_1.idx_1].y + rectangle_2.square.cntPoint[rectangle_2.idx_1].y) / 2
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
    cntPoint.push({ 'x': x, 'y': y })

    x = (rectangle_1.square.cntPoint[rectangle_1.idx_2].x + rectangle_2.square.cntPoint[rectangle_2.idx_2].x) / 2
    y = (rectangle_1.square.cntPoint[rectangle_1.idx_2].y + rectangle_2.square.cntPoint[rectangle_2.idx_2].y) / 2
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
    cntPoint.push({ 'x': x, 'y': y })

    x = rectangle_2.square.cntPoint[rectangle_2.idx_1].x
    y = rectangle_2.square.cntPoint[rectangle_2.idx_1].y
    cntPoint.push({ 'x': x, 'y': y })
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

    x = rectangle_2.square.cntPoint[rectangle_2.idx_2].x
    y = rectangle_2.square.cntPoint[rectangle_2.idx_2].y
    cntPoint.push({ 'x': x, 'y': y })
    cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

    cntArr.push(calcCntInfo(cntPoint));
    cntPoint = [];

    return cntArr
  }

  /**
   *
   * @param {Array} rectangle_point
   * @param {Number} result_x
   * @param {Number} result_y
   * @return {Array}
   */
  let test = function (rectangle_point, result_x, result_y) {

    let rectangle_result = [];

    /**
     * @return {String} Array[0] - filter class
     * @return {Array} Array[1] - top rectangle
     * @return {Array} Array[2] - bottom rectangle
     */
    let split_judge_rectangle = function (rectangle_point) {


      let split_Top = [],
        split_Bottom = [],
        split_Mid = [],
        filter_calss = '';

      if (rectangle_point.length == 0) {
        filter_calss = 'f0'
      } else {

        let lineM = (rectangle_point[0]['cntPoint'][1].y - rectangle_point[0]['cntPoint'][0].y) /
          (rectangle_point[0]['cntPoint'][1].x - rectangle_point[0]['cntPoint'][0].x)

        if (!lineM) {
          lineM = ((rectangle_point[0]['cntPoint'][1].y + 1) - (rectangle_point[0]['cntPoint'][0].y - 1)) /
            (rectangle_point[0]['cntPoint'][1].x - rectangle_point[0]['cntPoint'][0].x)
        }

        console.log(lineM)

        let y2 = result_y - (lineM * result_x);


        let start_point_y = 0;
        let start_point_x = (lineM * result_x - result_y + start_point_y) / lineM;

        let end_point_y = tempWidth;
        let end_point_x = (lineM * result_x - result_y + end_point_y) / lineM;

        let start_point = new cv.Point(start_point_x, start_point_y)
        let end_point = new cv.Point(end_point_x, end_point_y)

        cv.line(drawDst, start_point, end_point, new cv.Scalar(200, 0, 200), 10, cv.LINE_AA, 0)

        rectangle_point.forEach(function (ele) {

          let val = ele.cntInfo.center.x * lineM - ele.cntInfo.center.y + y2;

          if (val > 20)
            split_Top.push(ele)
          else if (val < -20)
            split_Bottom.push(ele)
          else
            split_Mid.push(ele)

        })

        let filter_dict = [
          ['f0', 'f0', 'f1', 'f1', 'f2'],
          ['f0', 'f0', 'f1', 'f1', 'f2'],
          ['f1', 'f1', 'f3', 'f3', 'f2'],
          ['f1', 'f1', 'f3', 'f3', 'f2'],
          ['f2', 'f2', 'f2', 'f2', 'f0']
        ]

        if (split_Mid.length) {

          if (result_y > tempHeight / 2) {
            split_Bottom = split_Mid;
            split_Top = [];
            split_Mid = [];
          } else {
            split_Top = split_Mid;
            split_Bottom = [];
            split_Mid = [];
          }

        }

        let top_val = split_Top.length;
        let bottom_val = split_Bottom.length;


        filter_calss = filter_dict[top_val][bottom_val]

      }


      console.log([filter_calss, split_Top, split_Bottom])
      return [filter_calss, split_Top, split_Bottom];
    }

    /**
     * 延伸修正矩形 rectangle_calc()
     * @param {Array} standard - 一邊四個完整的矩形
     * @param {Array} side - 另一邊不完整的矩形
     * @param {Array} fixdata - 修正需要使用到矩形頂點index號碼
     * @return {Array} - 回傳補正後的矩形
     */
    let rectangle_calc = (standard, side, fixdata) => {

      let x, y, cntPoint = [];

      if (!(typeof standard == "undefined") && !(typeof side == "undefined")) {

        /**
         * 其中一邊為4個矩形
         * 另一邊有1個以上的矩形
         * 或
         * 另一邊為0個矩形
         */
        if (side.length) {

          let two_check = false,
            three_check = false;

          function judge_two() {
            let splitX = 0,
              splitY = 0,
              p1 = 0,
              p2 = 1;
            let spacing_big = false,
              spacing_small = false,
              spacing_mid = false;
            let calc_idx = {
              'top': {
                'left': {
                  'idx1': 0,
                  'idx2': 0,
                  'index1': [1, 0],
                  'index2': [3, 0]
                },
                'right': {
                  'idx1': 1,
                  'idx2': 0,
                  'index1': [1, 0],
                  'index2': [2, 1]
                }
              },
              'bottom': {
                'left': {
                  'idx1': 0,
                  'idx2': 0,
                  'index1': [2, 3],
                  'index2': [0, 3]
                },
                'right': {
                  'idx1': 1,
                  'idx2': 0,
                  'index1': [3, 2],
                  'index2': [1, 2]
                }
              }

            }

            for (let i = 0; i < side.length; i++) {
              splitX += side[i]['cntInfo'].center.x;
              splitY += side[i]['cntInfo'].center.y;
            }
            splitX /= side.length;
            splitY /= side.length;

            side.forEach(function (ele) {
              let distance = Math.sqrt(Math.pow(ele.cntInfo.center.x - splitX, 2) + Math.pow(ele.cntInfo.center.y - splitY, 2))
              let length = Math.sqrt(Math.pow(ele.cntPoint[p1].x - ele.cntPoint[p2].x, 2) + Math.pow(ele.cntPoint[p1].y - ele.cntPoint[p2].y, 2))
              let val = distance / length

              if (val > 1.3 && val < 1.7) {
                spacing_big = true;
                spacing_mid = false;
                spacing_small = false;
                console.log('spacing_big')
              }
              if (val > 0.85 && val < 1.3) {
                spacing_mid = true;
                spacing_big = false;
                spacing_small = false;
                //console.log('spacing_mid')
              }
              if (val > 0.4 && val < 0.65) {
                spacing_small = true;
                spacing_mid = false;
                spacing_big = false;
                //console.log('spacing_small')
              }
            })


            return spacing_big
          }

          function judge_three() {

            let temp_x = 0,
              temp_y = 0,
              judge = false;

            side.forEach(function (ele) {
              temp_x += ele.cntInfo.center.x;
            })

            let val = (temp_x / 3 / side[1].cntInfo.center.x).toFixed(3)

            if (val > 0.95 && val < 1.05)
              judge = false
            else
              judge = true

            return judge

          }

          /**
           * 如果可以直接補正不做延伸的判斷
           */
          if (side.length == 2)
            two_check = judge_two()

          if (side.length == 3)
            three_check = judge_three()

          if (two_check)
            side = A8_sheet_makeup(side, 0, 0)

          if (three_check)
            side = A8_sheet_makeup(side, 0, 0)


          if (!two_check && !three_check) {

            let total_index = [0, 1, 2, 3]
            /**
             * 判斷兩邊缺失的矩形
             */
            for (let k = 0; k < side.length; k++) {

              for (let j = 0; j < standard.length; j++) {

                let valx = (side[k].cntPoint[fixdata[0]].x / standard[j].cntPoint[fixdata[1]].x).toFixed(3)
                //let valy = (side[j].cntPoint[fixdata[0]].y / standard[k].cntPoint[fixdata[1]].y).toFixed(3)

                if (valx > 0.92 && valx < 1.08)
                  total_index.splice(total_index.indexOf(j), 1);

              }
            }

            /**
             * 補正缺失矩形
             */
            for (let j = 0; j < total_index.length; j++) {

              let value = total_index[j]

              x = standard[value].cntPoint[fixdata[1]].x;
              y = standard[value].cntPoint[fixdata[1]].y;
              cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
              cntPoint.push({ 'x': x, 'y': y })
              x = standard[value].cntPoint[fixdata[3]].x;
              y = standard[value].cntPoint[fixdata[3]].y;
              cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
              cntPoint.push({ 'x': x, 'y': y })
              x = (2 * standard[value].cntPoint[fixdata[1]].x - 1 * standard[value].cntPoint[fixdata[0]].x) / (2 - 1)
              y = (2 * standard[value].cntPoint[fixdata[1]].y - 1 * standard[value].cntPoint[fixdata[0]].y) / (2 - 1)
              cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
              cntPoint.push({ 'x': x, 'y': y })
              x = (2 * standard[value].cntPoint[fixdata[3]].x - 1 * standard[value].cntPoint[fixdata[2]].x) / (2 - 1)
              y = (2 * standard[value].cntPoint[fixdata[3]].y - 1 * standard[value].cntPoint[fixdata[2]].y) / (2 - 1)
              cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
              cntPoint.push({ 'x': x, 'y': y })

              side.push(calcCntInfo(cntPoint));
              cntPoint = [];

            }


          }

        } else {

          /**
           * 另一邊為0個矩形
           * 補正缺失矩形
           */

          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata[1]].x;
            y = standard[k].cntPoint[fixdata[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata[3]].x;
            y = standard[k].cntPoint[fixdata[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata[1]].x - 1 * standard[k].cntPoint[fixdata[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata[1]].y - 1 * standard[k].cntPoint[fixdata[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata[3]].x - 1 * standard[k].cntPoint[fixdata[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata[3]].y - 1 * standard[k].cntPoint[fixdata[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            side.push(calcCntInfo(cntPoint));
            cntPoint = [];

          }
        }
      }

      const total = standard.concat(side);

      return total;
    };

    /**
     * 4:0 4:1 4:2 4:3
     * @param {Array} top - 分割後上方的矩形
     * @param {Array} bottom - 分割下上方的矩形
     * @return {Array} - 回傳補正後的矩形
     */
    let f2_extends_rectangle = function (top, bottom) {

      let data = {
        'fixBottom': [0, 3, 1, 2],
        'fixTop': [3, 0, 2, 1]
      }
      const result = (top.length > bottom.length) ? rectangle_calc(top, bottom, data.fixBottom) : rectangle_calc(bottom, top, data.fixTop);

      return result

    }

    /**
     * @param {Array} top - 分割後上方的矩形
     * @param {Array} bottom - 分割下上方的矩形
     * @return {Array} - 回傳補正後的矩形
     */
    let f1_extends_rectangle = function (top, bottom) {

      let fix_rect_angle = []

      let data = {
        'fixBottom': [0, 3, 1, 2],
        'fixTop': [3, 0, 2, 1]
      }

      /**
       * 其中一邊矩形為0個 另一邊矩形有3個或2個
       * 或是
       * 其中一邊矩形為1個 另一邊矩形有3個或2個
       */
      if (!(top.length) || !(bottom.length)) {

        let calc = function (standard, side, fixdata) {

          let splitX = 0,
            splitY = 0;

          for (let i = 0; i < standard.length; i++) {
            splitX += standard[i]['cntInfo'].center.x;
            splitY += standard[i]['cntInfo'].center.y;
          }
          splitX /= standard.length;
          splitY /= standard.length;


          if (!side.length) {
            standard = A8_sheet_makeup(standard, splitX, splitY);
            side = [];
          }

          let x, y, cntPoint = [];

          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata[1]].x;
            y = standard[k].cntPoint[fixdata[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata[3]].x;
            y = standard[k].cntPoint[fixdata[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata[1]].x - 1 * standard[k].cntPoint[fixdata[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata[1]].y - 1 * standard[k].cntPoint[fixdata[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata[3]].x - 1 * standard[k].cntPoint[fixdata[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata[3]].y - 1 * standard[k].cntPoint[fixdata[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            side.push(calcCntInfo(cntPoint));
            cntPoint = [];

          }

          return rectangle_calc(standard, side, fixdata)
        }

        fix_rect_angle = (top.length > bottom.length) ? calc(top, bottom, data.fixBottom) : calc(bottom, top, data.fixTop)

      } else {
        //其中一邊矩形為1個 另一邊矩形有2個
        let one_and_two = function (standard, side, fixdata, diect) {

          let splitX = 0,
            splitY = 0,
            p1 = 0,
            p2 = 1;
          let spacing_big = false,
            spacing_small = false,
            spacing_mid = false;
          let calc_idx = {
            'top': {
              'left': {
                'idx1': 0,
                'idx2': 0,
                'index1': [1, 0],
                'index2': [3, 0]
              },
              'right': {
                'idx1': 1,
                'idx2': 0,
                'index1': [1, 0],
                'index2': [2, 1]
              }
            },
            'bottom': {
              'left': {
                'idx1': 0,
                'idx2': 0,
                'index1': [2, 3],
                'index2': [0, 3]
              },
              'right': {
                'idx1': 1,
                'idx2': 0,
                'index1': [3, 2],
                'index2': [1, 2]
              }
            }

          }

          function judge() {

            for (let i = 0; i < standard.length; i++) {
              splitX += standard[i]['cntInfo'].center.x;
              splitY += standard[i]['cntInfo'].center.y;
            }
            splitX /= standard.length;
            splitY /= standard.length;
            standard.forEach(function (ele) {
              let distance = Math.sqrt(Math.pow(ele.cntInfo.center.x - splitX, 2) + Math.pow(ele.cntInfo.center.y - splitY, 2))
              let length = Math.sqrt(Math.pow(ele.cntPoint[p1].x - ele.cntPoint[p2].x, 2) + Math.pow(ele.cntPoint[p1].y - ele.cntPoint[p2].y, 2))
              let val = distance / length

              if (val > 1.3 && val < 1.7) {
                spacing_big = true;
                spacing_mid = false;
                spacing_small = false;
                console.log('spacing_big')
              }
              if (val > 0.85 && val < 1.3) {
                spacing_mid = true;
                spacing_big = false;
                spacing_small = false;
                console.log('spacing_mid')
              }
              if (val > 0.4 && val < 0.65) {
                spacing_small = true;
                spacing_mid = false;
                spacing_big = false;
                console.log('spacing_small')
              }
            })

          }

          function big_calc(pointArr, idx1, idx2, idx3, idx4) {

            let new_array = [...pointArr]

            let square_1 = {
              square: pointArr[0],
              idx_1: 1,
              idx_2: 2
            }

            let square_2 = {
              square: pointArr[1],
              idx_1: 0,
              idx_2: 3
            }

            let result = two_rectangle_big_calc(square_1, square_2)

            new_array.push(result[0])
            new_array.push(result[1])

            return new_array;
          }

          function mid_2_calc(standard, side, idx1, idx2, idx3, idx4, index) {

            let p1, p2, p3, p4, a1, b1, c1, a2, b2, c2, det;
            let Intersection = function () {
              a1 = p2.y - p1.y;
              b1 = p1.x - p2.x;
              c1 = p1.x * p2.y - p2.x * p1.y;
              a2 = p4.y - p3.y;
              b2 = p3.x - p4.x;
              c2 = p3.x * p4.y - p4.x * p3.y;
              det = a1 * b2 - a2 * b1;
            }

            let new_array = [...standard]
            let x = 0,
              y = 0,
              cntPoint = [];

            p1 = {
              'x': standard[index.idx1].cntPoint[index.index1[0]].x,
              'y': standard[index.idx1].cntPoint[index.index1[0]].y
            }
            p2 = {
              'x': standard[index.idx1].cntPoint[index.index1[1]].x,
              'y': standard[index.idx1].cntPoint[index.index1[1]].y
            }
            p3 = { 'x': side[index.idx2].cntPoint[index.index2[0]].x, 'y': side[index.idx2].cntPoint[index.index2[0]].y }
            p4 = { 'x': side[index.idx2].cntPoint[index.index2[1]].x, 'y': side[index.idx2].cntPoint[index.index2[1]].y }
            Intersection();

            x = (c1 * b2 - c2 * b1) / det
            y = (a1 * c2 - a2 * c1) / det
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })

            x = (standard[index.idx1].cntPoint[index.index2[0]].x)
            y = (standard[index.idx1].cntPoint[index.index2[0]].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })

            x = (standard[index.idx1].cntPoint[index.index2[1]].x)
            y = (standard[index.idx1].cntPoint[index.index2[1]].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })

            x = (side[index.idx2].cntPoint[index.index2[1]].x)
            y = (side[index.idx2].cntPoint[index.index2[1]].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })

            new_array.push(calcCntInfo(cntPoint))

            cntPoint = [];
            x = (standard[0].cntPoint[idx2].x)
            y = (standard[0].cntPoint[idx2].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })
            x = (standard[0].cntPoint[idx3].x)
            y = (standard[0].cntPoint[idx3].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })
            x = (standard[1].cntPoint[idx1].x)
            y = (standard[1].cntPoint[idx1].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })
            x = (standard[1].cntPoint[idx4].x)
            y = (standard[1].cntPoint[idx4].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })

            new_array.push(calcCntInfo(cntPoint))
            cntPoint = [];

            return new_array;
          }

          function smail_calc(standard, side, index, standIdx) {
            let new_array = [...standard]
            let x = 0,
              y = 0,
              cntPoint = [];

            x = (2 * side[0].cntPoint[index[1]].x - 1 * side[0].cntPoint[index[0]].x) / (2 - 1)
            y = (2 * side[0].cntPoint[index[1]].y - 1 * side[0].cntPoint[index[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[0].cntPoint[index[3]].x - 1 * side[0].cntPoint[index[2]].x) / (2 - 1)
            y = (2 * side[0].cntPoint[index[3]].y - 1 * side[0].cntPoint[index[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[0].cntPoint[index[1]].x
            y = side[0].cntPoint[index[1]].y
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[0].cntPoint[index[3]].x
            y = side[0].cntPoint[index[3]].y
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            new_array.push(calcCntInfo(cntPoint))
            cntPoint = [];


            x = (2 * side[0].cntPoint[index[3]].x - 1 * side[0].cntPoint[index[2]].x) / (2 - 1)
            y = (2 * side[0].cntPoint[index[3]].y - 1 * side[0].cntPoint[index[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[0].cntPoint[index[3]].x
            y = side[0].cntPoint[index[3]].y
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[standIdx].cntPoint[index[0]].x
            y = standard[standIdx].cntPoint[index[0]].y
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[standIdx].cntPoint[index[1]].x
            y = standard[standIdx].cntPoint[index[1]].y
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            new_array.push(calcCntInfo(cntPoint))
            cntPoint = [];

            return new_array
          }

          judge();

          if (spacing_big) {
            standard = big_calc(standard, 0, 1, 2, 3);
            fix_rect_angle = rectangle_calc(standard, side, fixdata)
          }

          if (spacing_mid) {

            let splitX = 0,
              splitY = 0;
            for (let i = 0; i < standard.length; i++) {
              splitX += standard[i]['cntInfo'].center.x;
              splitY += standard[i]['cntInfo'].center.y;
            }
            splitX /= standard.length;
            splitY /= standard.length;

            if (diect == 'top') {

              let val_1 = standard[0].cntPoint[3].x / side[0].cntPoint[1].x;
              let val_2 = standard[1].cntPoint[2].x / side[0].cntPoint[0].x;

              if ((val_1 > 0.9 && val_1 < 1.05))
                standard = mid_2_calc(standard, side, 0, 1, 2, 3, calc_idx.top.left)

              if ((val_2 > 0.9 && val_2 < 1.05))
                standard = mid_2_calc(standard, side, 0, 1, 2, 3, calc_idx.top.right)

              if (!((val_1 > 0.9 && val_1 < 1.05) || (val_2 > 0.9 && val_2 < 1.05)))
                standard = A8_sheet_makeup(standard, splitX, splitY);

            }

            if (diect == 'bottom') {

              let val_1 = standard[0].cntPoint[0].x / side[0].cntPoint[2].x;
              let val_2 = standard[1].cntPoint[1].x / side[0].cntPoint[3].x;
              if ((val_1 > 0.9 && val_1 < 1.05))
                standard = mid_2_calc(standard, side, 0, 1, 2, 3, calc_idx.bottom.left)

              if ((val_2 > 0.9 && val_2 < 1.05))
                standard = mid_2_calc(standard, side, 0, 1, 2, 3, calc_idx.bottom.right)

              if (!((val_1 > 0.9 && val_1 < 1.05) || (val_2 > 0.9 && val_2 < 1.05)))
                standard = A8_sheet_makeup(standard, splitX, splitY);
            }

            fix_rect_angle = rectangle_calc(standard, side, fixdata)
          }

          if (spacing_small) {

            let splitX = 0,
              splitY = 0;
            for (let i = 0; i < standard.length; i++) {
              splitX += standard[i]['cntInfo'].center.x;
              splitY += standard[i]['cntInfo'].center.y;
            }
            splitX /= standard.length;
            splitY /= standard.length;

            if (diect == 'top') {

              let val_1 = (standard[0].cntPoint[3].x - side[0].cntPoint[1].x) / 200;
              let val_2 = (standard[1].cntPoint[2].x - side[0].cntPoint[0].x) / 200;

              if (val_1 < 1.25 && val_1 > 0.90) {
                standard = smail_calc(standard, side, [3, 0, 2, 1], 0)
                console.log('left')
              }

              if (val_2 < -0.8 && val_2 > -1.2) {
                standard = smail_calc(standard, side, [2, 1, 3, 0], 1)
                console.log('right')
              }

              if (!(val_1 < 1.25 && val_1 > 0.90) && !((val_2 < -0.8 && val_2 > -1.2))) {
                standard = A8_sheet_makeup(standard, splitX, splitY);
                console.log('und')
              }


            }

            if (diect == 'bottom') {

              let val_1 = (standard[0].cntPoint[0].x - side[0].cntPoint[2].x) / 200;
              let val_2 = (standard[1].cntPoint[1].x - side[0].cntPoint[3].x) / 200;

              if (val_1 < 1.25 && val_1 > 0.90) {
                standard = smail_calc(standard, side, [0, 3, 1, 2], 0)
                console.log('left')
              }

              if (val_2 < -0.8 && val_2 > -1.2) {
                standard = smail_calc(standard, side, [1, 2, 0, 3], 1)
                console.log('right')
              }

              if (!(val_1 < 1.25 && val_1 > 0.90) && !((val_2 < -0.8 && val_2 > -1.2))) {
                standard = A8_sheet_makeup(standard, splitX, splitY);
                console.log('und')
              }


            }

            fix_rect_angle = rectangle_calc(standard, side, fixdata)


          }

        }

        let one_and_three = function (standard, side, fixdata, diect) {

          function judge() {

            let temp_x = 0,
              temp_y = 0,
              judge = 0;

            standard.forEach(function (ele) {
              temp_x += ele.cntInfo.center.x;
            })

            let val = (temp_x / 3 / standard[1].cntInfo.center.x).toFixed(3)

            if (val > 0.995 && val < 1.005)
              judge = 1
            else
              judge = 0

            return judge

          }

          function rect_is_stick(standard, side, fixdata, diect) {

            let splitX = 0,
              splitY = 0;
            for (let i = 0; i < standard.length; i++) {
              splitX += standard[i]['cntInfo'].center.x;
              splitY += standard[i]['cntInfo'].center.y;
            }
            splitX /= standard.length;
            splitY /= standard.length;


            if (diect == 'top') {

              let val_1 = standard[0].cntPoint[3].x / side[0].cntPoint[1].x;
              let val_2 = standard[2].cntPoint[2].x / side[0].cntPoint[0].x;

              console.log(val_1, val_2)

              if (val_1 < 1.1 && val_1 > 0.9) {

                standard = A8_sheet_makeup(standard, splitX, splitY, 'left')
                console.log('left')
              }

              if (val_2 < 1.1 && val_2 > 0.9) {

                standard = A8_sheet_makeup(standard, splitX, splitY, 'right')
                console.log('right')
              }

              if (!((val_1 < 1.1 && val_1 > 0.9)) && !((val_2 < 1.1 && val_2 > 0.9))) {
                standard = A8_sheet_makeup(standard, splitX, splitY)
                console.log('und')
              }

              fix_rect_angle = rectangle_calc(standard, side, fixdata)

            }


            if (diect == 'bottom') {

              let val_1 = standard[0].cntPoint[0].x / side[0].cntPoint[2].x;
              let val_2 = standard[2].cntPoint[1].x / side[0].cntPoint[3].x;

              if (val_1 < 1.1 && val_1 > 0.9) {

                standard = A8_sheet_makeup(standard, splitX, splitY, 'left')
                console.log('left')
              }

              if (val_2 < 1.1 && val_2 > 0.9) {

                standard = A8_sheet_makeup(standard, splitX, splitY, 'right')
                console.log('right')
              }

              if (!((val_1 < 1.1 && val_1 > 0.9)) && !((val_2 < 1.1 && val_2 > 0.9))) {
                standard = A8_sheet_makeup(standard, splitX, splitY)
                console.log('und')
              }

              fix_rect_angle = rectangle_calc(standard, side, fixdata)

            }


          }

          function three_rectangle_no_stick(standard, side, fixdata, diect) {


            function no_stick_makeup(standard) {

              let newPointArr = [...standard];
              let total_distance = [];
              let index1, index2;
              let x = 0,
                y = 0,
                cntPoint = [];

              for (let index = 0; index < standard.length - 1; index++) {
                let index1 = index;
                let index2 = index + 1;
                let distance = Math.sqrt(Math.pow(standard[index1].cntInfo.center.x - standard[index2].cntInfo.center.x, 2) +
                  Math.pow(standard[index1].cntInfo.center.y - standard[index2].cntInfo.center.y, 2))
                total_distance.push(distance)
              }

              if (total_distance[0] < total_distance[1]) {
                index1 = 1;
                index2 = 2;
              } else {
                index1 = 0;
                index2 = 1;
              }

              let square_1 = {
                square: standard[index1],
                idx_1: 1,
                idx_2: 2
              }

              let square_2 = {
                square: standard[index2],
                idx_1: 0,
                idx_2: 3
              }

              newPointArr.push(three_rectangle_no_stick_calc(square_1, square_2))

              newPointArr.sort(function (a, b) {
                return a.cntInfo.center.x - b.cntInfo.center.x;
              });

              return newPointArr
            }

            fix_rect_angle = no_stick_makeup(standard);

            fix_rect_angle = rectangle_calc(fix_rect_angle, side, fixdata)
          }

          const stick = judge()

          stick ? rect_is_stick(standard, side, fixdata, diect) : three_rectangle_no_stick(standard, side, fixdata, diect)

        }

        let dict = [
          [null, null, null, null],
          [null, null, '12', '13'],
          [null, '21', null, null],
          [null, '31', null, null]
        ]

        let judge_filter = dict[top.length][bottom.length];

        if (judge_filter == '12' || judge_filter == '21') {
          (top.length > bottom.length) ? one_and_two(top, bottom, data.fixBottom, 'top') : one_and_two(bottom, top, data.fixTop, 'bottom')
        }


        if (judge_filter == '13' || judge_filter == '31') {
          (top.length > bottom.length) ? one_and_three(top, bottom, data.fixBottom, 'top') : one_and_three(bottom, top, data.fixTop, 'bottom')

        }


      }

      return fix_rect_angle
    }

    let f3_extends_rectangle = function (top, bottom) {

      let data = {
        'fixBottom': [0, 3, 1, 2],
        'fixTop': [3, 0, 2, 1]
      }

      let fix_rect_angle = [];

      let dict = [
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, '22', '23', null],
        [null, null, '32', '33', null],
        [null, null, null, null, null]
      ]

      let two_and_two = function (top, bottom) {

        function judge(standard) {

          let splitX = 0,
            splitY = 0,
            p1 = 0,
            p2 = 1;
          let spacing_big = false,
            spacing_small = false,
            spacing_mid = false;
          for (let i = 0; i < standard.length; i++) {
            splitX += standard[i]['cntInfo'].center.x;
            splitY += standard[i]['cntInfo'].center.y;
          }
          splitX /= standard.length;
          splitY /= standard.length;

          standard.forEach(function (ele) {

            let distance = Math.sqrt(Math.pow(ele.cntInfo.center.x - splitX, 2) + Math.pow(ele.cntInfo.center.y - splitY, 2))
            let length = Math.sqrt(Math.pow(ele.cntPoint[p1].x - ele.cntPoint[p2].x, 2) + Math.pow(ele.cntPoint[p1].y - ele.cntPoint[p2].y, 2))
            let val = distance / length

            if (val > 1.3 && val < 1.7) {
              spacing_big = true;
              spacing_mid = false;
              spacing_small = false;
              console.log('spacing_big')
            }
            if (val > 0.85 && val < 1.3) {
              spacing_mid = true;
              spacing_big = false;
              spacing_small = false;
              console.log('spacing_mid')
            }

            if (val > 0.4 && val < 0.65) {
              spacing_small = true;
              spacing_mid = false;
              spacing_big = false;
              console.log('spacing_small')
            }

          })


          return [spacing_big, spacing_mid, spacing_small]
        }

        function big_calc(pointArr, idx1, idx2, idx3, idx4) {

          let new_array = [...pointArr]

          let square_1 = {
            square: pointArr[0],
            idx_1: 1,
            idx_2: 2
          }

          let square_2 = {
            square: pointArr[1],
            idx_1: 0,
            idx_2: 3
          }

          let result = two_rectangle_big_calc(square_1, square_2)

          new_array.push(result[0])
          new_array.push(result[1])

          return new_array;
        }

        function mid_and_small_calc(standard, side, fixdata1, fixdata2) {

          let x = 0,
            y = 0,
            cntPoint = [];

          let top_temp = [...standard];
          let bottom_temp = [...side];


          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata1[1]].x;
            y = standard[k].cntPoint[fixdata1[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata1[3]].x;
            y = standard[k].cntPoint[fixdata1[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[1]].x - 1 * standard[k].cntPoint[fixdata1[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[1]].y - 1 * standard[k].cntPoint[fixdata1[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[3]].x - 1 * standard[k].cntPoint[fixdata1[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[3]].y - 1 * standard[k].cntPoint[fixdata1[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            bottom_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          for (let k = 0; k < side.length; k++) {

            x = side[k].cntPoint[fixdata2[1]].x;
            y = side[k].cntPoint[fixdata2[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[k].cntPoint[fixdata2[3]].x;
            y = side[k].cntPoint[fixdata2[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[1]].x - 1 * side[k].cntPoint[fixdata2[0]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[1]].y - 1 * side[k].cntPoint[fixdata2[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[3]].x - 1 * side[k].cntPoint[fixdata2[2]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[3]].y - 1 * side[k].cntPoint[fixdata2[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            top_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          return top_temp.concat(bottom_temp)
        }

        function stick_makeup(standard, side, top, bottom, fixdata1, fixdata2) {

          let x = 0,
            y = 0,
            cntPoint = [];

          let top_temp = [...top];
          let bottom_temp = [...bottom];
          // standard = [standard[1], standard[2]];
          // side = [side[0]]

          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata1[1]].x;
            y = standard[k].cntPoint[fixdata1[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata1[3]].x;
            y = standard[k].cntPoint[fixdata1[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[1]].x - 1 * standard[k].cntPoint[fixdata1[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[1]].y - 1 * standard[k].cntPoint[fixdata1[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[3]].x - 1 * standard[k].cntPoint[fixdata1[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[3]].y - 1 * standard[k].cntPoint[fixdata1[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            bottom_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          for (let k = 0; k < side.length; k++) {

            x = side[k].cntPoint[fixdata2[1]].x;
            y = side[k].cntPoint[fixdata2[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[k].cntPoint[fixdata2[3]].x;
            y = side[k].cntPoint[fixdata2[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[1]].x - 1 * side[k].cntPoint[fixdata2[0]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[1]].y - 1 * side[k].cntPoint[fixdata2[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[3]].x - 1 * side[k].cntPoint[fixdata2[2]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[3]].y - 1 * side[k].cntPoint[fixdata2[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            top_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];
          }

          top_temp = A8_sheet_makeup(top_temp, 0, 0)
          bottom_temp = A8_sheet_makeup(bottom_temp, 0, 0)

          return top_temp.concat(bottom_temp)
        }

        let result_top = judge(top);
        let result_bottom = judge(bottom);

        if (result_top[0] || result_bottom[0]) {

          if (result_top[0] && result_bottom[0]) {
            top = big_calc(top, 0, 1, 2, 3);
            bottom = big_calc(bottom, 0, 1, 2, 3);
            fix_rect_angle = top.concat(bottom)
          } else if (result_top[0]) {
            let standard = big_calc(top, 0, 1, 2, 3);
            let side = bottom;
            fix_rect_angle = rectangle_calc(standard, side, data.fixBottom)
          } else if (result_bottom[0]) {
            let standard = big_calc(bottom, 0, 1, 2, 3);
            let side = top;
            fix_rect_angle = rectangle_calc(standard, side, data.fixTop)
          }

        }

        if (result_top[1] && result_bottom[1]) {

          let val_1 = top[0].cntPoint[3].x / bottom[0].cntPoint[0].x
          let val_2 = top[1].cntPoint[3].x / bottom[1].cntPoint[0].x
          console.log(val_1, val_2)
          if (!((val_1 < 1.1 && val_1 > 0.95) && (val_2 < 1.1 && val_2 > 0.95))) {
            fix_rect_angle = mid_and_small_calc(top, bottom, data.fixBottom, data.fixTop)
            console.log('mid and mid')
          }

        }

        if (result_top[2] && result_bottom[2]) {

          let val_1 = top[0].cntPoint[3].x / bottom[1].cntPoint[1].x;
          let val_2 = top[1].cntPoint[2].x / bottom[0].cntPoint[0].x;

          if (val_1 < 1.1 && val_1 > 0.9 || val_2 < 1.1 && val_2 > 0.9)
            fix_rect_angle = mid_and_small_calc(top, bottom, data.fixBottom, data.fixTop)

          console.log('small')
        }

        if (result_top[2] && result_bottom[1]) {

          let val_1 = top[0].cntPoint[3].x / bottom[1].cntPoint[0].x
          let val_2 = top[1].cntPoint[3].x / bottom[0].cntPoint[0].x

          if (val_1 < 1.1 && val_1 > 0.9) {
            fix_rect_angle = stick_makeup([top[1]], [bottom[0]], top, bottom, data.fixBottom, data.fixTop)
          }

          if (val_2 < 1.1 && val_2 > 0.9) {
            fix_rect_angle = stick_makeup([top[0]], [bottom[1]], top, bottom, data.fixBottom, data.fixTop)
          }

        }

        if (result_top[1] && result_bottom[2]) {

          let val_1 = top[1].cntPoint[3].x / bottom[0].cntPoint[0].x
          let val_2 = top[0].cntPoint[3].x / bottom[1].cntPoint[0].x

          if (val_1 < 1.1 && val_1 > 0.9) {
            fix_rect_angle = stick_makeup([top[0]], [bottom[1]], top, bottom, data.fixBottom, data.fixTop)
          }

          if (val_2 < 1.1 && val_2 > 0.9) {
            fix_rect_angle = stick_makeup([top[1]], [bottom[0]], top, bottom, data.fixBottom, data.fixTop)
          }

        }

      }

      let three_and_three = function (top, bottom) {

        function judge(standard) {

          let temp_x = 0,
            temp_y = 0,
            judge = 0;

          standard.forEach(function (ele) {
            temp_x += ele.cntInfo.center.x;
          })

          let val = (temp_x / 3 / standard[1].cntInfo.center.x).toFixed(3)

          if (val > 0.995 && val < 1.005)
            judge = 0
          else
            judge = 1

          return judge

        }

        function no_stick_makeup(standard) {

          let newPointArr = [...standard];
          let total_distance = [];
          let index1, index2;
          let x = 0,
            y = 0,
            cntPoint = [];

          for (let index = 0; index < standard.length - 1; index++) {
            let index1 = index;
            let index2 = index + 1;
            let distance = Math.sqrt(Math.pow(standard[index1].cntInfo.center.x - standard[index2].cntInfo.center.x, 2) +
              Math.pow(standard[index1].cntInfo.center.y - standard[index2].cntInfo.center.y, 2))
            total_distance.push(distance)
          }

          if (total_distance[0] < total_distance[1]) {
            index1 = 1;
            index2 = 2;
          } else {
            index1 = 0;
            index2 = 1;
          }

          let square_1 = {
            square: standard[index1],
            idx_1: 1,
            idx_2: 2
          }

          let square_2 = {
            square: standard[index2],
            idx_1: 0,
            idx_2: 3
          }

          newPointArr.push(three_rectangle_no_stick_calc(square_1, square_2))

          return newPointArr

        }

        function stick_makeup(standard, side, fixdata1, fixdata2) {

          let x = 0,
            y = 0,
            cntPoint = [];
          let top_temp = [...standard];
          let bottom_temp = [...side];

          standard = [standard[2]];
          side = [side[0]]

          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata1[1]].x;
            y = standard[k].cntPoint[fixdata1[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata1[3]].x;
            y = standard[k].cntPoint[fixdata1[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[1]].x - 1 * standard[k].cntPoint[fixdata1[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[1]].y - 1 * standard[k].cntPoint[fixdata1[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[3]].x - 1 * standard[k].cntPoint[fixdata1[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[3]].y - 1 * standard[k].cntPoint[fixdata1[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            bottom_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          for (let k = 0; k < side.length; k++) {

            x = side[k].cntPoint[fixdata2[1]].x;
            y = side[k].cntPoint[fixdata2[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[k].cntPoint[fixdata2[3]].x;
            y = side[k].cntPoint[fixdata2[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[1]].x - 1 * side[k].cntPoint[fixdata2[0]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[1]].y - 1 * side[k].cntPoint[fixdata2[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[3]].x - 1 * side[k].cntPoint[fixdata2[2]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[3]].y - 1 * side[k].cntPoint[fixdata2[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            top_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          return top_temp.concat(bottom_temp)
        }

        let result_top = judge(top);
        let result_bottom = judge(bottom);

        //其中一邊為間隔
        if (result_top || result_bottom) {

          if (result_top && result_bottom) {

            top = no_stick_makeup(top);
            bottom = no_stick_makeup(bottom);
            fix_rect_angle = top.concat(bottom)

          } else if (result_top) {

            let side = bottom;
            fix_rect_angle = no_stick_makeup(top);
            fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixBottom)

          } else if (result_bottom) {

            let side = top
            fix_rect_angle = no_stick_makeup(bottom);
            fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixTop)
          }

        }

        //上下方的三格都相黏並且為對角
        if (!result_top && !result_bottom) {

          let val_1 = top[0].cntPoint[2].x / bottom[2].cntPoint[0].x;
          let val_2 = top[1].cntPoint[2].x / bottom[1].cntPoint[0].x;

          if (val_1 < 1.1 && val_1 > 0.9) {
            fix_rect_angle = stick_makeup(top, bottom, data.fixBottom, data.fixTop)
          }

          if (val_2 < 1.1 && val_2 > 0.9) {
            fix_rect_angle = stick_makeup(bottom, top, data.fixTop, data.fixBottom)
          }

          console.log(val_1, val_2)
        }

      }

      let three_and_two = function (top, bottom) {


        function three_rectangle_judge(standard) {

          let temp_x = 0,
            temp_y = 0,
            judge = false;

          standard.forEach(function (ele) {
            temp_x += ele.cntInfo.center.x;
          })

          let val = (temp_x / 3 / standard[1].cntInfo.center.x).toFixed(3)

          if (val > 0.995 && val < 1.005)
            judge = false
          else
            judge = true

          return [judge]

        }

        function two_rectangle_judge(standard) {

          let splitX = 0,
            splitY = 0,
            p1 = 0,
            p2 = 1;
          let spacing_big = false,
            spacing_small = false,
            spacing_mid = false;
          for (let i = 0; i < standard.length; i++) {
            splitX += standard[i]['cntInfo'].center.x;
            splitY += standard[i]['cntInfo'].center.y;
          }
          splitX /= standard.length;
          splitY /= standard.length;

          standard.forEach(function (ele) {

            let distance = Math.sqrt(Math.pow(ele.cntInfo.center.x - splitX, 2) + Math.pow(ele.cntInfo.center.y - splitY, 2))
            let length = Math.sqrt(Math.pow(ele.cntPoint[p1].x - ele.cntPoint[p2].x, 2) + Math.pow(ele.cntPoint[p1].y - ele.cntPoint[p2].y, 2))
            let val = distance / length

            if (val > 1.3 && val < 1.7) {
              spacing_big = true;
              spacing_mid = false;
              spacing_small = false;
              console.log('spacing_big')
            }
            if (val > 0.85 && val < 1.3) {
              spacing_mid = true;
              spacing_big = false;
              spacing_small = false;
              console.log('spacing_mid')
            }

            if (val > 0.4 && val < 0.65) {
              spacing_small = true;
              spacing_mid = false;
              spacing_big = false;
              console.log('spacing_small')
            }

          })


          return [spacing_big, spacing_mid, spacing_small]

        }

        function three_calc_stick_makeup(standard) {

          let newPointArr = [...standard];
          let total_distance = [];
          let index1, index2;
          let x = 0,
            y = 0,
            cntPoint = [];

          for (let index = 0; index < standard.length - 1; index++) {
            let index1 = index;
            let index2 = index + 1;
            let distance = Math.sqrt(Math.pow(standard[index1].cntInfo.center.x - standard[index2].cntInfo.center.x, 2) +
              Math.pow(standard[index1].cntInfo.center.y - standard[index2].cntInfo.center.y, 2))
            total_distance.push(distance)
          }

          if (total_distance[0] < total_distance[1]) {
            index1 = 1;
            index2 = 2;
          } else {
            index1 = 0;
            index2 = 1;
          }

          let square_1 = {
            square: standard[index1],
            idx_1: 1,
            idx_2: 2
          }

          let square_2 = {
            square: standard[index2],
            idx_1: 0,
            idx_2: 3
          }

          newPointArr.push(three_rectangle_no_stick_calc(square_1, square_2))

          newPointArr.sort(function (a, b) {
            return a.cntInfo.center.x - b.cntInfo.center.x;
          });

          return newPointArr

        }

        function two_calc_big_makeup(pointArr, idx1, idx2, idx3, idx4) {

          let new_array = [...pointArr]

          let square_1 = {
            square: pointArr[0],
            idx_1: 1,
            idx_2: 2
          }

          let square_2 = {
            square: pointArr[1],
            idx_1: 0,
            idx_2: 3
          }

          let result = two_rectangle_big_calc(square_1, square_2)

          new_array.push(result[0])
          new_array.push(result[1])

          return new_array;
        }

        function stick_makeup(standard, side, top_temp, bottom_temp, fixdata1, fixdata2) {

          let x = 0,
            y = 0,
            cntPoint = [];

          // let top_temp = [...standard];
          // let bottom_temp = [...side];
          // standard = [standard[1], standard[2]];
          // side = [side[0]]

          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata1[1]].x;
            y = standard[k].cntPoint[fixdata1[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata1[3]].x;
            y = standard[k].cntPoint[fixdata1[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[1]].x - 1 * standard[k].cntPoint[fixdata1[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[1]].y - 1 * standard[k].cntPoint[fixdata1[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[3]].x - 1 * standard[k].cntPoint[fixdata1[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[3]].y - 1 * standard[k].cntPoint[fixdata1[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            bottom_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          for (let k = 0; k < side.length; k++) {

            x = side[k].cntPoint[fixdata2[1]].x;
            y = side[k].cntPoint[fixdata2[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[k].cntPoint[fixdata2[3]].x;
            y = side[k].cntPoint[fixdata2[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[1]].x - 1 * side[k].cntPoint[fixdata2[0]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[1]].y - 1 * side[k].cntPoint[fixdata2[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[3]].x - 1 * side[k].cntPoint[fixdata2[2]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[3]].y - 1 * side[k].cntPoint[fixdata2[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            top_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          return top_temp.concat(bottom_temp)
        }

        let top_judge = '',
          bottom_judge = ''

        if (top.length == 2) {
          top_judge = two_rectangle_judge(top)
        } else if (top.length == 3) {
          top_judge = three_rectangle_judge(top)
        }

        if (bottom.length == 2) {
          bottom_judge = two_rectangle_judge(bottom)
        } else if (bottom.length == 3) {
          bottom_judge = three_rectangle_judge(bottom)
        }

        //兩邊或其中一邊滿足條件
        if (top_judge[0] || bottom_judge[0]) {

          if (top_judge[0] && bottom_judge[0]) {

            if (top_judge.length < bottom_judge.length) {

              top = three_calc_stick_makeup(top)

              bottom = two_calc_big_makeup(bottom, 0, 1, 2, 3)

            } else {

              top = two_calc_big_makeup(top, 0, 1, 2, 3)

              bottom = three_calc_stick_makeup(bottom)

            }

            fix_rect_angle = top.concat(bottom)

            console.log('兩邊都滿足條件 分別可以自補')

          } else {

            if (top_judge[0]) {

              let side = bottom;
              if (top_judge.length === 1) {
                fix_rect_angle = three_calc_stick_makeup(top)
                fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixBottom)
              } else {
                fix_rect_angle = two_calc_big_makeup(top, 0, 1, 2, 3)
                fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixBottom)
              }

            } else if (bottom_judge[0]) {

              let side = top;
              if (bottom_judge.length === 1) {
                fix_rect_angle = three_calc_stick_makeup(bottom)
                fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixTop)
              } else {
                fix_rect_angle = two_calc_big_makeup(bottom, 0, 1, 2, 3)
                fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixTop)
              }
            }

            console.log('其中一邊滿足條件')
          }

        } else {

          if (top_judge.length == 1) {

            // 上三下二

            if (bottom_judge[2]) {

              let val_1 = top[0].cntPoint[3].x / bottom[1].cntPoint[0].x
              let val_2 = top[2].cntPoint[2].x / bottom[1].cntPoint[0].x

              if (val_1 < 1.1 && val_1 > 0.9)
                fix_rect_angle = stick_makeup([top[1], top[2]], [bottom[0]], top, bottom, data.fixBottom, data.fixTop)

              if (val_2 < 1.1 && val_2 > 0.9)
                fix_rect_angle = stick_makeup([top[0], top[1]], [bottom[1]], top, bottom, data.fixBottom, data.fixTop)

              console.log('3 to 2 big')
            }

            if (bottom_judge[1]) {

              let val_1 = top[0].cntPoint[3].x / bottom[0].cntPoint[1].x
              let val_2 = top[2].cntPoint[2].x / bottom[1].cntPoint[0].x

              console.log(val_1, val_2)

              if (val_1 < 1.1 && val_1 > 0.9)
                fix_rect_angle = stick_makeup([top[0], top[2]], [bottom[0]], top, bottom, data.fixBottom, data.fixTop)

              if (val_2 < 1.1 && val_2 > 0.9)
                fix_rect_angle = stick_makeup([top[0], top[2]], [bottom[1]], top, bottom, data.fixBottom, data.fixTop)

              console.log('3 to 2 mid')
            }

          }

          if (bottom_judge.length == 1) {

            // 上二下三

            if (top_judge[2]) {

              let val_1 = bottom[0].cntPoint[0].x / top[0].cntPoint[2].x
              let val_2 = bottom[2].cntPoint[1].x / top[1].cntPoint[3].x

              if (val_1 < 1.1 && val_1 > 0.9)
                fix_rect_angle = stick_makeup([bottom[1], bottom[2]], [top[0]], top, bottom, data.fixTop, data.fixBottom)

              if (val_2 < 1.1 && val_2 > 0.9)
                fix_rect_angle = stick_makeup([bottom[0], bottom[1]], [top[1]], top, bottom, data.fixTop, data.fixBottom)

            }


            if (top_judge[1]) {

              let val_1 = bottom[0].cntPoint[0].x / top[0].cntPoint[2].x
              let val_2 = bottom[2].cntPoint[1].x / top[1].cntPoint[3].x

              if (val_1 < 1.1 && val_1 > 0.9)
                fix_rect_angle = stick_makeup([bottom[0], bottom[2]], [top[0]], top, bottom, data.fixTop, data.fixBottom)

              if (val_2 < 1.1 && val_2 > 0.9)
                fix_rect_angle = stick_makeup([bottom[0], bottom[2]], [top[1]], top, bottom, data.fixTop, data.fixBottom)

            }

          }

        }

      }

      let judge_filter = dict[top.length][bottom.length];

      if (judge_filter == '22')
        two_and_two(top, bottom)

      if (judge_filter == '33')
        three_and_three(top, bottom)

      if (judge_filter == '32' || judge_filter == '23')
        three_and_two(top, bottom)


      if (fix_rect_angle.length)
        return fix_rect_angle
      else if (!fix_rect_angle.length) {

        top = A8_sheet_makeup(top, 0, 0)
        bottom = A8_sheet_makeup(bottom, 0, 0)
        fix_rect_angle = top.concat(bottom)
        console.log('沒有矩形可以參考!!!!!')

        return fix_rect_angle
      } else {

        return top.concat(bottom)
      }

    }

    let split_rectangle = split_judge_rectangle(rectangle_point)

    switch (split_rectangle[0]) {
      case 'f0':
        /**
         * 0:0 0:1 1:0 1:1
         */
        rectangle_result = rectangle_point.slice(0);
        break;
      case 'f2':
        /**
         * 4:0 4:1 4:2 4:3
         */
        rectangle_result = f2_extends_rectangle(split_rectangle[1], split_rectangle[2])
        break;
      case 'f1':
        /**
         * 3:0 2:0 3:1 2:1
         */
        rectangle_result = f1_extends_rectangle(split_rectangle[1], split_rectangle[2])
        break;
      case 'f3':
        /**
         * 3:2 3:3 2:2
         */
        rectangle_result = f3_extends_rectangle(split_rectangle[1], split_rectangle[2])
        break;
      default:
        console.log('null');
    }

    return AllSortRectangleV2(rectangle_result);
  }

  let test2 = function (rectangle_point, result_x, result_y) {

    // top -> right
    // bottom -> left

    let rectangle_result = [];

    /**
     * @return {String} Array[0] - filter class
     * @return {Array} Array[1] - top rectangle
     * @return {Array} Array[2] - bottom rectangle
     */
    let split_judge_rectangle = function (rectangle_point) {

      let split_Right = [],
        split_Left = [],
        split_Mid = [],
        filter_calss = 'f0';
      let filter_dict = [
        ['f0', 'f0', 'f1', 'f1', 'f2'],
        ['f0', 'f0', 'f1', 'f1', 'f2'],
        ['f1', 'f1', 'f3', 'f3', 'f2'],
        ['f1', 'f1', 'f3', 'f3', 'f2'],
        ['f2', 'f2', 'f2', 'f2', 'f0']
      ]

      if (rectangle_point.length == 0) {
        filter_calss = 'f0';
        return [filter_calss, split_Left, split_Right];
      }

      //判斷
      let spllit_calc = function (rectangle_point, result_x, result_y) {

        let threshold = 10000;

        let slope = (rectangle_point[0]['cntPoint'][1].y - rectangle_point[0]['cntPoint'][2].y) /
          (rectangle_point[0]['cntPoint'][1].x - rectangle_point[0]['cntPoint'][2].x)

        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        console.log((rectangle_point[0]['cntPoint'][1].x - rectangle_point[0]['cntPoint'][2].x))

        if (!isFinite(slope)) {
          slope = (rectangle_point[0]['cntPoint'][1].y - rectangle_point[0]['cntPoint'][2].y) /
            ((rectangle_point[0]['cntPoint'][1].x + 1) - (rectangle_point[0]['cntPoint'][2].x - 1))
        }

        /**
         * 計算y軸為0的x值
         * (?,videoheight)
         */

        let start_y = tempHeight;
        let start_x = (start_y + slope * result_x - result_y) / slope
        let start_point = new cv.Point(start_x, start_y)

        /**
         * 計算y軸為videoheight的x值
         * (?,videoheight)
         */
        let end_y = 0;
        let end_x = (end_y + slope * result_x - result_y) / slope
        let end_point = new cv.Point(end_x, end_y)
        cv.line(drawDst, start_point, end_point, new cv.Scalar(200, 0, 200), 10, cv.LINE_AA, 0)

        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        console.log((end_point.x - start_point.x))

        console.log('------------------------------')
        rectangle_point.forEach(function (ele) {

          let x0 = start_point.x;
          let y0 = start_point.y;

          let x1 = end_point.x;
          let y1 = end_point.y;

          let x2 = ele.cntInfo.center.x;
          let y2 = ele.cntInfo.center.y;

          let val = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0)

          console.log(val)


          if (val < threshold && val > -threshold)
            split_Mid.push(ele)
          else if (val > threshold)
            split_Right.push(ele)
          else if (val < -threshold)
            split_Left.push(ele)


        })

        if (split_Mid.length) {
          if (result_x > tempWidth / 2) {
            split_Right = split_Mid;
            split_Mid = [];
            split_Left = [];
          }

          if (result_x < tempWidth / 2) {
            split_Left = split_Mid;
            split_Mid = [];
            split_Right = [];
          }
        }

        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')

        let right_val = split_Right.length;
        let left_val = split_Left.length;
        filter_calss = filter_dict[left_val][right_val]


        console.log([filter_calss, split_Left, split_Right])
        return [filter_calss, split_Left, split_Right]

      }


      return spllit_calc(rectangle_point, result_x, result_y);
    }

    /**
     * 延伸修正矩形 rectangle_calc()
     * @param {Array} standard - 一邊四個完整的矩形
     * @param {Array} side - 另一邊不完整的矩形
     * @param {Array} fixdata - 修正需要使用到矩形頂點index號碼
     * @return {Array} - 回傳補正後的矩形
     */
    let rectangle_calc = (standard, side, fixdata) => {

      let x, y, cntPoint = [];

      if (!(typeof standard === "undefined") && !(typeof side === "undefined")) {
        /**
         * 其中一邊為4個矩形
         * 另一邊有1個以上的矩形
         * 或
         * 另一邊為0個矩形
         */
        if (side.length) {


          let two_check = false,
            three_check = false;

          function judge_two() {


            let splitX = 0,
              splitY = 0,
              p1 = 1,
              p2 = 2;
            let spacing_big = false,
              spacing_small = false,
              spacing_mid = false;
            let calc_idx = {
              'right': {
                'top': {
                  'idx1': 0,
                  'idx2': 0,
                  'index1': [2, 1],
                  'index2': [0, 1]
                },
                'bottom': {
                  'idx1': 1,
                  'idx2': 0,
                  'index1': [1, 2],
                  'index2': [3, 2]
                }
              },
              'left': {
                'top': {
                  'idx1': 0,
                  'idx2': 0,
                  'index1': [3, 0],
                  'index2': [1, 0]
                },
                'bottom': {
                  'idx1': 1,
                  'idx2': 0,
                  'index1': [0, 3],
                  'index2': [2, 3]
                }
              }

            }

            for (let i = 0; i < side.length; i++) {
              splitX += side[i]['cntInfo'].center.x;
              splitY += side[i]['cntInfo'].center.y;
            }
            splitX /= side.length;
            splitY /= side.length;

            side.forEach(function (ele) {

              let distance = Math.sqrt(Math.pow(ele.cntInfo.center.x - splitX, 2) + Math.pow(ele.cntInfo.center.y - splitY, 2))
              let length = Math.sqrt(Math.pow(ele.cntPoint[p1].x - ele.cntPoint[p2].x, 2) + Math.pow(ele.cntPoint[p1].y - ele.cntPoint[p2].y, 2))
              let val = distance / length

              if (val > 1.3 && val < 1.7) {
                spacing_big = true;
                spacing_mid = false;
                spacing_small = false;
                console.log('spacing_big')
              }
              if (val > 0.85 && val < 1.3) {
                spacing_mid = true;
                spacing_big = false;
                spacing_small = false;
                //console.log('spacing_mid')
              }

              if (val > 0.4 && val < 0.65) {
                spacing_small = true;
                spacing_mid = false;
                spacing_big = false;
                //console.log('spacing_small')
              }

            })


            return spacing_big
          }

          function judge_three() {

            let temp_x = 0,
              temp_y = 0,
              judge = false;

            side.forEach(function (ele) {
              temp_x += ele.cntInfo.center.y;
            })

            let val = (temp_x / 3 / side[1].cntInfo.center.y).toFixed(3)

            if (val > 0.95 && val < 1.05)
              judge = false
            else
              judge = true

            return judge

          }

          /**
           * 如果可以直接補正不做延伸的判斷
           */
          if (side.length == 2)
            two_check = judge_two()

          if (side.length == 3)
            three_check = judge_three()

          console.log(two_check, three_check)

          if (two_check)
            side = A8_sheet_makeup(side, 0, 0)

          if (three_check)
            side = A8_sheet_makeup(side, 0, 0)

          if (!two_check && !three_check) {
            let total_index = [0, 1, 2, 3]
            /**
             * 判斷兩邊缺失的矩形
             */
            for (let k = 0; k < side.length; k++) {

              for (let j = 0; j < standard.length; j++) {

                let valx = (side[k].cntPoint[fixdata[0]].y / standard[j].cntPoint[fixdata[1]].y).toFixed(3)
                //let valy = (side[j].cntPoint[fixdata[0]].y / standard[k].cntPoint[fixdata[1]].y).toFixed(3)

                if (valx > 0.92 && valx < 1.08)
                  total_index.splice(total_index.indexOf(j), 1);

              }
            }

            /**
             * 補正缺失矩形
             */
            for (let j = 0; j < total_index.length; j++) {

              let value = total_index[j]

              x = standard[value].cntPoint[fixdata[1]].x;
              y = standard[value].cntPoint[fixdata[1]].y;
              cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
              cntPoint.push({ 'x': x, 'y': y })
              x = standard[value].cntPoint[fixdata[3]].x;
              y = standard[value].cntPoint[fixdata[3]].y;
              cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
              cntPoint.push({ 'x': x, 'y': y })
              x = (2 * standard[value].cntPoint[fixdata[1]].x - 1 * standard[value].cntPoint[fixdata[0]].x) / (2 - 1)
              y = (2 * standard[value].cntPoint[fixdata[1]].y - 1 * standard[value].cntPoint[fixdata[0]].y) / (2 - 1)
              cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
              cntPoint.push({ 'x': x, 'y': y })
              x = (2 * standard[value].cntPoint[fixdata[3]].x - 1 * standard[value].cntPoint[fixdata[2]].x) / (2 - 1)
              y = (2 * standard[value].cntPoint[fixdata[3]].y - 1 * standard[value].cntPoint[fixdata[2]].y) / (2 - 1)
              cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
              cntPoint.push({ 'x': x, 'y': y })

              side.push(calcCntInfo(cntPoint));
              cntPoint = [];

            }


          }


        } else {

          /**
           * 另一邊為0個矩形
           * 補正缺失矩形
           */
          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata[1]].x;
            y = standard[k].cntPoint[fixdata[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata[3]].x;
            y = standard[k].cntPoint[fixdata[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata[1]].x - 1 * standard[k].cntPoint[fixdata[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata[1]].y - 1 * standard[k].cntPoint[fixdata[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata[3]].x - 1 * standard[k].cntPoint[fixdata[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata[3]].y - 1 * standard[k].cntPoint[fixdata[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            side.push(calcCntInfo(cntPoint));
            cntPoint = [];

          }
        }

      }

      const total = standard.concat(side);

      return total;
    };

    /**
     * 4:0 4:1 4:2 4:3
     * @param {Array} top - 分割後上方的矩形
     * @param {Array} bottom - 分割下上方的矩形
     * @return {Array} - 回傳補正後的矩形
     */
    let f2_extends_rectangle = function (left, right) {

      let data = {
        'fixRight': [0, 1, 3, 2],
        'fixLeft': [1, 0, 2, 3]
      }

      const result = (left.length > right.length) ? rectangle_calc(left, right, data.fixRight) : rectangle_calc(right, left, data.fixLeft);
      return result
    }

    /**
     * @param {Array} top - 分割後上方的矩形
     * @param {Array} bottom - 分割下上方的矩形
     * @return {Array} - 回傳補正後的矩形
     */
    let f1_extends_rectangle = function (left, right) {

      let fix_rect_angle = []

      let data = {
        'fixRight': [0, 1, 3, 2],
        'fixLeft': [1, 0, 2, 3]
      }

      /**
       * 其中一邊矩形為0個 另一邊矩形有3個或2個
       * 或是
       * 其中一邊矩形為1個 另一邊矩形有3個或2個
       */
      if (!(left.length) || !(right.length)) {

        let calc = function (standard, side, fixdata) {

          let splitX = 0,
            splitY = 0;

          for (let i = 0; i < standard.length; i++) {
            splitX += standard[i]['cntInfo'].center.x;
            splitY += standard[i]['cntInfo'].center.y;
          }
          splitX /= standard.length;
          splitY /= standard.length;

          if (!side.length) {
            standard = A8_sheet_makeup(standard, splitX, splitY);
            side = [];
          }

          let x, y, cntPoint = [];

          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata[1]].x;
            y = standard[k].cntPoint[fixdata[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata[3]].x;
            y = standard[k].cntPoint[fixdata[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata[1]].x - 1 * standard[k].cntPoint[fixdata[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata[1]].y - 1 * standard[k].cntPoint[fixdata[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata[3]].x - 1 * standard[k].cntPoint[fixdata[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata[3]].y - 1 * standard[k].cntPoint[fixdata[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            side.push(calcCntInfo(cntPoint));
            cntPoint = [];

          }

          if (standard.length == 4)
            return rectangle_calc(standard, side, fixdata)
          else
            return standard.concat(side)

        }

        fix_rect_angle = (left.length > right.length) ? calc(left, right, data.fixRight) : calc(right, left, data.fixLeft)

      } else {
        //其中一邊矩形為1個 另一邊矩形有2個
        let one_and_two = function (standard, side, fixdata, diect) {

          let splitX = 0,
            splitY = 0,
            p1 = 1,
            p2 = 2;
          let spacing_big = false,
            spacing_small = false,
            spacing_mid = false;
          let calc_idx = {
            'right': {
              'top': {
                'idx1': 0,
                'idx2': 0,
                'index1': [2, 1],
                'index2': [0, 1]
              },
              'bottom': {
                'idx1': 1,
                'idx2': 0,
                'index1': [1, 2],
                'index2': [3, 2]
              }
            },
            'left': {
              'top': {
                'idx1': 0,
                'idx2': 0,
                'index1': [3, 0],
                'index2': [1, 0]
              },
              'bottom': {
                'idx1': 1,
                'idx2': 0,
                'index1': [0, 3],
                'index2': [2, 3]
              }
            }

          }

          function judge() {

            for (let i = 0; i < standard.length; i++) {
              splitX += standard[i]['cntInfo'].center.x;
              splitY += standard[i]['cntInfo'].center.y;
            }
            splitX /= standard.length;
            splitY /= standard.length;

            standard.forEach(function (ele) {

              let distance = Math.sqrt(Math.pow(ele.cntInfo.center.x - splitX, 2) + Math.pow(ele.cntInfo.center.y - splitY, 2))
              let length = Math.sqrt(Math.pow(ele.cntPoint[p1].x - ele.cntPoint[p2].x, 2) + Math.pow(ele.cntPoint[p1].y - ele.cntPoint[p2].y, 2))
              let val = distance / length

              if (val > 1.3 && val < 1.7) {
                spacing_big = true;
                spacing_mid = false;
                spacing_small = false;
                console.log('spacing_big')
              }
              if (val > 0.85 && val < 1.3) {
                spacing_mid = true;
                spacing_big = false;
                spacing_small = false;
                console.log('spacing_mid')
              }

              if (val > 0.4 && val < 0.65) {
                spacing_small = true;
                spacing_mid = false;
                spacing_big = false;
                console.log('spacing_small')
              }

            })

          }

          function big_calc(pointArr, idx1, idx2, idx3, idx4) {

            let new_array = [...pointArr]

            let square_1 = {
              square: pointArr[0],
              idx_1: 2,
              idx_2: 3
            }

            let square_2 = {
              square: pointArr[1],
              idx_1: 1,
              idx_2: 0
            }

            let result = two_rectangle_big_calc(square_1, square_2)

            new_array.push(result[0])
            new_array.push(result[1])

            return new_array;
          }

          function mid_2_calc(standard, side, idx1, idx2, idx3, idx4, index) {

            let p1, p2, p3, p4, a1, b1, c1, a2, b2, c2, det;
            let Intersection = function () {
              a1 = p2.y - p1.y;
              b1 = p1.x - p2.x;
              c1 = p1.x * p2.y - p2.x * p1.y;
              a2 = p4.y - p3.y;
              b2 = p3.x - p4.x;
              c2 = p3.x * p4.y - p4.x * p3.y;
              det = a1 * b2 - a2 * b1;
            }

            let new_array = [...standard]
            let x = 0,
              y = 0,
              cntPoint = [];

            p1 = {
              'x': standard[index.idx1].cntPoint[index.index1[0]].x,
              'y': standard[index.idx1].cntPoint[index.index1[0]].y
            }
            p2 = {
              'x': standard[index.idx1].cntPoint[index.index1[1]].x,
              'y': standard[index.idx1].cntPoint[index.index1[1]].y
            }
            p3 = { 'x': side[index.idx2].cntPoint[index.index2[0]].x, 'y': side[index.idx2].cntPoint[index.index2[0]].y }
            p4 = { 'x': side[index.idx2].cntPoint[index.index2[1]].x, 'y': side[index.idx2].cntPoint[index.index2[1]].y }
            Intersection();

            x = (c1 * b2 - c2 * b1) / det
            y = (a1 * c2 - a2 * c1) / det
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })

            x = (standard[index.idx1].cntPoint[index.index2[0]].x)
            y = (standard[index.idx1].cntPoint[index.index2[0]].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })

            x = (standard[index.idx1].cntPoint[index.index2[1]].x)
            y = (standard[index.idx1].cntPoint[index.index2[1]].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })

            x = (side[index.idx2].cntPoint[index.index2[1]].x)
            y = (side[index.idx2].cntPoint[index.index2[1]].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })

            new_array.push(calcCntInfo(cntPoint))

            cntPoint = [];
            x = (standard[0].cntPoint[idx2].x)
            y = (standard[0].cntPoint[idx2].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })
            x = (standard[0].cntPoint[idx3].x)
            y = (standard[0].cntPoint[idx3].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })
            x = (standard[1].cntPoint[idx1].x)
            y = (standard[1].cntPoint[idx1].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })
            x = (standard[1].cntPoint[idx4].x)
            y = (standard[1].cntPoint[idx4].y)
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            cntPoint.push({ 'x': x, 'y': y })

            new_array.push(calcCntInfo(cntPoint))
            cntPoint = [];

            return new_array;
          }

          function smail_calc(standard, side, index, standIdx) {

            //第三個參數為side的index
            let new_array = [...standard]
            let x = 0,
              y = 0,
              cntPoint = [];

            x = (2 * side[0].cntPoint[index[1]].x - 1 * side[0].cntPoint[index[0]].x) / (2 - 1)
            y = (2 * side[0].cntPoint[index[1]].y - 1 * side[0].cntPoint[index[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[0].cntPoint[index[3]].x - 1 * side[0].cntPoint[index[2]].x) / (2 - 1)
            y = (2 * side[0].cntPoint[index[3]].y - 1 * side[0].cntPoint[index[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[0].cntPoint[index[1]].x
            y = side[0].cntPoint[index[1]].y
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[0].cntPoint[index[3]].x
            y = side[0].cntPoint[index[3]].y
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            new_array.push(calcCntInfo(cntPoint))
            cntPoint = [];


            x = (2 * side[0].cntPoint[index[3]].x - 1 * side[0].cntPoint[index[2]].x) / (2 - 1)
            y = (2 * side[0].cntPoint[index[3]].y - 1 * side[0].cntPoint[index[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[0].cntPoint[index[3]].x
            y = side[0].cntPoint[index[3]].y
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[standIdx].cntPoint[index[0]].x
            y = standard[standIdx].cntPoint[index[0]].y
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[standIdx].cntPoint[index[1]].x
            y = standard[standIdx].cntPoint[index[1]].y
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)
            new_array.push(calcCntInfo(cntPoint))
            cntPoint = [];

            return new_array
          }

          judge();

          console.log(spacing_big, spacing_mid, spacing_small)

          if (spacing_big) {
            standard = big_calc(standard, 1, 2, 3, 0);
            fix_rect_angle = rectangle_calc(standard, side, fixdata)
          }

          if (spacing_mid) {

            let splitX = 0,
              splitY = 0;
            for (let i = 0; i < standard.length; i++) {
              splitX += standard[i]['cntInfo'].center.x;
              splitY += standard[i]['cntInfo'].center.y;
            }
            splitX /= standard.length;
            splitY /= standard.length;

            if (diect == 'right') {

              console.log(diect)

              let val_1 = standard[0].cntPoint[0].y / side[0].cntPoint[2].y;
              let val_2 = standard[1].cntPoint[3].y / side[0].cntPoint[1].y;

              console.log(val_1, val_2)

              if ((val_1 > 0.9 && val_1 < 1.05))
                standard = mid_2_calc(standard, side, 1, 2, 3, 0, calc_idx.right.top)

              if ((val_2 > 0.9 && val_2 < 1.05))
                standard = mid_2_calc(standard, side, 1, 2, 3, 0, calc_idx.right.bottom)

              if (!((val_1 > 0.9 && val_1 < 1.05) || (val_2 > 0.9 && val_2 < 1.05)))
                standard = A8_sheet_makeup(standard, splitX, splitY);

            }

            if (diect == 'left') {

              console.log(diect)
              let val_1 = standard[0].cntPoint[1].y / side[0].cntPoint[3].y;
              let val_2 = standard[1].cntPoint[2].y / side[0].cntPoint[0].y;

              if ((val_1 > 0.9 && val_1 < 1.05)) {
                standard = mid_2_calc(standard, side, 1, 2, 3, 0, calc_idx.left.top)
              }

              if ((val_2 > 0.9 && val_2 < 1.05)) {
                standard = mid_2_calc(standard, side, 1, 2, 3, 0, calc_idx.left.bottom)
              }

              if (!((val_1 > 0.9 && val_1 < 1.05) || (val_2 > 0.9 && val_2 < 1.05))) {
                standard = A8_sheet_makeup(standard, splitX, splitY);
              }

            }

            if (standard.length == 4) {
              fix_rect_angle = rectangle_calc(standard, side, fixdata)
            }
          }

          if (spacing_small) {

            let splitX = 0,
              splitY = 0;
            for (let i = 0; i < standard.length; i++) {
              splitX += standard[i]['cntInfo'].center.x;
              splitY += standard[i]['cntInfo'].center.y;
            }
            splitX /= standard.length;
            splitY /= standard.length;


            if (diect == 'right') {

              let val_1 = (standard[0].cntPoint[0].y - side[0].cntPoint[2].y) / 200;
              let val_2 = (standard[1].cntPoint[3].y - side[0].cntPoint[1].y) / 200;

              console.log(val_1, val_2)

              if (val_1 < 1.25 && val_1 > 0.90) {
                standard = smail_calc(standard, side, [0, 1, 3, 2], 0)
                console.log('top')
              }

              if (val_2 < -0.8 && val_2 > -1.25) {

                standard = smail_calc(standard, side, [3, 2, 0, 1], 1)
                console.log('bottom')
              }

              if (!(val_1 < 1.25 && val_1 > 0.90) && !(val_2 < -0.8 && val_2 > -1.25)) {
                standard = A8_sheet_makeup(standard, splitX, splitY);
                console.log('und')
              }


            }

            if (diect == 'left') {

              let val_1 = (standard[0].cntPoint[1].y - side[0].cntPoint[3].y) / 200;
              let val_2 = (standard[1].cntPoint[2].y - side[0].cntPoint[0].y) / 200;


              if (val_1 < 1.25 && val_1 > 0.90) {

                standard = smail_calc(standard, side, [1, 0, 2, 3], 0)
                console.log('top')
              }

              if (val_2 < -0.8 && val_2 > -1.25) {
                standard = smail_calc(standard, side, [2, 3, 1, 0], 1)
                console.log('bottom')
              }

              if (!(val_1 < 1.25 && val_1 > 0.90) && !(val_2 < -0.8 && val_2 > -1.25)) {
                standard = A8_sheet_makeup(standard, splitX, splitY);
                console.log('und')
              }

            }

            if (standard.length == 4) {
              fix_rect_angle = rectangle_calc(standard, side, fixdata)
            }


          }

        }

        let one_and_three = function (standard, side, fixdata, diect) {

          function judge() {

            let temp_x = 0,
              temp_y = 0,
              judge = 0;

            standard.forEach(function (ele) {
              temp_y += ele.cntInfo.center.y;
            })

            let val = (temp_y / 3 / standard[1].cntInfo.center.y).toFixed(3)

            if (val > 0.92 && val < 1.08)
              judge = 1
            else
              judge = 0

            return judge

          }

          function rect_is_stick(standard, side, fixdata, diect) {

            let splitX = 0,
              splitY = 0;
            for (let i = 0; i < standard.length; i++) {
              splitX += standard[i]['cntInfo'].center.x;
              splitY += standard[i]['cntInfo'].center.y;
            }
            splitX /= standard.length;
            splitY /= standard.length;


            if (diect == 'right') {

              let val_1 = standard[0].cntPoint[0].y / side[0].cntPoint[2].y;
              let val_2 = standard[2].cntPoint[3].y / side[0].cntPoint[1].y;

              console.log(val_1, val_2)

              if (val_1 < 1.1 && val_1 > 0.9) {

                standard = A8_sheet_makeup(standard, splitX, splitY, 'top')
                console.log('top')
              }

              if (val_2 < 1.1 && val_2 > 0.9) {

                standard = A8_sheet_makeup(standard, splitX, splitY, 'bottom')
                console.log('bottom')
              }

              if (!((val_1 < 1.1 && val_1 > 0.9)) && !((val_2 < 1.1 && val_2 > 0.9))) {
                standard = A8_sheet_makeup(standard, splitX, splitY)
                console.log('und')
              }

            }

            if (diect == 'left') {

              let val_1 = standard[0].cntPoint[1].y / side[0].cntPoint[3].y;
              let val_2 = standard[2].cntPoint[2].y / side[0].cntPoint[0].y;

              if (val_1 < 1.1 && val_1 > 0.9) {

                standard = A8_sheet_makeup(standard, splitX, splitY, 'top')
                console.log('top')
              }

              if (val_2 < 1.1 && val_2 > 0.9) {

                standard = A8_sheet_makeup(standard, splitX, splitY, 'bottom')
                console.log('bottom')
              }

              if (!((val_1 < 1.1 && val_1 > 0.9)) && !((val_2 < 1.1 && val_2 > 0.9))) {
                standard = A8_sheet_makeup(standard, splitX, splitY)
                console.log('und')
              }


            }

            if (standard.length == 4)
              fix_rect_angle = rectangle_calc(standard, side, fixdata)


          }

          function rect_no_stick(standard, side, fixdata, diect) {

            let no_stick_makeup = function (standard) {

              let newPointArr = [...standard];
              let total_distance = [];
              let index1, index2;
              let x = 0,
                y = 0,
                cntPoint = [];

              for (let index = 0; index < standard.length - 1; index++) {
                let index1 = index;
                let index2 = index + 1;
                let distance = Math.sqrt(Math.pow(standard[index1].cntInfo.center.x - standard[index2].cntInfo.center.x, 2) +
                  Math.pow(standard[index1].cntInfo.center.y - standard[index2].cntInfo.center.y, 2))
                total_distance.push(distance)
              }

              if (total_distance[0] < total_distance[1]) {
                index1 = 1;
                index2 = 2;
              } else {
                index1 = 0;
                index2 = 1;
              }

              let square_1 = {
                square: standard[index1],
                idx_1: 2,
                idx_2: 3
              }

              let square_2 = {
                square: standard[index2],
                idx_1: 0,
                idx_2: 1
              }

              newPointArr.push(three_rectangle_no_stick_calc(square_1, square_2))

              newPointArr.sort(function (a, b) {
                return a.cntInfo.center.y - b.cntInfo.center.y;
              });

              return newPointArr
            }

            fix_rect_angle = no_stick_makeup(standard);

            fix_rect_angle = rectangle_calc(fix_rect_angle, side, fixdata)
          }

          const stick = judge()

          stick ? rect_is_stick(standard, side, fixdata, diect) : rect_no_stick(standard, side, fixdata, diect)

        }

        let dict = [
          [null, null, null, null],
          [null, null, '12', '13'],
          [null, '21', null, null],
          [null, '31', null, null]
        ]

        let judge_filter = dict[left.length][right.length];


        if (judge_filter == '12' || judge_filter == '21') {
          (left.length > right.length) ? one_and_two(left, right, data.fixRight, 'left') : one_and_two(right, left, data.fixLeft, 'right')
        }

        if (judge_filter == '13' || judge_filter == '31') {
          (left.length > right.length) ? one_and_three(left, right, data.fixRight, 'left') : one_and_three(right, left, data.fixLeft, 'right')

        }

      }


      return fix_rect_angle
    }

    let f3_extends_rectangle = function (left, right) {

      let data = {
        'fixRight': [0, 1, 3, 2],
        'fixLeft': [1, 0, 2, 3]
      }

      let fix_rect_angle = [];

      let dict = [
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, '22', '23', null],
        [null, null, '32', '33', null],
        [null, null, null, null, null]
      ]

      let two_and_two = function (left, right) {

        function judge(standard) {

          let splitX = 0,
            splitY = 0,
            p1 = 1,
            p2 = 2;
          let spacing_big = false,
            spacing_small = false,
            spacing_mid = false;
          for (let i = 0; i < standard.length; i++) {
            splitX += standard[i]['cntInfo'].center.x;
            splitY += standard[i]['cntInfo'].center.y;
          }
          splitX /= standard.length;
          splitY /= standard.length;

          standard.forEach(function (ele) {

            let distance = Math.sqrt(Math.pow(ele.cntInfo.center.x - splitX, 2) + Math.pow(ele.cntInfo.center.y - splitY, 2))
            let length = Math.sqrt(Math.pow(ele.cntPoint[p1].x - ele.cntPoint[p2].x, 2) + Math.pow(ele.cntPoint[p1].y - ele.cntPoint[p2].y, 2))
            let val = distance / length

            if (val > 1.3 && val < 1.7) {
              spacing_big = true;
              spacing_mid = false;
              spacing_small = false;
              //console.log('spacing_big')
            }
            if (val > 0.85 && val < 1.3) {
              spacing_mid = true;
              spacing_big = false;
              spacing_small = false;
              //console.log('spacing_mid')
            }

            if (val > 0.4 && val < 0.65) {
              spacing_small = true;
              spacing_mid = false;
              spacing_big = false;
              //console.log('spacing_small')
            }

          })


          return [spacing_big, spacing_mid, spacing_small]
        }

        function big_calc(pointArr, idx1, idx2, idx3, idx4) {

          let new_array = [...pointArr]

          let square_1 = {
            square: pointArr[0],
            idx_1: 2,
            idx_2: 3
          }

          let square_2 = {
            square: pointArr[1],
            idx_1: 1,
            idx_2: 0
          }

          let result = two_rectangle_big_calc(square_1, square_2)

          new_array.push(result[0])
          new_array.push(result[1])

          return new_array;
        }

        function mid_and_small_calc(standard, side, fixdata1, fixdata2) {

          let x = 0,
            y = 0,
            cntPoint = [];

          let top_temp = [...standard];
          let bottom_temp = [...side];


          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata1[1]].x;
            y = standard[k].cntPoint[fixdata1[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata1[3]].x;
            y = standard[k].cntPoint[fixdata1[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[1]].x - 1 * standard[k].cntPoint[fixdata1[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[1]].y - 1 * standard[k].cntPoint[fixdata1[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[3]].x - 1 * standard[k].cntPoint[fixdata1[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[3]].y - 1 * standard[k].cntPoint[fixdata1[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            bottom_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          for (let k = 0; k < side.length; k++) {

            x = side[k].cntPoint[fixdata2[1]].x;
            y = side[k].cntPoint[fixdata2[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[k].cntPoint[fixdata2[3]].x;
            y = side[k].cntPoint[fixdata2[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[1]].x - 1 * side[k].cntPoint[fixdata2[0]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[1]].y - 1 * side[k].cntPoint[fixdata2[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[3]].x - 1 * side[k].cntPoint[fixdata2[2]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[3]].y - 1 * side[k].cntPoint[fixdata2[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            top_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          return top_temp.concat(bottom_temp)
        }

        function stick_makeup(standard, side, left, right, fixdata1, fixdata2) {

          let x = 0,
            y = 0,
            cntPoint = [];

          let top_temp = [...left];
          let bottom_temp = [...right];
          // standard = [standard[1], standard[2]];
          // side = [side[0]]

          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata1[1]].x;
            y = standard[k].cntPoint[fixdata1[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata1[3]].x;
            y = standard[k].cntPoint[fixdata1[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[1]].x - 1 * standard[k].cntPoint[fixdata1[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[1]].y - 1 * standard[k].cntPoint[fixdata1[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[3]].x - 1 * standard[k].cntPoint[fixdata1[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[3]].y - 1 * standard[k].cntPoint[fixdata1[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            bottom_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          for (let k = 0; k < side.length; k++) {

            x = side[k].cntPoint[fixdata2[1]].x;
            y = side[k].cntPoint[fixdata2[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[k].cntPoint[fixdata2[3]].x;
            y = side[k].cntPoint[fixdata2[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[1]].x - 1 * side[k].cntPoint[fixdata2[0]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[1]].y - 1 * side[k].cntPoint[fixdata2[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[3]].x - 1 * side[k].cntPoint[fixdata2[2]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[3]].y - 1 * side[k].cntPoint[fixdata2[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            top_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];
          }

          top_temp = A8_sheet_makeup(top_temp, 0, 0)
          bottom_temp = A8_sheet_makeup(bottom_temp, 0, 0)

          return top_temp.concat(bottom_temp)
        }

        let result_left = judge(left);
        let result_right = judge(right);

        if (result_left[0] || result_right[0]) {

          if (result_left[0] && result_right[0]) {
            left = big_calc(left, 1, 2, 3, 0);
            right = big_calc(right, 1, 2, 3, 0);
            fix_rect_angle = left.concat(right)
          } else if (result_left[0]) {
            let standard = big_calc(left, 1, 2, 3, 0);
            let side = right;
            fix_rect_angle = rectangle_calc(standard, side, data.fixRight)
          } else if (result_right[0]) {
            let standard = big_calc(right, 1, 2, 3, 0);
            let side = left;
            fix_rect_angle = rectangle_calc(standard, side, data.fixLeft)
          }

        }

        if (result_left[1] && result_right[1]) {

          let val_1 = left[0].cntPoint[1].y / right[0].cntPoint[0].y
          let val_2 = left[1].cntPoint[1].y / right[1].cntPoint[0].y

          if (!((val_1 < 1.1 && val_1 > 0.95) && (val_2 < 1.1 && val_2 > 0.95))) {
            fix_rect_angle = mid_and_small_calc(left, right, data.fixRight, data.fixLeft)
            console.log('mid and mid')
          }

        }

        if (result_left[2] && result_right[2]) {

          let val_1 = left[0].cntPoint[1].y / right[1].cntPoint[3].y;
          let val_2 = left[1].cntPoint[2].y / right[0].cntPoint[0].y;

          if (val_1 < 1.1 && val_1 > 0.9 || val_2 < 1.1 && val_2 > 0.9)
            fix_rect_angle = mid_and_small_calc(left, right, data.fixRight, data.fixLeft)

          console.log('small')
        }

        if (result_left[2] && result_right[1]) {

          let val_1 = left[1].cntPoint[1].y / right[1].cntPoint[3].y
          let val_2 = left[1].cntPoint[1].y / right[0].cntPoint[0].y

          if (val_1 < 1.1 && val_1 > 0.9) {
            fix_rect_angle = stick_makeup([left[1]], [right[0]], left, right, data.fixRight, data.fixLeft)
          }

          if (val_2 < 1.1 && val_2 > 0.9) {
            fix_rect_angle = stick_makeup([left[0]], [right[1]], left, right, data.fixRight, data.fixLeft)
          }

        }

        if (result_left[1] && result_right[2]) {

          let val_1 = left[1].cntPoint[1].y / right[0].cntPoint[0].y
          let val_2 = left[0].cntPoint[1].y / right[0].cntPoint[3].y

          console.log(val_1, val_2)

          if (val_1 < 1.1 && val_1 > 0.9) {
            fix_rect_angle = stick_makeup([left[0]], [right[1]], left, right, data.fixRight, data.fixLeft)
          }

          if (val_2 < 1.1 && val_2 > 0.9) {
            fix_rect_angle = stick_makeup([left[1]], [right[0]], left, right, data.fixRight, data.fixLeft)
          }

        }

      }

      let three_and_three = function (left, right) {

        function judge(standard) {

          let temp_x = 0,
            temp_y = 0,
            judge = 0;

          standard.forEach(function (ele) {
            temp_y += ele.cntInfo.center.y;
          })

          let val = (temp_y / 3 / standard[1].cntInfo.center.y).toFixed(3)

          if (val > 0.995 && val < 1.005)
            judge = 0
          else
            judge = 1

          return judge

        }

        function no_stick_makeup(standard) {

          let newPointArr = [...standard];
          let total_distance = [];
          let index1, index2;
          let x = 0,
            y = 0,
            cntPoint = [];

          for (let index = 0; index < standard.length - 1; index++) {
            let index1 = index;
            let index2 = index + 1;
            let distance = Math.sqrt(Math.pow(standard[index1].cntInfo.center.x - standard[index2].cntInfo.center.x, 2) +
              Math.pow(standard[index1].cntInfo.center.y - standard[index2].cntInfo.center.y, 2))
            total_distance.push(distance)
          }

          if (total_distance[0] < total_distance[1]) {
            index1 = 1;
            index2 = 2;
          } else {
            index1 = 0;
            index2 = 1;
          }

          let square_1 = {
            square: standard[index1],
            idx_1: 2,
            idx_2: 3
          }

          let square_2 = {
            square: standard[index2],
            idx_1: 0,
            idx_2: 1
          }

          newPointArr.push(three_rectangle_no_stick_calc(square_1, square_2))

          newPointArr.sort(function (a, b) {
            return a.cntInfo.center.y - b.cntInfo.center.y;
          });

          return newPointArr

        }

        function stick_makeup(standard, side, fixdata1, fixdata2) {

          let x = 0,
            y = 0,
            cntPoint = [];
          let top_temp = [...standard];
          let bottom_temp = [...side];

          standard = [standard[2]];
          side = [side[0]]

          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata1[1]].x;
            y = standard[k].cntPoint[fixdata1[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata1[3]].x;
            y = standard[k].cntPoint[fixdata1[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[1]].x - 1 * standard[k].cntPoint[fixdata1[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[1]].y - 1 * standard[k].cntPoint[fixdata1[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[3]].x - 1 * standard[k].cntPoint[fixdata1[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[3]].y - 1 * standard[k].cntPoint[fixdata1[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            bottom_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          for (let k = 0; k < side.length; k++) {

            x = side[k].cntPoint[fixdata2[1]].x;
            y = side[k].cntPoint[fixdata2[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[k].cntPoint[fixdata2[3]].x;
            y = side[k].cntPoint[fixdata2[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[1]].x - 1 * side[k].cntPoint[fixdata2[0]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[1]].y - 1 * side[k].cntPoint[fixdata2[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[3]].x - 1 * side[k].cntPoint[fixdata2[2]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[3]].y - 1 * side[k].cntPoint[fixdata2[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            top_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          return top_temp.concat(bottom_temp)
        }

        let result_left = judge(left);
        let result_right = judge(right);

        //其中一邊為間隔 result_left || result_right
        if (result_left || result_right) {

          if (result_left && result_right) {

            left = no_stick_makeup(left);
            right = no_stick_makeup(right);
            fix_rect_angle = left.concat(right)

          } else if (result_left) {

            let side = right;
            fix_rect_angle = no_stick_makeup(left);
            fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixRight)

          } else if (result_right) {

            let side = left;
            fix_rect_angle = no_stick_makeup(right);
            fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixLeft)
          }

        }

        //左右方的三格都相黏並且為對角
        if (!result_left && !result_right) {

          let val_1 = left[1].cntPoint[1].y / right[1].cntPoint[3].y;
          let val_2 = left[2].cntPoint[1].y / right[0].cntPoint[3].y;

          if (val_1 < 1.1 && val_1 > 0.9) {
            fix_rect_angle = stick_makeup(left, right, data.fixRight, data.fixLeft)
          }

          if (val_2 < 1.1 && val_2 > 0.9) {
            fix_rect_angle = stick_makeup(right, left, data.fixLeft, data.fixRight)
          }

          console.log(val_1, val_2)
        }

      }

      let three_and_two = function (left, right) {


        function three_rectangle_judge(standard) {

          let temp_x = 0,
            temp_y = 0,
            judge = false;

          standard.forEach(function (ele) {
            temp_y += ele.cntInfo.center.y;
          })

          let val = (temp_y / 3 / standard[1].cntInfo.center.y).toFixed(3)

          if (val > 0.995 && val < 1.005)
            judge = false
          else
            judge = true

          return [judge]

        }

        function two_rectangle_judge(standard) {

          let splitX = 0,
            splitY = 0,
            p1 = 1,
            p2 = 2;
          let spacing_big = false,
            spacing_small = false,
            spacing_mid = false;
          for (let i = 0; i < standard.length; i++) {
            splitX += standard[i]['cntInfo'].center.x;
            splitY += standard[i]['cntInfo'].center.y;
          }
          splitX /= standard.length;
          splitY /= standard.length;

          standard.forEach(function (ele) {

            let distance = Math.sqrt(Math.pow(ele.cntInfo.center.x - splitX, 2) + Math.pow(ele.cntInfo.center.y - splitY, 2))
            let length = Math.sqrt(Math.pow(ele.cntPoint[p1].x - ele.cntPoint[p2].x, 2) + Math.pow(ele.cntPoint[p1].y - ele.cntPoint[p2].y, 2))
            let val = distance / length

            if (val > 1.3 && val < 1.7) {
              spacing_big = true;
              spacing_mid = false;
              spacing_small = false;
              console.log('spacing_big')
            }
            if (val > 0.85 && val < 1.3) {
              spacing_mid = true;
              spacing_big = false;
              spacing_small = false;
              console.log('spacing_mid')
            }

            if (val > 0.4 && val < 0.65) {
              spacing_small = true;
              spacing_mid = false;
              spacing_big = false;
              console.log('spacing_small')
            }

          })


          return [spacing_big, spacing_mid, spacing_small]

        }

        function three_calc_stick_makeup(standard) {

          let newPointArr = [...standard];
          let total_distance = [];
          let index1, index2;
          let x = 0,
            y = 0,
            cntPoint = [];

          for (let index = 0; index < standard.length - 1; index++) {
            let index1 = index;
            let index2 = index + 1;
            let distance = Math.sqrt(Math.pow(standard[index1].cntInfo.center.x - standard[index2].cntInfo.center.x, 2) +
              Math.pow(standard[index1].cntInfo.center.y - standard[index2].cntInfo.center.y, 2))
            total_distance.push(distance)
          }

          if (total_distance[0] < total_distance[1]) {
            index1 = 1;
            index2 = 2;
          } else {
            index1 = 0;
            index2 = 1;
          }

          let square_1 = {
            square: standard[index1],
            idx_1: 2,
            idx_2: 3
          }

          let square_2 = {
            square: standard[index2],
            idx_1: 0,
            idx_2: 1
          }

          newPointArr.push(three_rectangle_no_stick_calc(square_1, square_2))

          newPointArr.sort(function (a, b) {
            return a.cntInfo.center.y - b.cntInfo.center.y;
          });

          return newPointArr

        }

        function two_calc_big_makeup(pointArr, idx1, idx2, idx3, idx4) {

          let new_array = [...pointArr]

          let square_1 = {
            square: pointArr[0],
            idx_1: 2,
            idx_2: 3
          }

          let square_2 = {
            square: pointArr[1],
            idx_1: 1,
            idx_2: 0
          }

          let result = two_rectangle_big_calc(square_1, square_2)

          new_array.push(result[0])
          new_array.push(result[1])

          return new_array;
        }

        function stick_makeup(standard, side, top_temp, bottom_temp, fixdata1, fixdata2) {

          let x = 0,
            y = 0,
            cntPoint = [];

          // let top_temp = [...standard];
          // let bottom_temp = [...side];
          // standard = [standard[1], standard[2]];
          // side = [side[0]]

          for (let k = 0; k < standard.length; k++) {

            x = standard[k].cntPoint[fixdata1[1]].x;
            y = standard[k].cntPoint[fixdata1[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = standard[k].cntPoint[fixdata1[3]].x;
            y = standard[k].cntPoint[fixdata1[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[1]].x - 1 * standard[k].cntPoint[fixdata1[0]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[1]].y - 1 * standard[k].cntPoint[fixdata1[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * standard[k].cntPoint[fixdata1[3]].x - 1 * standard[k].cntPoint[fixdata1[2]].x) / (2 - 1)
            y = (2 * standard[k].cntPoint[fixdata1[3]].y - 1 * standard[k].cntPoint[fixdata1[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            bottom_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          for (let k = 0; k < side.length; k++) {

            x = side[k].cntPoint[fixdata2[1]].x;
            y = side[k].cntPoint[fixdata2[1]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = side[k].cntPoint[fixdata2[3]].x;
            y = side[k].cntPoint[fixdata2[3]].y;
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[1]].x - 1 * side[k].cntPoint[fixdata2[0]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[1]].y - 1 * side[k].cntPoint[fixdata2[0]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            x = (2 * side[k].cntPoint[fixdata2[3]].x - 1 * side[k].cntPoint[fixdata2[2]].x) / (2 - 1)
            y = (2 * side[k].cntPoint[fixdata2[3]].y - 1 * side[k].cntPoint[fixdata2[2]].y) / (2 - 1)
            cntPoint.push({ 'x': x, 'y': y })
            cv.circle(drawDst, new cv.Point(x, y), circle_range, circle_color, circle_thickness, cv.LINE_AA, 0)

            top_temp.push(calcCntInfo(cntPoint))
            cntPoint = [];

          }

          return top_temp.concat(bottom_temp)
        }

        let left_judge = '',
          right_judge = ''

        if (left.length == 2) {
          left_judge = two_rectangle_judge(left)
        } else if (left.length == 3) {
          left_judge = three_rectangle_judge(left)
        }

        if (right.length == 2) {
          right_judge = two_rectangle_judge(right)
        } else if (right.length == 3) {
          right_judge = three_rectangle_judge(right)
        }

        //兩邊或其中一邊滿足條件 left_judge[0] || right_judge[0]
        if (left_judge[0] || right_judge[0]) {

          if (left_judge[0] && right_judge[0]) {

            if (left_judge.length < right_judge.length) {

              left = three_calc_stick_makeup(left)

              right = two_calc_big_makeup(right, 1, 2, 3, 0)

            } else {

              left = two_calc_big_makeup(left, 1, 2, 3, 0)

              right = three_calc_stick_makeup(right)

            }

            fix_rect_angle = left.concat(right)

            console.log('兩邊都滿足條件 分別可以自補')

          } else {

            if (left_judge[0]) {

              let side = right;
              if (left_judge.length === 1) {
                fix_rect_angle = three_calc_stick_makeup(left)
                fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixRight)
              } else {
                fix_rect_angle = two_calc_big_makeup(left, 1, 2, 3, 0)
                fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixRight)
              }

            } else if (right_judge[0]) {

              let side = left;
              if (right_judge.length === 1) {
                fix_rect_angle = three_calc_stick_makeup(right)
                fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixLeft)
              } else {
                fix_rect_angle = two_calc_big_makeup(right, 1, 2, 3, 0)
                fix_rect_angle = rectangle_calc(fix_rect_angle, side, data.fixLeft)
              }
            }

            console.log('其中一邊滿足條件')
          }

        } else {

          if (left_judge.length == 1) {

            // 左三右二
            console.log(right_judge)

            if (right_judge[2]) {

              let val_1 = left[0].cntPoint[1].y / right[1].cntPoint[0].y
              let val_2 = left[2].cntPoint[2].y / right[0].cntPoint[3].y

              console.log(val_1, val_2)

              if (val_1 < 1.1 && val_1 > 0.9)
                fix_rect_angle = stick_makeup([left[1], left[2]], [right[0]], left, right, data.fixRight, data.fixLeft)

              if (val_2 < 1.1 && val_2 > 0.9)
                fix_rect_angle = stick_makeup([left[0], left[1]], [right[1]], left, right, data.fixRight, data.fixLeft)

              console.log('右2 big to 左3')
            }

            if (right_judge[1]) {

              let val_1 = left[0].cntPoint[1].y / right[0].cntPoint[3].y
              let val_2 = left[2].cntPoint[2].y / right[1].cntPoint[0].y

              console.log(val_1, val_2)

              if (val_1 < 1.1 && val_1 > 0.9)
                fix_rect_angle = stick_makeup([left[0], left[2]], [right[0]], left, right, data.fixRight, data.fixLeft)

              if (val_2 < 1.1 && val_2 > 0.9)
                fix_rect_angle = stick_makeup([left[0], left[2]], [right[1]], left, right, data.fixRight, data.fixLeft)

              console.log('右2 MID to 左3')
            }

          }

          //right_judge.length == 1

          if (right_judge.length == 1) {

            // 左二右三

            if (left_judge[2]) {

              let val_1 = right[0].cntPoint[0].y / left[1].cntPoint[1].y
              let val_2 = right[2].cntPoint[0].y / left[0].cntPoint[1].y

              if (val_1 < 1.1 && val_1 > 0.9)
                fix_rect_angle = stick_makeup([right[1], right[2]], [left[0]], left, right, data.fixLeft, data.fixRight)

              if (val_2 < 1.1 && val_2 > 0.9)
                fix_rect_angle = stick_makeup([right[0], right[1]], [left[1]], left, right, data.fixLeft, data.fixRight)

              console.log('左2 big to 右3')
            }


            if (left_judge[1]) {

              let val_1 = right[0].cntPoint[0].y / left[0].cntPoint[2].y
              let val_2 = right[2].cntPoint[3].y / left[1].cntPoint[1].y

              if (val_1 < 1.1 && val_1 > 0.9)
                fix_rect_angle = stick_makeup([right[0], right[2]], [left[0]], left, right, data.fixLeft, data.fixRight)

              if (val_2 < 1.1 && val_2 > 0.9)
                fix_rect_angle = stick_makeup([right[0], right[2]], [left[1]], left, right, data.fixLeft, data.fixRight)

              console.log('左2 mid to 右3')
            }

          }

        }

      }

      let judge_filter = dict[left.length][right.length];

      if (judge_filter == '22')
        two_and_two(left, right)

      if (judge_filter == '33')
        three_and_three(left, right)

      if (judge_filter == '32' || judge_filter == '23')
        three_and_two(left, right)


      if (fix_rect_angle.length) {
        return fix_rect_angle
      } else {

        left = A8_sheet_makeup(left, 0, 0)
        right = A8_sheet_makeup(right, 0, 0)
        fix_rect_angle = left.concat(right)
        console.log('沒有矩形可以參考!!!!!')
        return fix_rect_angle
      }


    }


    let split_rectangle = split_judge_rectangle(rectangle_point)


    switch (split_rectangle[0]) {
      case 'f0':

        rectangle_result = rectangle_point.slice(0);
        break;
      case 'f2':

        rectangle_result = f2_extends_rectangle(split_rectangle[1], split_rectangle[2])
        break;
      case 'f1':
        rectangle_result = f1_extends_rectangle(split_rectangle[1], split_rectangle[2])
        break;
      case 'f3':

        rectangle_result = f3_extends_rectangle(split_rectangle[1], split_rectangle[2])
        break;
      default:
      //console.log('null');
    }

    if (rectangle_result.length) {
      return AllSortRectangleV2(rectangle_result)
    }

    return rectangle_point
  }

  const res = horizon ? test(rectangle_point, resultX, resultY) : test2(rectangle_point, resultX, resultY)

  return res
}



export { A8_sheet_ver2, A4_sheet, B4_sheet }