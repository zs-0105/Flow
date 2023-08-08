function expandColor(color) {
    // 检查是否是三位颜色值
    if (color.length === 3) {
      // 获取三位颜色值的每个字符
      var r = color[0];
      var g = color[1];
      var b = color[2];
  
      // 扩展为六位颜色值
      color = '' + r + r + g + g + b + b;
    }
  
    return color;
  }
  
function hexToRgb(color) {
    // 去除 # 号
    color = color.replace("#", "");

    // 扩展为六位颜色值
    color = expandColor(color);

    // 拆分颜色值
    var r = parseInt(color.substring(0, 2), 16);
    var g = parseInt(color.substring(2, 4), 16);
    var b = parseInt(color.substring(4, 6), 16);

    // 检查每个分量值是否有效
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
        return "Invalid color";
    }

    // 返回 RGB 值
    return "rgb(" + r + ", " + g + ", " + b + ")";
};
function rgbToHex(r, g, b) {
    // 将每个分量转换为对应的十六进制字符串
    var hexR = r.toString(16).padStart(2, '0');
    var hexG = g.toString(16).padStart(2, '0');
    var hexB = b.toString(16).padStart(2, '0');
  
    // 拼接三个十六进制字符串
    var hexColor = '#' + hexR + hexG + hexB;
  
    return hexColor;
}
function getRGBValues(rgbString) {
    // 去除字符串中的空格，并将字符串拆分为三个部分（R、G、B）
    var values = rgbString.replace(/\s/g, '').match(/^rgb\((\d+),(\d+),(\d+)\)$/);
  
    if (values) {
      // 提取数值并转换为整数
      var r = parseInt(values[1]);
      var g = parseInt(values[2]);
      var b = parseInt(values[3]);
  
      // 返回包含RGB数值的对象
      return {
        r: r,
        g: g,
        b: b
      };
    }
  
    // 如果无法提取数值，则返回空对象
    return {};
}
function isValidHexColor(value) {
    // 去除可能存在的 "#" 符号
    value = value.replace("#", "");
  
    // 使用正则表达式验证是否为合法的十六进制颜色值
    var regex = /^([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
    return regex.test(value);
}
export {
    hexToRgb,rgbToHex,getRGBValues,isValidHexColor
}