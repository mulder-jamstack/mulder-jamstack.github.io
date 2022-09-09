import * as pako from "pako";
import * as Survey from "survey-angular";
// const pako = require('pako');
const base64abc = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '_',
    '-',
  ]

export function bytesToBase64(bytes:any) {
	let result = '', i, l = bytes.length;
	for (i = 2; i < l; i += 3) {
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
		result += base64abc[bytes[i] & 0x3F];
	}
	if (i === l + 1) { // 1 octet yet to write
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[(bytes[i - 2] & 0x03) << 4];
		result += "==";
	}
	if (i === l) { // 2 octets yet to write
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[(bytes[i - 1] & 0x0F) << 2];
		result += "=";
	}
	return result;
}


// tslint:disable-next-line:no-shadowed-variable
function init(Survey: any, $: any) {
    $ = $ || (window as any).$;

    const widget = {
        name: "uml",
        title: "uml",
        iconName: "icon-uml",
        widgetIsLoaded() {
            return true;
            //     return typeof Slider !== "undefined";
        },
        isFit(question: any) {
            return question.getType() === "uml";
        },
        htmlTemplate:
            '<div class="container"><div class="row"><div class="col"><textarea></textarea>Utilisez <a href="https://liveuml.com/" target="_blank">liveuml</a> comme éditeur, puis copier le text directement dans ce textarea</div><div class="col"><div class="output"><img id="photo" alt="The screen capture will appear in this box."><button id="sendbutton">Select this diagram</button></div></div></div>',
        activatedByChanged(activatedBy: any) {
            Survey.JsonObject.metaData.addClass("uml", [], null, "empty");
            Survey.JsonObject.metaData.addProperties("uml", [
                /*{
          name: "width:number",
          default: 1
        },
        {
          name: "height:number",
          default: 0
        }*/
            ]);
        },
        afterRender(question: any, el: any) {
            // el.firstChild.firstChild.firstChild.value ='toto';
            const textArea = el.firstChild.firstChild.firstChild;
            const photo = el.firstChild.childNodes[1].firstChild.firstChild;
            textArea.addEventListener("input", () => {
                const value = textArea.value;
                const s = decodeURIComponent(encodeURIComponent(value));
                // $(this).attr("src", "http://www.plantuml.com/plantuml/img/"+encode64(value));
                const res = encode64(
//                    pako.deflate(s, { raw: true, to: "string" })
                    bytesToBase64(pako.deflate(s, { raw: true }))

                );
                // console.log(res);
                if (res !== "SyfFqYssSyp9J4vLi5B8ICt9oIy60000") {
                    photo.setAttribute(
                        "src",
                        "http://www.plantuml.com/plantuml/png/" + res
                    );
                }
                question.value = value;
            });

            function encode64(data: any) {
                let r = "";
                for (let i = 0; i < data.length; i += 3) {
                    if (i + 2 === data.length) {
                        r += append3bytes(
                            data.charCodeAt(i),
                            data.charCodeAt(i + 1),
                            0
                        );
                    } else if (i + 1 === data.length) {
                        r += append3bytes(data.charCodeAt(i), 0, 0);
                    } else {
                        r += append3bytes(
                            data.charCodeAt(i),
                            data.charCodeAt(i + 1),
                            data.charCodeAt(i + 2)
                        );
                    }
                }
                return r;
            }

            function append3bytes(b1: any, b2: any, b3: any) {
                // tslint:disable-next-line: no-bitwise
                const c1 = b1 >> 2;
                // tslint:disable-next-line: no-bitwise
                // tslint:disable-next-line: no-bitwise
                const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
                // tslint:disable-next-line: no-bitwise
                const c3 = ((b2 & 0xf) << 2) | (b3 >> 6);
                // tslint:disable-next-line: no-bitwise
                const c4 = b3 & 0x3f;
                // tslint:disable-next-line: no-bitwise
                let r = "";
                // tslint:disable-next-line: no-bitwise
                r += encode6bit(c1 & 0x3f);
                // tslint:disable-next-line: no-bitwise
                r += encode6bit(c2 & 0x3f);
                // tslint:disable-next-line: no-bitwise
                r += encode6bit(c3 & 0x3f);
                // tslint:disable-next-line: no-bitwise
                r += encode6bit(c4 & 0x3f);
                return r;
            }

            function encode6bit(b: any) {
                if (b < 10) {
                    return String.fromCharCode(48 + b);
                }
                b -= 10;
                if (b < 26) {
                    return String.fromCharCode(65 + b);
                }
                b -= 26;
                if (b < 26) {
                    return String.fromCharCode(97 + b);
                }
                b -= 26;
                if (b === 0) {
                    return "-";
                }
                if (b === 1) {
                    return "_";
                }
                return "?";
            }
        },
        willUnmount(question: any, el: any) {},
    };

    Survey.CustomWidgetCollection.Instance.addCustomWidget(
        widget,
        "customtype"
    );
}

if (Survey !== null) {
    init(Survey, (window as any).$);
}

export default init;
