// 传递图片url或者图片文件
export const imageToCanvas = (image, canvasId) => {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  let img = new Image();
  if (typeof image === 'string') {
    img.src = image;
  } else {
    img = image;
  }
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    const canvasImg = canvas.toDataURL('image/png');
  };
}

// 绘制选择框
let animationFrameId = null;
export const drawSelectBox = (selector, info) => {
  let canvas
  let {width, height} = info
  if(typeof selector == 'string'){
    canvas = document.querySelector(selector)
  }else {
    canvas = selector
  }
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d');
  let offset = 0; // 虚线偏移
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    offset -= 0.1;

    ctx.strokeStyle = '#067BEF';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); 
    ctx.lineDashOffset = -offset; 
    ctx.strokeRect(
      0.5,
      0.5,
      Math.floor(width) - 1,
      Math.floor(height) - 1
    );
    if(animationFrameId) cancelAnimationFrame(animationFrameId)//取消上一次动画防止卡顿
    animationFrameId = requestAnimationFrame(draw)
  }
  draw();
}
// document.addEventListener('mouseup',() => {
//   if(animationFrameId) cancelAnimationFrame(animationFrameId)//取消上一次动画防止卡顿
// })
// 清空画布内容
export const clearCanvas = (canvas) => {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export const drawGrid = (selector, fillStyle = 'white') => {
  let canvas
  if(typeof selector == 'string'){
    canvas = document.querySelector(selector)
  }else {
    canvas = selector
  }
  const ctx = canvas.getContext('2d');
  
  const cellSize = 15; // 网格单元格大小
  const width = canvas.width;
  const height = canvas.height;
  ctx.strokeStyle = '#ccc';
  // 设置背景为白色
  ctx.fillStyle = fillStyle;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // 使网格线条变得更细且清晰
  ctx.translate(0.5, 0.5)
  // 要使网格线条变得更细且清晰，可以尝试以下方法：
  // 使用子像素渲染：设置 canvas 的宽度和高度时，可以使用小数值，以获得更高的分辨率。例如，将宽度和高度设置为 400.5，而不是整数值 400。这将触发子像素渲染，使线条看起来更加清晰。
  // 使用反锯齿技术：在绘制网格线条之前，使用 ctx.translate(0.5, 0.5); 将绘图上下文进行微调。这会将线条的起点和终点移动半个像素，从而帮助消除锯齿效果。


  // 绘制垂直线
  for (let x = 0; x < width; x += cellSize) {
    ctx.lineWidth = Math.floor((x / cellSize) % 4) === 0 ? 0.5 : 1
    ctx.strokeStyle = Math.floor((x / cellSize) % 4) === 0 ? '#ccc' : '#F2F2F2'; // 第五列边框粗一点
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // 绘制水平线
  for (let y = 0; y < height; y += cellSize) {
    ctx.strokeStyle = Math.floor((y / cellSize) % 4) === 0 ? '#ccc' : '#F2F2F2'; // 第五列边框粗一点
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

// 绘制圆角矩形
export const drawRoundRect = (selector, info) => {
  let canvas
  if(typeof selector == 'string'){
    canvas = document.querySelector(selector)
  }else {
    canvas = selector
  }
  const defaultInfo = {
    width: 80,
    height: 50,
    borderWidth: 8,
    cornerRadius: 0.3,
    fillColor: '#D6D6D6'
  }
  info = {...defaultInfo, ...info}
  const ctx = canvas.getContext('2d');
  let {width, height, borderWidth, cornerRadius, fillColor} = info
  let x = 0, y = 0
  canvas.width = info.width
  canvas.height = info.height
  const halfBorderWidth = borderWidth / 2; // 半个边框宽度
  if(cornerRadius <= 1) {
    cornerRadius *= height
  }
  if(2 * cornerRadius >= width) cornerRadius = width/2
  let radius = cornerRadius - halfBorderWidth
  if(radius <= 0) radius = 0
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = fillColor;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(x + cornerRadius + halfBorderWidth, y + halfBorderWidth);
  ctx.lineTo(x + width - cornerRadius - halfBorderWidth, y + halfBorderWidth);
  ctx.arcTo(x + width - halfBorderWidth, y + halfBorderWidth, x + width - halfBorderWidth, y + cornerRadius + halfBorderWidth, radius);
  ctx.lineTo(x + width - halfBorderWidth, y + height - cornerRadius - halfBorderWidth);
  ctx.arcTo(x + width - halfBorderWidth, y + height - halfBorderWidth, x + width - cornerRadius - halfBorderWidth, y + height - halfBorderWidth, radius);
  ctx.lineTo(x + cornerRadius + halfBorderWidth, y + height - halfBorderWidth);
  ctx.arcTo(x + halfBorderWidth, y + height - halfBorderWidth, x + halfBorderWidth, y + height - cornerRadius - halfBorderWidth, radius);
  ctx.lineTo(x + halfBorderWidth, y + cornerRadius + halfBorderWidth);
  ctx.arcTo(x + halfBorderWidth, y + halfBorderWidth, x + cornerRadius + halfBorderWidth, y + halfBorderWidth, radius);
  ctx.closePath();

  ctx.fill(); // 填充圆角矩形
  ctx.stroke(); // 绘制圆角矩形边框
  const canvasImg = canvas.toDataURL('image/png');
  return canvasImg;
}

export const drawRectangle = (selector, info) => {
  let canvas
  if(typeof selector == 'string'){
    canvas = document.querySelector(selector)
  }else {
    canvas = selector
  }
  const defaultInfo = {
    width: 80,
    height: 50,
    borderWidth: 2,
    fillColor: '#D6D6D6'
  }
  info = {...defaultInfo, ...info}
  const ctx = canvas.getContext('2d');
  let {width, height, borderWidth, fillColor} = info
  let x = 0, y = 0
  canvas.width = width
  canvas.height = height
  const halfBorderWidth = borderWidth / 2; // 半个边框宽度

  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = fillColor;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  // 绘制矩形填充
  // ctx.fillRect(x + halfBorderWidth, y + halfBorderWidth, width - borderWidth, height - borderWidth);

  // 绘制矩形边框
  ctx.strokeRect(x + halfBorderWidth, y + halfBorderWidth, width - borderWidth, height - borderWidth);
  ctx.closePath();
  const canvasImg = canvas.toDataURL('image/png');
  return canvasImg;
}

// 绘制三角形
export const drawTriangle = (selector, info) => {
  let canvas
  if(typeof selector == 'string'){
    canvas = document.querySelector(selector)
  }else {
    canvas = selector
  }
  const ctx = canvas.getContext('2d');
  const defaultInfo = {
    width: 100,
    height: 100,
    borderWidth: 2,
    fillColor: "#D6D6D6"
  }
  info = {...defaultInfo, ...info}
  let {width, height, borderWidth, fillColor} = info
  canvas.width = width
  canvas.height = height
  const x1 = width / 2; // 第一个顶点的x坐标
  const y1 = borderWidth; // 第一个顶点的y坐标
  const x2 = 0.5; // 第二个顶点的x坐标
  const y2 = height + 1; // 第二个顶点的y坐标
  const x3 = width; // 第三个顶点的x坐标
  const y3 = height + 1; // 第三个顶点的y坐标

  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = fillColor;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(x1, y1); // 移动到第一个顶点
  ctx.lineTo(x2 + borderWidth, y2 - borderWidth); // 连线到第二个顶点
  ctx.lineTo(x3 - borderWidth, y3 - borderWidth); // 连线到第三个顶点
  ctx.closePath();

  ctx.fill(); // 填充三角形
  ctx.stroke(); // 绘制三角形边框
  const canvasImg = canvas.toDataURL('image/png');
  return canvasImg;
}

// 绘制圆/椭圆形
export const drawCircle = (selector, info) => {
  let canvas
  if(typeof selector == 'string'){
    canvas = document.querySelector(selector)
  }else {
    canvas = selector
  }
  const ctx = canvas.getContext('2d');
  const defaultInfo = {
    borderWidth: 6,
    fillColor: "#D6D6D6",
    width: 100,
    height: 100
  }
  info = {...defaultInfo, ...info}
  let {borderWidth, fillColor, width, height} = info
  let radiusX = width / 2 - borderWidth / 2;
  let radiusY = height / 2 - borderWidth / 2;
  const centerX = width / 2; // 圆心的x坐标
  const centerY = height / 2; // 圆心的y坐标
  if(radiusX < 0) radiusX = 0
  if(radiusY < 0) radiusY = 0
  canvas.width = width
  canvas.height = height
  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = fillColor;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
  ctx.closePath();

  ctx.fill(); // 填充圆形
  ctx.stroke(); // 绘制圆形边框
  // const canvasImg = canvas.toDataURL('image/png');
  // return canvasImg;
}

// 绘制菱形
export const drawRhombus = (selector, info) => {
  let canvas
  if(typeof selector == 'string'){
    canvas = document.querySelector(selector)
  }else {
    canvas = selector
  }
  const ctx = canvas.getContext('2d');
  const defaultInfo = {
    width: 100,
    height: 70,
    borderWidth: 2,
    fillColor: "#D6D6D6"
  }
  info = {...defaultInfo, ...info}
  const {width, height, borderWidth, fillColor} = info
  canvas.width = width
  canvas.height = height

  const x1 = width / 2; // 第一个顶点的x坐标
  const y1 = 0 + borderWidth; // 第一个顶点的y坐标
  const x2 = 0; // 第二个顶点的x坐标
  const y2 = height / 2; // 第二个顶点的y坐标
  const x3 = width / 2; // 第三个顶点的x坐标
  const y3 = height - borderWidth; // 第三个顶点的y坐标
  const x4 = width - borderWidth; // 第四个顶点的x坐标
  const y4 = height / 2; // 第四个顶点的y坐标

  ctx.lineWidth = borderWidth;
  ctx.strokeStyle = 'black';
  ctx.fillStyle = fillColor;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(x1, y1); // 移动到第一个顶点
  ctx.lineTo(x2, y2); // 连线到第二个顶点
  ctx.lineTo(x3, y3); // 连线到第三个顶点
  ctx.lineTo(x4, y4); // 连线到第四个顶点
  ctx.closePath();

  ctx.fill(); // 填充菱形
  ctx.stroke(); // 绘制菱形边框
  const canvasImg = canvas.toDataURL('image/png');
  return canvasImg;
}

export default {
  imageToCanvas,
  drawSelectBox,
  clearCanvas,
  drawGrid,
  drawRoundRect,
  drawRectangle,
  drawTriangle,
  drawCircle,
  drawRhombus
}