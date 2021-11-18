
# 前端文件掃描器 Javascript Document Scanner

使用 opencv.js 辨別文件區域，將白紙的區域提取出來，將畫面提取出來時會有一個控制框，當萬一辨識有誤時，可以讓使用者手動框選要做變換的區域，最後可以將白紙掃描出來。

## 辨識圖像的具體流程介紹

### 對圖像做前置處理

原始圖片(每一個Frame) ->

1.對圖片做cvtColor灰度化 ->

2.對圖片做GaussianBlur高斯模糊 ->

3.對圖片做Canny邊緣檢測算子，此時會得到黑底白線的圖片(輪廓) ->

4.對圖像做dilate膨脹處理，可以加粗白色線條 ->

5.最後需要對圖片做findContours

findcontours參考文件:https://docs.opencv.org/3.4/d5/daa/tutorial_js_contours_begin.html

### 查找畫面中矩形的詳細步驟

findContours會對圖片查找物體的輪廓，由於先前的圖片做過一連串的處理，圖片由黑底白線的線條構成，這時候使用findContours將白線線條所形成的輪廓做提取。

每一個輪廓都是由幾百甚至幾千個點(x,y)組成，這時候我們還需要對每一個輪廓做approxPolyDP，這時在畫面上由舉行所形成的輪廓做完approxPolyDP，提取頂點只有四個的輪廓(代表四邊形)，這四個頂點就是我們辨識的結果，也就是畫面中看到的矩形範圍。

approxPolyDP過後有四個頂點的輪廓很多，還需要根據大小，位置去將不需要的矩形(輪廓)過濾掉，最後就形成在影片中看到的結果

approxPolyDP參考文件:https://docs.opencv.org/4.x/dd/d49/tutorial_py_contour_features.html

Demo 參考影片

[https://youtu.be/gHPePMDGteE](https://youtu.be/gHPePMDGteE) 
