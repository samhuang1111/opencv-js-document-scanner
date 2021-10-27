class ScreenAttributes {
  constructor(work_sheet_nmae) {
    this.horizontal = false;
    this.vertical = false;
    this.big_boundingRect = {};
    this.big_rectangle = {};
    this.fix_judge = 0;
    this.screen_rectangle_number = null;

    this.sheet = {
      "sheet_name": work_sheet_nmae,
      "rect_width": 4,
      "rect_height": 2,
      "rect_total": 8
    };

    this.center = {
      'ctx': 0,
      'cty': 0
    };

    this.calc_sheet_judge = function () {

      switch (this.sheet.sheet_name) {
        case 'A4':
          this.sheet.rect_width = 2;
          this.sheet.rect_height = 2;
          this.sheet.rect_toal = 4;
          break;
        case 'B4':
          this.sheet.rect_width = 4;
          this.sheet.rect_height = 1;
          this.sheet.rect_toal = 4;
          break;
        case 'A8':
          this.sheet.rect_width = 4;
          this.sheet.rect_height = 2;
          this.sheet.rect_toal = 8;
          break;
        default:
          this.sheet.rect_width = 4;
          this.sheet.rect_height = 2;
          this.sheet.rect_toal = 8;
      }

      if (this.screen_rectangle_number != this.sheet.rect_toal &&
        this.screen_rectangle_number < this.sheet.rect_toal)
        this.fix_judge = 1;
    };

    this.calc_screen_info = function (screen_point) {
      this.screen_rectangle_number = screen_point.length;
      for (let k = 0; k < screen_point.length; k++) {
        const element = screen_point[k].cntInfo;
        this.center.ctx += element.center.x;
        this.center.cty += element.center.y;
        if (typeof element !== "undefined") {

          if (this.sheet.sheet_name == "B4")
            this.horizontal = element.angle < 20 ? false : true;
          else
            this.horizontal = element.angle < 50 ? false : true;

        }
      }
      this.center.ctx /= screen_point.length;
      this.center.cty /= screen_point.length;
    };
  }
}
export { ScreenAttributes };