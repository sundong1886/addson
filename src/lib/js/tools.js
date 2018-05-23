/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function strToHexCharCode(str){
    if(str === ""){
        return "";
    }
    var hexCharCode = [];
    hexCharCode.push("0x");
    for(var i = 0;i < str.length;i++){
        hexCharCode.push((str.charCodeAt(i)).toString(16));
    }
    return hexCharCode.join("");
}


//function strToHexCharCode(str) {
//　　if(str === "")
//　　　　return "";
//　　var hexCharCode = [];
//　　hexCharCode.push("0x");
//　　for(var i = 0; i < str.length; i++) {
//　　　　hexCharCode.push((str.charCodeAt(i)).toString(16));
//　　}
//　　return hexCharCode.join("");
//}

 

//16进制转字符串

function hexCharCodeToStr(hexCharCodeStr){
    var trimedStr = hexCharCodeStr.trim();
    var rawStr = trimedStr.substr(0,2).toLowerCase() === "0x"
                    ?trimedStr.substr(2)
                    :trimedStr;
    var len = rawStr.length;
    if(len % 2 !== 0){
        alert("Illegal Format ASCII Code!");
        return "";
    }
    var curCharCode;
    var resultStr = [];
    for(var i = 0;i < len; i = i +2 ){
        curCharCode = parseInt(rawStr.substr(i,2), 16);
        resultStr.push(String.fromCharCode(curCharCode));
    }
    return resultStr.join("");
}

//function hexCharCodeToStr(hexCharCodeStr) {
//　　var trimedStr = hexCharCodeStr.trim();
//　　var rawStr =
//　　trimedStr.substr(0,2).toLowerCase() === "0x"
//　　?
//　　trimedStr.substr(2)
//　　:
//　　trimedStr;
//　　var len = rawStr.length;
//　　if(len % 2 !== 0) {
//　　　　alert("Illegal Format ASCII Code!");
//　　　　return "";
//　　}
//　　var curCharCode;
//　　var resultStr = [];
//　　for(var i = 0; i < len;i = i + 2) {
//　　　　curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
//　　　　resultStr.push(String.fromCharCode(curCharCode));
//　　}
//　　return resultStr.join("");
//}

//时间戳转换成Date对象字符串
function timeToFormatDate(long){
    // d = new Date(long);
    return new Date(long).Format("yyyy-MM-dd");
    //return d.getYear()+"-"+d.getMonth().length < 10?d.getMonth():"0"+d.getMonth()+"-"+d.getDate().length < 10?d.getDate():"0"+d.getDate();
}
Date.prototype.Format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

