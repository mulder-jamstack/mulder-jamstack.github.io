// var Survey = require("surveyjs");
import * as Survey from "survey-angular";

// tslint:disable-next-line:no-shadowed-variable
function init(Survey: any) {
    const widget = {
        name: "photocapture",
        title: "PhotoCapture",
        iconName: "icon-video-player",
        widgetIsLoaded() {
            return true;
            //     return typeof Slider !== "undefined";
        },
        isFit(question: any) {
            return question.getType() === "photocapture";
        },
        htmlTemplate:
            '<div class="container"><div class="row"><div class="col">    <div class="camera"><video id="video">Video stream not available.</video><button id="startbutton">Take photo</button></div><canvas id="canvas"></canvas></div><div class="col"><div class="output"><img id="photo" alt="The screen capture will appear in this box."><button id="sendbutton">Select photo</button></div></div></div>',
        activatedByChanged(activatedBy: any) {
            Survey.JsonObject.metaData.addClass(
                "photocapture",
                [],
                null,
                "empty"
            );
            Survey.JsonObject.metaData.addProperties("photocapture", [
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
            const width = 320; // We will scale the photo width to this
            let height = 0; // This will be computed based on the input stream

            // |streaming| indicates whether or not we're currently streaming
            // video from the camera. Obviously, we start at false.

            let streaming = false;

            // The various HTML elements we need to configure or control. These
            // will be set by the startup() function.

            let video: any = null;
            let canvas: any = null;
            let photo: any = null;
            let startbutton: any = null;
            let sendbutton: any = null;

            function startup() {
                video = document.getElementById("video");
                canvas = document.getElementById("canvas");
                photo = document.getElementById("photo");
                startbutton = document.getElementById("startbutton");
                sendbutton = document.getElementById("sendbutton");
                (navigator as any).getUserMedia =
                (navigator as any).getUserMedia ||
                    (navigator as any).webkitGetUserMedia ||
                    (navigator as any).mozGetUserMedia ||
                    (navigator as any).msGetUserMedia;

                if (
                    typeof navigator.mediaDevices === "undefined" ||
                    typeof navigator.mediaDevices.getUserMedia === "undefined"
                ) {
                    (navigator as any).getUserMedia(
                        {
                            video: true,
                            audio: false,
                        },
                        function (stream:any) {
                            video.srcObject = stream;
                            video.play();
                            question.video = video;
                        },
                        function (err:any) {
                            console.log("An error occured! " + err);
                        }
                    );
                } else {
                    navigator.mediaDevices
                        .getUserMedia({
                            video: true,
                            audio: false,
                        })
                        .then((stream) => {
                            video.srcObject = stream;
                            video.play();
                            question.video = video;
                        })
                        .catch((err) =>
                            console.log("An error occured! " + err)
                        );
                }

                video.addEventListener(
                    "canplay",
                    (ev: any) => {
                        if (!streaming) {
                            height =
                                video.videoHeight / (video.videoWidth / width);

                            // Firefox currently has a bug where the height can't be read from
                            // the video, so we will make assumptions if this happens.

                            if (isNaN(height)) {
                                height = width / (4 / 3);
                            }

                            video.setAttribute("width", width);
                            video.setAttribute("height", height);
                            canvas.setAttribute("width", width);
                            canvas.setAttribute("height", height);
                            streaming = true;
                        }
                    },
                    false
                );

                startbutton.addEventListener(
                    "click",
                    (ev: any) => {
                        takepicture();
                        ev.preventDefault();
                    },
                    false
                );

                sendbutton.addEventListener(
                    "click",
                    (ev: any) => {
                        sendpicture();
                        ev.preventDefault();
                    },
                    false
                );

                clearphoto();
            }

            // Fill the photo with an indication that none has been
            // captured.

            function clearphoto() {
                const context = canvas.getContext("2d");
                context.fillStyle = "#AAA";
                context.fillRect(0, 0, canvas.width, canvas.height);

                const data = canvas.toDataURL("image/png");
                photo.setAttribute("src", data);
            }

            // Capture a photo by fetching the current contents of the video
            // and drawing it into a canvas, then converting that to a PNG
            // format data URL. By drawing it on an offscreen canvas and then
            // drawing that to the screen, we can change its size and/or apply
            // other changes before drawing it.

            function takepicture() {
                const context = canvas.getContext("2d");
                if (width && height) {
                    canvas.width = width;
                    canvas.height = height;
                    context.drawImage(video, 0, 0, width, height);

                    const data = canvas.toDataURL("image/png");
                    photo.setAttribute("src", data);
                    question.value = photo.getAttribute("src");
                } else {
                    clearphoto();
                }
            }

            function sendpicture() {
                question.value = photo.getAttribute("src");
            }
            startup();
        },
        willUnmount(question: any, el: any) {
            question.video.pause();
            question.video.srcObject.stop();
            question.video.srcObject = "";
            question.video = null;
        },
    };

    Survey.CustomWidgetCollection.Instance.addCustomWidget(
        widget,
        "customtype"
    );
}

if (typeof Survey !== "undefined") {
    init(Survey);
}

export default init;
