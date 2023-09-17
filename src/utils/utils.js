export const generateUUID = function () {
    // let uuid = "xxxxxxxx_xxxx_4xxx-yxxx_xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    //   const r = (Math.random() * 16) | 0;
    //   const v = c === "x" ? r : (r & 0x3) | 0x8;
    //   return v.toString(16);
    // });
    // return uuid;
    return 'canvas' + Date.now()
  }