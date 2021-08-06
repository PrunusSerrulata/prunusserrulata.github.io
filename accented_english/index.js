"use strict";

var header, textInput, accentuateButton, tipText, footer;
const TABLE = {
    "A": "ÁÀĂẮẰẴẲÂẤẦẪẨǍÅǺÄǞÃȦǠĄĀẢȀȂẠẶẬḀȺ".split(""),
    "B": "ḂḄḆɃƁƂ".split(""),
    "C": "ĆĈČĊÇḈȻƇ".split(""),
    "D": "ĎḊḐḌḒḎĐƉƊƋ".split(""),
    "E": "ÉÈĔÊẾỀỄỂĚËẼĖȨḜĘĒḖḔẺȄȆẸỆḘḚɆ".split(""),
    "F": "ḞƑ".split(""),
    "G": "ǴĞĜǦĠĢḠǤƓ".split(""),
    "H": "ĤȞḦḢḨḤḪHĦⱧ".split(""),
    "I": "ÍÌĬÎǏÏḮĨİĮĪỈȈȊỊḬIƗ".split(""),
    "J": "ĴɈ".split(""),
    "K": "ḰǨĶḲḴƘⱩ".split(""),
    "L": "ĹĽĻḶḸḼḺŁĿȽⱠⱢ".split(""),
    "M": "ḾṀṂM".split(""),
    "N": "ŃǸŇÑṄŅṆṊṈƝȠN".split(""),
    "O": "ÓÒŎÔỐỒỖỔǑÖȪŐÕṌṎȬȮȰØǾǪǬŌṒṐỎȌȎƠỚỜỠỞỢỌỘƟ".split(""),
    "P": "ṔṖⱣƤP".split(""),
    "Q": "QɊ".split(""),
    "R": "ŔŘṘŖȐȒṚṜṞɌⱤ".split(""),
    "S": "ŚṤŜŠṦṠŞṢṨȘS".split(""),
    "T": "ŤTṪŢṬȚṰṮŦȾƬƮ".split(""),
    "U": "ÚÙŬÛǓŮÜǗǛǙǕŰŨṸŲŪṺỦȔȖƯỨỪỮỬỰỤṲṶṴɄ".split(""),
    "V": "ṼṾƲ".split(""),
    "W": "ẂẀŴWẄẆẈ".split(""),
    "X": "ẌẊ".split(""),
    "Y": "ÝỲŶYŸỸẎȲỶỴɎƳ".split(""),
    "Z": "ŹẐŽŻẒẔƵȤⱫ".split(""),
    "a": "áàăắằẵẳâấầẫẩǎåǻäǟãȧǡąāảȁȃạặậḁⱥᶏ".split(""),
    "b": "ḃḅḇƀᵬᶀɓƃ".split(""),
    "c": "ćĉčċçḉȼƈɕ".split(""),
    "d": "ďḋḑḍḓḏđᵭᶁɖɗᶑƌȡ".split(""),
    "e": "éèĕêếềễểěëẽėȩḝęēḗḕẻȅȇẹệḙḛɇᶒ".split(""),
    "f": "ḟᵮᶂƒ".split(""),
    "g": "ǵğĝǧġģḡǥᶃɠ".split(""),
    "h": "ĥȟḧḣḩḥḫẖħⱨ".split(""),
    "i": "íìĭîǐïḯĩiįīỉȉȋịḭıɨᵻᶖ".split(""),
    "j": "ĵǰȷɉʝɟʄ".split(""),
    "k": "ḱǩķḳḵᶄƙⱪ".split(""),
    "l": "ĺľļḷḹḽḻłŀƚⱡɫɬᶅɭȴ".split(""),
    "m": "ḿṁṃᵯᶆɱ".split(""),
    "n": "ńǹňñṅņṇṋṉᵰɲƞᶇɳȵ".split(""),
    "o": "óòŏôốồỗổǒöȫőõṍṏȭȯȱøǿǫǭōṓṑỏȍȏơớờỡởợọộɵ".split(""),
    "p": "ṕṗᵽᵱᶈƥ".split(""),
    "q": "ʠɋ".split(""),
    "r": "ŕřṙŗȑȓṛṝṟɍᵲᶉɼɽɾᵳ".split(""),
    "s": "śṥŝšṧṡẛşṣṩșᵴᶊʂȿ".split(""),
    "t": "ťẗṫţṭțṱṯŧⱦᵵƫƭʈȶ".split(""),
    "u": "úùŭûǔůüǘǜǚǖűũṹųūṻủȕȗưứừữửựụṳṷṵʉᵾᶙ".split(""),
    "v": "ṽṿᶌʋⱴ".split(""),
    "w": "ẃẁŵẘẅẇẉ".split(""),
    "x": "ẍẋᶍ".split(""),
    "y": "ýỳŷẙÿỹẏȳỷỵʏɏƴ".split(""),
    "z": "źẑžżẓẕƶᵶᶎȥʐʑɀⱬ".split("")
};

const REVTABLE = Object.assign.apply({}, [].concat(...Object.entries(TABLE).map(([k, vs]) => vs.map((v) => ({ [v]: k })))));

window.onload = function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/accented_english/sw.js')
            .then(function (registration) {
                console.log('[Service Worker] Registration succeeded');
            })
            .catch(function (err) {
                console.log('[Service Worker] Registration failed');
            });
    }

    header = document.getElementById("header");
    textInput = document.getElementById("textinput");
    accentuateButton = document.getElementById("accentuate");
    tipText = document.getElementById("tip");
    footer = document.getElementById("footer");

    header.innerText = accentuate(header.innerText);
    accentuateButton.innerText = accentuate(accentuateButton.innerText);
    tipText.innerText = accentuate(tipText.innerText);
    footer.innerText = accentuate(footer.innerText);
}

function accentuate(text) {
    let origin = text.split("");
    let accented = "";
    for (let character of origin) {
        if (TABLE.hasOwnProperty(character)) {
            let candidates = TABLE[character];
            accented += candidates[Math.floor(Math.random() * candidates.length)];
        } else {
            accented += character;
        }
    }
    return accented;
}

function accentuateInput() {
    if (textInput.value.length) {
        textInput.value = accentuate(textInput.value);
    }
}

function copyText() {
    navigator.clipboard.writeText(textInput.value);
}

function undo() {
    textInput.value = Array.prototype.map.call(textInput.value, c => REVTABLE.hasOwnProperty(c)? REVTABLE[c] : c).join("")
}