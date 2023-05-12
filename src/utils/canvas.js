export default {
    // 传递图片url或者图片文件
    imageToCanvas : (image, canvasId) => {
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
          console.log(canvasImg);
        };
    }
}