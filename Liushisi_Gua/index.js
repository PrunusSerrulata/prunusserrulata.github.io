"use strict";

var plainTextarea, cipherTextarea
const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("")
const gua = "䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿".split("")
const table = Object.assign.apply({}, Array.prototype.map.call(b64, (v, i) => { return { [v]: gua[i] } }))
const revtable = Object.assign.apply({}, Array.prototype.map.call(gua, (v, i) => { return { [v]: b64[i] } }))

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));
}

function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

function b64toGua(str) {
    return Array.prototype.map.call(str, c => table[c]).join("")
}

function guatoB64(str) {
    return Array.prototype.map.call(str, c => revtable[c]).join("")
}



window.onload = function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/Liushisi_Gua/sw.js')
            .then(function (registration) {
                console.log('ServiceWorker registration successed!');
            })
            .catch(function (err) {
                console.log('ServiceWorker registration failed!');
            });
    }

    plainTextarea = document.getElementById("plain")
    cipherTextarea = document.getElementById("cipher")
}

function encode() {
    cipherTextarea.value = b64toGua(b64EncodeUnicode(plainTextarea.value))
}

function decode() {
    plainTextarea.value = b64DecodeUnicode(guatoB64(cipherTextarea.value))
}