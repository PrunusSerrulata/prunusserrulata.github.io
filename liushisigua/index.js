"use strict";

var plainTextarea, cipherTextarea, passwordInput;
const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("")
const GUA = "䷀䷁䷂䷃䷄䷅䷆䷇䷈䷉䷊䷋䷌䷍䷎䷏䷐䷑䷒䷓䷔䷕䷖䷗䷘䷙䷚䷛䷜䷝䷞䷟䷠䷡䷢䷣䷤䷥䷦䷧䷨䷩䷪䷫䷬䷭䷮䷯䷰䷱䷲䷳䷴䷵䷶䷷䷸䷹䷺䷻䷼䷽䷾䷿".split("")
const TABLE = Object.assign.apply({}, B64.map((v, i) => { return { [v]: GUA[i] } }))
const REVTABLE = Object.assign.apply({}, GUA.map((v, i) => { return { [v]: B64[i] } }))

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
        navigator.serviceWorker.register('/liushisigua/sw.js')
            .then(function (registration) {
                console.log('[Service Worker] Registration succeeded');
            })
            .catch(function (err) {
                console.log('[Service Worker] Registration failed');
            });
    }

    plainTextarea = document.getElementById("plain")
    cipherTextarea = document.getElementById("cipher")
    passwordInput = document.getElementById("password")
}

function byteArrayFromInt(num) {
    return [num >> 24, (num << 8) >> 24, (num << 16) >> 24, (num << 24) >> 24]
}

function intFromByteArray(arr) {
    return (arr[0] << 24) + (arr[1] << 16) + (arr[2] << 8) + arr[3]
}

async function encrypt(password, plaintext) {
    const crypto = window.crypto;

    const padLen = Math.floor(Math.random() * 29) + 4;
    let padding = new Uint8Array(padLen);
    crypto.getRandomValues(padding);

    let pbkdfSalt = new Uint8Array(8);
    crypto.getRandomValues(pbkdfSalt);

    let pbkdfKey = await crypto.subtle.importKey(
        "raw", password, "PBKDF2", false, ["deriveBits"]
    );
    let derivedKeys = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            hash: "SHA-256",
            salt: pbkdfSalt,
            iterations: 10000
        },
        pbkdfKey, 104 * 8
    );

    let cryptoSalt = new Uint8Array(derivedKeys.slice(0, 8));
    let authKey = new Uint8Array(derivedKeys.slice(8, 40));
    let encKey = derivedKeys.slice(40, 104);

    const plainSize = byteArrayFromInt(plaintext.length);
    const msgLen = cryptoSalt.length + plainSize.length + plaintext.length + padLen;
    let msg = new Uint8Array(msgLen);
    msg.set(cryptoSalt);
    msg.set(plainSize, cryptoSalt.length);
    msg.set(plaintext, cryptoSalt.length + plainSize.length);
    msg.set(padding, cryptoSalt.length + plainSize.length + plaintext.length);

    let authMaterial = new Uint8Array(authKey.length + msg.length);
    authMaterial.set(authKey);
    authMaterial.set(msg, authKey.length);
    let msgKeyLarge = await crypto.subtle.digest("SHA-256", authMaterial);
    let msgKey = msgKeyLarge.slice(8, 24);

    let hmacKey = await crypto.subtle.importKey(
        "raw", encKey,
        {
            name: "HMAC",
            hash: "SHA-384"
        },
        false, ["sign"]
    );
    let streamKeys = await crypto.subtle.sign(
        {
            name: "HMAC"
        },
        hmacKey, msgKey
    );
    let symKey = streamKeys.slice(0, 32);
    let nonce = streamKeys.slice(32, 48);

    let aesKey = await crypto.subtle.importKey(
        "raw", symKey,
        {
            name: "AES-CTR"
        },
        false, ["encrypt"]
    );
    const ciphertext = await crypto.subtle.encrypt(
        {
            name: "AES-CTR",
            counter: nonce,
            length: 64
        },
        aesKey, msg
    );

    let result = new Uint8Array(
        pbkdfSalt.length + msgKey.byteLength +
        ciphertext.byteLength
    );
    result.set(pbkdfSalt);
    result.set(new Uint8Array(msgKey), pbkdfSalt.length);
    result.set(new Uint8Array(ciphertext), pbkdfSalt.length + msgKey.byteLength);

    return result;
}

function compareConstantTime(a1, a2) {
    if (a1.length != a2.length) {
        return 1;
    }

    var result = 0;
    for (let i = 0; i < a1.length; i++) {
        result |= (a1[i] - a2[i]);
    }
    return result;
}

