
if (typeof modelviewer === "undefined") {
    window.modelviewer = document.getElementsByTagName("model-viewer")[0];
}

document.addEventListener('DOMContentLoaded', ()=>{
    //console.log("ContentLoaded");
    init()
}, false);

let loadingWasDismissed=false;

function init() {
    //console.log("LoadingBar Init!")

    if(loadingWasDismissed) return;
        loadingWasDismissed=true

    const progress = document.getElementById('loading-bar');


    modelviewer.addEventListener("progress", function (event) {
        //console.log("Progress!")

        const percent = parseInt(event.detail.totalProgress) * 100;

        progress.innerHTML = `Loading ${percent}%
                                <div style="width: ${percent}%;"></div>
                                `
    });
    modelviewer.addEventListener("load",function () {
        console.log("Model load");
        progress.classList.add("hidden");

    });
    setTimeout(()=>{
        progress.classList.add("hidden");
    },4000);

    setTimeout(()=>{
        progress.classList.remove("hidden");
    },100);
}


if (modelviewer) {
    modelviewer.classList.add("no-default-loading");
    modelviewer.innerHTML += `<div class="iframe-loader hidden" id="loading-bar">
        Loading 0%
    <div style="width: 0%;"></div>
        </div>
    <style>
     .iframe-loader {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 11;
        display: block;
        color: #000000;
        font-weight: 700;
        font-size: 1.2rem;
        pointer-events: none;
    }

    .iframe-loader > div {
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 100%;
        height: 3px;
        background: #000000;
    }


    .iframe-loader.hidden {
        animation: none;
        opacity: 0;
        -webkit-transition: all 0.25s ease-out;
        -moz-transition: all 0.25s ease-out;
        -o-transition: all 0.25s ease-out;
        transition: all 0.25s ease-out;
    }


    @media only screen and (max-width: 950px) {
            .iframe-loader {
                color: #3d3d3d;
            }
           .iframe-loader > div {
             background: #3d3d3d;
           }
    }
    </style>`;

    //init()
}
