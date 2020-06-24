
var contentRoot;

function getContentRoot(){
    contentRoot=document.getElementById("modelContentRoot")

}

function instantiateModelContent(srcUrl,assetName){
    const element = document.createElement("a");
    element.classList.add("image-element");
    element.style.backgroundImage=`url('img/Manici/${assetName}.jpg')`;
    element.href=`${srcUrl}/${assetName}.html`;
    contentRoot.appendChild(element);
}

function isLocalhost(){
    return !window.location.host
        .replace(":8081", "")
        .replace(":8080", "")
        .replace(/localhost|127\.0\.0\.1|192\.168\.1\.\d+/i, '');
}

function parseJson(json){
    let baseurl = json.baseUrl;
    if(isLocalhost()){
        console.log("Is Localhost!")
        baseurl="";
    }else{
        console.log("Is not Localhost!")
    }
    console.log("Base Url:"+baseurl);
    const assets = json.assets_manici;
    getContentRoot();
    for(asset of assets){
        instantiateModelContent(`${baseurl}`,asset);
    }
}


function loadJson(){
    //read json
    fetch("./assets.json")
    .then(response => response.json())
    .then(json => parseJson(json))
}

loadJson();
