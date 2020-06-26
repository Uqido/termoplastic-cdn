
if (typeof modelviewer === "undefined") {
    window.modelviewer = document.getElementsByTagName("model-viewer")[0];
}

modelviewer.addEventListener("worklet-created", (event) => {
    //console.log("Worklet-created");
    annotations=getAnnotations();
    if (typeof worker === "undefined") {
        window.worker = event.detail.worklet;
    }else {
        worker = event.detail.worklet;
    }
})

const buttons=document.getElementsByClassName("color-button")

function clearSelected() {
    for (let button of buttons) {
        button.classList.remove("selected")
    }
}

function colorToArray(color) {
    return color.replace(/[^\d,]/g, '').split(',').map(value => value / 255);
}

function changeColorAndBump(index, color, bumpStrength) {
    if (typeof worker === "undefined") return;

    changeColorByString(color)
    changeBumpStrength(bumpStrength)

    clearSelected();
    buttons[index].classList.add("selected");
}

function changeColorByString(color){
    let colorArray = colorToArray(color);
    worker.postMessage({type: "change-color", payload: colorArray})
}

function changeBumpStrength(bumpStrength){
    worker.postMessage({type: "change-bump", payload: bumpStrength})
}

let isOpen=false;

function modelAnimate() {
    if(modelViewer.paused){
        if(isOpen){
            modelViewer.animationName="Close";
            isOpen=false;
        }else{
            modelViewer.animationName="Open";
            isOpen=true;
        }
        modelViewer.play();
    }
}

function initializeCustomizerOnMaterials(materialsName) {

    modelviewer.innerHTML +=`<script type="experimental-scene-graph-worklet" allow="material-properties;messaging" >

        //console.log('Hello from the scene graph worklet!');

        let materials=[]
    
        self.addEventListener('model-change', () => {
            for(let matName of [${materialsName.map(elem=> '"'+elem+'"')}]){
                materials.push(model.materials.find(mat=> mat.name===matName));
            }
        });
    
        self.addEventListener('message', (event) => {
            if(event.data.type==="change-color"){
                var colorArray=event.data.payload;
                if(colorArray.length===3){
                    colorArray.push(1);
                }
                //console.log('Changing color to:', colorArray);
                for(let mat of materials){
                    mat.pbrMetallicRoughness.setBaseColorFactor(colorArray);
                }
            }else if(event.data.type==="change-bump"){
                //console.log('Changing bump to:', event.data.payload);
                for(let mat of materials){
                    mat.pbrMetallicRoughness.setNormalScale(event.data.payload);
                }
            }
        });
</script>`
}

function inIframe () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

if(inIframe()){
    document.getElementById('viewer-bottom').style.display="none";
    //modelviewer.classList.add("no-ar-button")
}

let annotations=getAnnotations();

for (let annotation of annotations) {
    annotation.style.display="none";
}

let cameraIndex = 0;

function cameraPositionsCount() {
    return positions.length;
}

function colorsCount() {
    return colors.length;
}

function changeColorByIndex(index) {
    if(index===undefined)
        return;

    const color=Object.values(colors[index])[0];
    const bump=Object.values(bumps[index])[0];

    //console.log("color:"+color+" bump:"+bump);
    changeColorAndBump(index,color,bump);
}

function rotateCamera(index) {
    let toEnable;
    if(index===undefined) {
        //console.log("moving to cameraIndex:"+cameraIndex)
        cameraIndex = (++cameraIndex) % positions.length;
        toEnable = positionToAnnotation[cameraIndex];
        modelViewer.cameraOrbit = positions[cameraIndex];
    }else{
        //console.log("moving to index:"+index)
        toEnable = positionToAnnotation[index];
        modelViewer.cameraOrbit = positions[index];
    }

    for (let annotation of annotations) {
        annotation.style.display="none";
        if(toEnable.includes(annotation.id)){
            annotation.style.display="block";
        }
    }
}

window.addEventListener("message",receiveMessage,false);

function receiveMessage(event) {
    if(!event.data)
        return;
    try {
        const action = JSON.parse(event.data);
        if (!action.action)
            return;
        if (action.action === "changeColor") {
            if (typeof action.data === "number")
                changeColorByIndex(action.data);
            else if (typeof action.data === "string")
                changeColorByString(action.data)
        } else if (action.action === "changeRoughness") {
            changeBumpStrength(action.data)
        } else if (action.action === "changeCamera") {
            rotateCamera(action.data);
        } else if (action.action === "animate") {
            modelAnimate();
        } else if (action.action === "enableAR") {
            modelviewer.activateAR().then(value => console.log(value))
        } else if (action.action === "getCameraPositionCount") {
            let win = window;
            if (inIframe())
                win = win.parent;
            win.postMessage(JSON.stringify({action: "cameraPositionCount", data: cameraPositionsCount()}), "*");
        } else if (action.action === "getColorCount") {
            let win = window;
            if (inIframe())
                win = win.parent;
            win.postMessage(JSON.stringify({action: "colorCount", data: colorsCount()}), "*");
        }
    }catch (e) {
        console.log(e);
    }
}

initializeCustomizerOnMaterials(materialArray);
