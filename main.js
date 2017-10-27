//Constant variables
var MAX_SPHERE_SEGMENTS = 32;
var ambientLightColor = 0xffffff;
var sunLightColor = 0xffffff;
var ambientLightIntensity = 0.25;
var earthRadius = 1.0;
var sunRadius = earthRadius * 109.0;
var moonRadius = earthRadius * 0.25;
var distanceBetweenEarthAndMoon = earthRadius * 60.3;
var distanceBetweenEarthAndSun = earthRadius * 23480.67;

//Global Variables
var inputData = [];
var inputHeadersEnum = Object.freeze({
    Balance: 'Balance',
    AccountType: 'Account Type',
    MostRecentTransaction: 'Most Recent Transaction'
});
var mostRecentTransactionDate;

//Scene Setup
var renderer = new THREE.WebGLRenderer();
renderer.name = 'Renderer';
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var scene = new THREE.Scene();
scene.name = 'Main Scene';
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
var sunMaterial = new THREE.MeshPhongMaterial();
sunMaterial.map = THREE.ImageUtils.loadTexture('images/sunMap.png');
var sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.name = 'Sun';
sunMesh.position.x = -100.0;
sunMesh.position.z = -distanceBetweenEarthAndSun;
scene.add(sunMesh);

//Sun light
var sunLight = new THREE.PointLight(sunLightColor);
sunLight.position.set(0, 0, 0).normalize();
sunLight.name = 'Sun Light';
scene.add(sunLight);
sunLight.position = new THREE.Vector3(sunMesh.position.x,sunMesh.position.y,sunMesh.position.z);
sunLight.position.z = sunMesh.position.z+sunRadius+1000;

//Sun pivot point for Earth orbit
var sunPivot = new THREE.Object3D();
sunPivot.name = "Sun Pivot";
sunPivot.rotation.z = 0;
sunMesh.add(sunPivot);

//Earth
var earthGeometry = new THREE.SphereGeometry(earthRadius, MAX_SPHERE_SEGMENTS, MAX_SPHERE_SEGMENTS);
var earthMaterial = new THREE.MeshPhongMaterial();
earthMaterial.map = THREE.ImageUtils.loadTexture('images/earthMap.png');
earthMaterial.bumpMap = THREE.ImageUtils.loadTexture('images/earthbump1k.jpg');
earthMaterial.bumpScale = 0.05;
earthMaterial.specularMap = THREE.ImageUtils.loadTexture('images/earthspec1k.jpg');
earthMaterial.specular = new THREE.Color('grey');
earthMaterial.shininess = 5.00;
var earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.name = 'Earth';
earthMesh.position.x = 8.0;
scene.add(earthMesh);

//Earth pivot point for moon orbit
var earthPivot = new THREE.Object3D();
earthPivot.name = "Earth Pivot";
earthPivot.rotation.z = 0;
earthMesh.add(earthPivot);

//Moon
var moonGeometry = new THREE.SphereGeometry(moonRadius, MAX_SPHERE_SEGMENTS, MAX_SPHERE_SEGMENTS);
var moonMaterial = new THREE.MeshPhongMaterial();
moonMaterial.map = THREE.ImageUtils.loadTexture('images/moonMap.png');
var moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
moonMesh.name = 'moon';
//Commented out until can be presented better due to size of space :D
//moonMesh.position.x = earthMesh.position.x + distanceBetweenEarthAndMoon;
moonMesh.position.x = 2.0;
earthPivot.add(moonMesh);

//Camera
var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 35000);
camera.position.y = 10;
camera.position.z = 40;
camera.lookAt(new THREE.Vector3(0, 0, 8));

//Controls
var controls = new THREE.OrbitControls(camera);
var earthPosition = new THREE.Vector3(earthMesh.position.x, earthMesh.position.y, earthMesh.position.z);
controls.target.x = earthMesh.position.x - 7;
controls.target.y = earthMesh.position.y + 8.5;
controls.target.z = earthMesh.position.z + 33;

//Starfield
var starFieldGeometry = new THREE.SphereGeometry(30000, MAX_SPHERE_SEGMENTS, MAX_SPHERE_SEGMENTS);
var starFieldMaterial = new THREE.MeshBasicMaterial();
starFieldMaterial.map = THREE.ImageUtils.loadTexture('images/starfield.png');
starFieldMaterial.side = THREE.BackSide;
var starFieldMesh = new THREE.Mesh(starFieldGeometry, starFieldMaterial);
starFieldMesh.name = 'Star Field';
scene.add(starFieldMesh);


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    //Earth spin rate is determined by account balance
    if (inputData.length > 0) {
        var earthSpin = inputData[0][inputHeadersEnum.Balance] * 0.000001;
        earthMesh.rotation.y += earthSpin;
        earthPivot.rotation.y -= earthSpin;
    }
    //If Checking Account then sun spins
    if (inputData.length > 0 && inputData[0][inputHeadersEnum.AccountType].toLowerCase() === 'checking') {
        sunMesh.rotation.y += 0.01;
    }
    //Moon orbit speed is determined by how long ago most recent transaction was (sooner==slower)
    if (inputData.length > 0) {
        var moonOrbitSpeed = Date.daysBetween(mostRecentTransactionDate, new Date());
        earthPivot.rotation.z += 0.01 * moonOrbitSpeed;
    }
    //Moon spin
    moonMesh.rotation.y += 0.01;
}
animate();

$(document).ready(function () {
    $.ajax({
        type: 'GET',
        url: 'Bank_Account_Info.csv',
        dataType: 'text',
        success: function (data) {
            processData(data);
        }
    });
});

function processData(allText) {
    var allTextLines = allText.split(/\r?\n/);
    var headers = allTextLines[0].split(',');

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {

            var lineObject = {};
            for (var j = 0; j < headers.length; j++) {
                lineObject[headers[j]] = data[j];
            }
            inputData.push(lineObject);
        }
    }
    postProcessing();
    function postProcessing() {
        mostRecentTransactionDate = new Date(inputData[0][inputHeadersEnum.MostRecentTransaction]);
    }
}

Date.daysBetween = function( date1, date2 ) {
    //Get 1 day in milliseconds
    var one_day=1000*60*60*24;
  
    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();
  
    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;
      
    // Convert back to days and return
    return Math.round(difference_ms/one_day); 
  }