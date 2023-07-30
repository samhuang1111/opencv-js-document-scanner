
# 前端文件掃描器 Javascript Document Scanner

使用 opencv.js 辨別文件區域，將白紙的區域提取出來，將畫面提取出來時會有一個控制框，當萬一辨識有誤時，可以讓使用者手動框選要做變換的區域，最後可以將白紙掃描出來。

## Demo 參考影片
[https://youtu.be/gHPePMDGteE](https://youtu.be/gHPePMDGteE) 

## 辨識圖像的具體流程介紹

### 對圖像做前置處理

原始圖片(每一個Frame) ->

1.對圖片做cvtColor灰度化 ->

2.對圖片做GaussianBlur高斯模糊 ->

3.對圖片做Canny邊緣檢測算子，此時會得到黑底白線的圖片(邊界線條圖) ->

4.對圖像做dilate膨脹處理，可以加粗白色線條(加粗邊界線條) ->

5.最後需要對圖片做findContours提取輪廓

之後我們會需要根據輪廓去識別我們要的矩形(四邊形)

輪廓指的是什麼->可以簡單地解釋為連接所有連續點（沿邊界）的曲線，輪廓是形狀分析和對象檢測和識別的有用工具

findcontours參考文件:https://docs.opencv.org/3.4/d5/daa/tutorial_js_contours_begin.html

### 查找畫面中矩形的詳細步驟

findContours會對圖片查找物體的輪廓，由於先前的圖片做過一連串的處理，圖片由黑底白線的線條構成，這時候使用findContours將白線線條所形成的輪廓做提取。

每一個輪廓都是由幾百甚至幾千個點(x,y)組成，這時候我們還需要對每一個輪廓做approxPolyDP，這時在畫面上由舉行所形成的輪廓做完approxPolyDP，提取頂點只有四個的輪廓(代表四邊形)，這四個頂點就是我們辨識的結果，也就是畫面中看到的矩形範圍。

approxPolyDP過後有四個頂點的輪廓很多，還需要根據大小，位置去將不需要的矩形(輪廓)過濾掉，然後將座標畫在圖上，最後就形成在影片中看到的結果

approxPolyDP參考文件:https://docs.opencv.org/4.x/dd/d49/tutorial_py_contour_features.html

## 對圖片透視變換的說明

當圖像辨識完畢後，提供一個控制項可以讓使用紙自由拉伸想要做校正的區域，像這樣


<img src="https://raw.githubusercontent.com/tak40548798/opencv-js-document-scanner/master/readmeImage/%E6%9C%AA%E8%AE%8A%E6%8F%9B.png" style="height:380px;max-width:30%"/> <img src="https://raw.githubusercontent.com/tak40548798/opencv-js-document-scanner/master/readmeImage/%E9%80%8F%E8%A6%96%E8%AE%8A%E6%8F%9B%E5%9C%96.png" style="height:380px;max-width:30%"/>

藍色的框框是最後產生圖片的範圍，也就是要投影到的範圍，紅色的框框則是要提取的範圍，也就是warpperspective

在矩形的四個點頂(X,Y)，根據一個半徑繪製一個圓形，用滑鼠的座標和矩形的頂點(X,Y)也是圓的中心和圓的半徑去判斷，滑鼠是否移動到圓形內

當滑鼠點擊(mousedown)在圓形內部，做移動(mousemove)時，去更改所選到的這個矩形點頂的X,Y(更改資料)，然後再度繪製圓形(根據資料繪製圖片)

最後做透視變換根據每一個頂點的X,Y做warpperspective(根據資料)，就能得到結果

最後就會像影片上看到的那樣
