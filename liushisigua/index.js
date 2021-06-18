"use strict";

var plainTextarea, cipherTextarea
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("")
const GUA = "䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿".split("")
const TABLE = Object.assign.apply({}, Array.prototype.map.call(B64, (v, i) => { return { [v]: GUA[i] } }))
const REVTABLE = Object.assign.apply({}, Array.prototype.map.call(GUA, (v, i) => { return { [v]: B64[i] } }))

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
    return Array.prototype.map.call(str, c => TABLE[c]).join("")
}

function guatoB64(str) {
    return Array.prototype.map.call(str, c => REVTABLE[c]).join("")
}



window.onload = function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/Liushisi_Gua/sw.js')
            .then(function (registration) {
                console.log('[Service Worker] Registration succeeded');
            })
            .catch(function (err) {
                console.log('[Service Worker] registration failed');
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