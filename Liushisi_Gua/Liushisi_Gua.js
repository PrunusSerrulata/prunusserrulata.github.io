"use strict";

var plainTextarea, cipherTextarea
var b64Table = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9,\\+,/".split(",")
var guaTable = "䷀,䷁,䷂,䷃,䷄,䷅,䷆,䷇,䷈,䷉,䷊,䷋,䷌,䷍,䷎,䷏,䷐,䷑,䷒,䷓,䷔,䷕,䷖,䷗,䷘,䷙,䷚,䷛,䷜,䷝,䷞,䷟,䷠,䷡,䷢,䷣,䷤,䷥,䷦,䷧,䷨,䷩,䷪,䷫,䷬,䷭,䷮,䷯,䷰,䷱,䷲,䷳,䷴,䷵,䷶,䷷,䷸,䷹,䷺,䷻,䷼,䷽,䷾,䷿".split(",")

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
    var res = str
    for (let i = 0; i < b64Table.length; i++) {
        res = res.replace(new RegExp(b64Table[i], "g"), guaTable[i])
    }
    return res.replace(/=/g, "")
}

function guatoB64(str) {
    var res = str
    var remain = str.length % 4
    for (let i = 0; i < guaTable.length; i++) {
        res = res.replace(new RegExp(guaTable[i], "g"), b64Table[i])
    }
    return res + "=".repeat(remain == 0 ? 0 : 4-remain)
}



window.onload = function () {
    plainTextarea = document.getElementById("plain")
    cipherTextarea = document.getElementById("cipher")
}

function encode() {
    cipherTextarea.value = b64toGua(b64EncodeUnicode(plainTextarea.value))
}

function decode() {
    plainTextarea.value = b64DecodeUnicode(guatoB64(cipherTextarea.value))
}