async function decrypt(password, ciphertext) {
    if (ciphertext.length <= 36) {
        throw new Error("ciphertext too short");
    }

    let pbkdfSalt = ciphertext.slice(0, 8);
    let msgKey = ciphertext.slice(8, 24);
    let encData = ciphertext.slice(24, ciphertext.length);

    let pbkdfKey = await crypto.subtle.importKey(
        "raw", password, "PBKDF2", false, ["deriveBits"]
    );
    let derivedKeys = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            hash: "SHA-256",
            salt: pbkdfSalt,
            iterations: 10000
        },
        pbkdfKey, 104 * 8
    );

    let cryptoSalt = new Uint8Array(derivedKeys.slice(0, 8));
    let authKey = new Uint8Array(derivedKeys.slice(8, 40));
    let encKey = derivedKeys.slice(40, 104);

    let hmacKey = await crypto.subtle.importKey(
        "raw", encKey,
        {
            name: "HMAC",
            hash: "SHA-384"
        },
        false, ["sign"]
    );
    let streamKeys = await crypto.subtle.sign(
        {
            name: "HMAC"
        },
        hmacKey, msgKey
    );
    let symKey = streamKeys.slice(0, 32);
    let nonce = streamKeys.slice(32, 48);

    let aesKey = await crypto.subtle.importKey(
        "raw", symKey,
        {
            name: "AES-CTR"
        },
        false, ["decrypt"]
    );
    let plainMsg = await crypto.subtle.decrypt(
        {
            name: "AES-CTR",
            counter: nonce,
            length: 64
        },
        aesKey, encData
    );

    plainMsg = new Uint8Array(plainMsg);

    let authMaterial = new Uint8Array(authKey.length + plainMsg.length);
    authMaterial.set(authKey);
    authMaterial.set(plainMsg, authKey.length);
    let msgKeyLarge = await crypto.subtle.digest("SHA-256", authMaterial);
    let recoveredMsgKey = new Uint8Array(msgKeyLarge.slice(8, 24));
    let recoveredSalt = plainMsg.slice(0, 8);

    let invalid = compareConstantTime(msgKey, recoveredMsgKey) |
                  compareConstantTime(cryptoSalt, recoveredSalt);

    if (invalid) {
        throw new Error("invalid ciphertext");
    }

    let length = intFromByteArray(plainMsg.slice(8, 12));
    return plainMsg.slice(12, length + 12);
}

function encode() {
    var plaintext;

    if (passwordInput.value.length && plainTextarea.value.length) {
        try {
            const encoder = new TextEncoder("utf-8");
            encrypt(
                encoder.encode(passwordInput.value),
                encoder.encode(plainTextarea.value)
            ).then((cipher) => {
                cipherTextarea.value = b64toGua(btoa(String.fromCharCode(...cipher)))
            }).catch((ex) => {
                alert("无法加密。请检查您所输入的内容，以及您的浏览器是否支持此功能。");
                console.error(ex.message)
            });
        } catch (ex) {
            alert("无法加密。请检查您所输入的内容，以及您的浏览器是否支持此功能。");
            console.error(ex.message)
        }
    } else {
        plaintext = plainTextarea.value;
        cipherTextarea.value = b64toGua(b64EncodeUnicode(plaintext))
    }
}

function decode() {
    var b64String = guatoB64(cipherTextarea.value);

    if (passwordInput.value.length && b64String.length) {
        try {
            const encoder = new TextEncoder("utf-8");
            const decoder = new TextDecoder("utf-8");
            decrypt(
                encoder.encode(passwordInput.value),
                Uint8Array.from(atob(b64String).split('').map((c) => c.charCodeAt(0)))
            ).then((cipher) => {
                plainTextarea.value = decoder.decode(cipher);
            }).catch((ex) => {
                switch (ex.message) {
                    case "ciphertext too short":
                        alert("密文过短，无法解密。请检查密文是否完整。");
                        break;
                    case "invalid ciphertext":
                        alert("密文错误，无法解密。请检查密文或密码是否正确。");
                        break;
                    default:
                        alert("无法解密。请检查密文或密码是否正确，以及您的浏览器是否支持此功能。");
                        break;
                }
                console.error(ex.message)
            });
        } catch (ex) {
            alert("无法解密。请检查密文或密码是否正确，以及您的浏览器是否支持此功能。");
            console.error(ex.message)
        }
    } else {
        plainTextarea.value = b64DecodeUnicode(b64String);
    }
}

function copyCipher() {
    navigator.clipboard.writeText(cipherTextarea.value)
}

function copyPlain() {
    navigator.clipboard.writeText(plainTextarea.value)
}
