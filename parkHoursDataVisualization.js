//Constant variables
var MAX_SPHERE_SEGMENTS = 32;
var ambientLightColor = 0xffffff;
var sunLightColor = 0xffffff;
var ambientLightIntensity = 0.25;
var sunRadius = 10.0;

//Global Variables
var parkData;
var parkDataHeadersEnum = Object.freeze({
    parkName: 'Park Name',
    parkOpen: 'Park Open',
    parkClose: 'Park Close',
    totalGuests: 'Total Guests Entered',
    peakOccupancy: 'Peak Occupancy',
    averageOccupancy: 'Average Occupancy',
    date: 'Date',
    maxOccupancy: 'Max Occupancy'
});

//Scene Setup
var renderer = new THREE.WebGLRenderer();
renderer.name = 'Renderer';
renderer.setSize(window.innerWidth-200, window.innerHeight);
document.body.appendChild(renderer.domElement);
var scene = new THREE.Scene();
scene.name = 'Park Data';
//Temporary until camera dragging is implemented
scene.position.x = -7.0
scene.position.y = 8.0;
scene.position.z = 33.0;

//Ambient Light
var ambientLight = new THREE.AmbientLight(ambientLightColor, ambientLightIntensity);
ambientLight.name = 'Ambient Light';
scene.add(ambientLight);

//Sun
var sunGeometry = new THREE.SphereGeometry(sunRadius, MAX_SPHERE_SEGMENTS, MAX_SPHERE_SEGMENTS);
var sunMaterial = new THREE.MeshBasicMaterial();
sunMaterial.map = THREE.ImageUtils.loadTexture('images/sunMap.png');
var sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.name = 'Sun';
sunMesh.position.x = -100.0;
sunMesh.position.z = -100.0;
scene.add(sunMesh);

//Sun light
var sunLight = new THREE.PointLight(sunLightColor);
sunLight.position.set(0, 0, 0).normalize();
sunLight.name = 'Sun Light';
sunMesh.add(sunLight);

//Sun pivot point for planets orbit
var sunPivots = [];

//Camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 35000);
camera.position.y = 10;
camera.position.z = 40;
camera.lookAt(new THREE.Vector3(0, 0, 8));

//Controls
var x = document.getElementById("parkSelectDiv");
var controls = new THREE.OrbitControls(camera, x);
var earthPosition = new THREE.Vector3(sunMesh.position.x, sunMesh.position.y, sunMesh.position.z);
controls.target.x = sunMesh.position.x - 7;
controls.target.y = sunMesh.position.y + 8.5;
controls.target.z = sunMesh.position.z + 33;

//Starfield
var starFieldGeometry = new THREE.SphereGeometry(30000, MAX_SPHERE_SEGMENTS, MAX_SPHERE_SEGMENTS);
var starFieldMaterial = new THREE.MeshBasicMaterial();
starFieldMaterial.map = THREE.ImageUtils.loadTexture('images/starfield.png');
starFieldMaterial.side = THREE.BackSide;
var starFieldMesh = new THREE.Mesh(starFieldGeometry, starFieldMaterial);
starFieldMesh.name = 'Star Field';
scene.add(starFieldMesh);

//Dynamic Planets
var planets = [];
var inputData;

$(document).ready(function () {
    createParkDataObject('ParkData.csv');
});


var rotationSpeedNormalizer = 1000000;
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);

    planets.forEach(function(planet) {
        planet.planetData;
        planet.pivot;
        planet.pivot.rotation.y += planet.planetData[parkDataHeadersEnum.totalGuests]/rotationSpeedNormalizer;
    });
}
animate();

function createParkDataObject(fileName) {
    $.ajax({
        type: 'GET',
        url: fileName,
        dataType: 'text',
        success: function (data) {
            processParkData(data);
        },
        error: function (error) {
            console.log('Error loading file');
        }
    });
}

function processParkData(allText) {
    var allTextLines = allText.split(/\r?\n/);
    var headers = allTextLines[0].split(',');
    var outputData = [];

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var lineObject = {};
            for (var j = 0; j < headers.length; j++) {
                lineObject[headers[j]] = data[j];
            }
            outputData.push(lineObject);
        }
    }
    inputData = seperateIntoArrayByPark(outputData);
    createPlanetsFromInputData(inputData);
}

function seperateIntoArrayByPark(datapoints) {
    var outputObject = {
        parkData: [],
        parkNames: []
    };

    datapoints.forEach(function(datapoint) {
        outputObject.parkNames.push(datapoint[parkDataHeadersEnum.parkName]);
    });

    outputObject.parkNames = uniq(outputObject.parkNames);

    outputObject.parkNames.forEach(function(value, index) {
        outputObject.parkData[index] = [];
    });

    datapoints.forEach(function(datapoint) {
        outputObject.parkData[outputObject.parkNames.indexOf(datapoint[parkDataHeadersEnum.parkName])].push(datapoint);
    });

    return outputObject;

    function uniq(a) {
        var seen = {};
        return a.filter(function(item) {
            return seen.hasOwnProperty(item) ? false : (seen[item] = true);
        });
    }
}

//Dynamic Planet Creation
function createPlanetsFromInputData(data) {
    //Populate dropdown with park names from data.parkNames
    var parkSelectDiv = document.getElementById("parkSelectDiv");
    
    //Create and append select list
    var selectList = document.createElement("select");
    selectList.id = "parkSelect";
    parkSelectDiv.appendChild(selectList);
    
    //Create and append the options
    for (var i = 0; i < data.parkNames.length; i++) {
        var option = document.createElement("option");
        option.value = data.parkNames[i];
        option.text = data.parkNames[i];
        selectList.appendChild(option);
    }

    //selectList.selectedIndex = 0;
    createPlanetsByIndex(0);
}

function createPlanetsByIndex(index) {
    var distanceFromSunNormalizer = 100;
    var radiusNormalizer = 3000;

    inputData.parkData[index].forEach(function (dataElement) {
        //individual pivot for rotation
        var newPlanetPivot = new THREE.Object3D();
        newPlanetPivot.name = "Sun Pivot for " + dataElement[parkDataHeadersEnum.parkName];
        newPlanetPivot.rotation.z = 0;
        sunMesh.add(newPlanetPivot);
        sunPivots.push(newPlanetPivot);

        //New planet
        var newPlanetRadius = dataElement[parkDataHeadersEnum.peakOccupancy]/radiusNormalizer;
        var newPlanetGeometry = new THREE.SphereGeometry(newPlanetRadius, MAX_SPHERE_SEGMENTS, MAX_SPHERE_SEGMENTS);
        var newPlanetMaterial = new THREE.MeshPhongMaterial();
        newPlanetMaterial.map = THREE.ImageUtils.loadTexture('images/sunMap.png');
        var newPlanetMesh = new THREE.Mesh(newPlanetGeometry, newPlanetMaterial);
        newPlanetMesh.name = dataElement[parkDataHeadersEnum.parkName];
        newPlanetMesh.position.x = dataElement[parkDataHeadersEnum.averageOccupancy]/distanceFromSunNormalizer;
        newPlanetMesh.position.z = 0;
        newPlanetMesh.planetData = dataElement;
        newPlanetMesh.pivot = newPlanetPivot;
        newPlanetPivot.add(newPlanetMesh);
        planets.push(newPlanetMesh);
    });
}