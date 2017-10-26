var renderer = new THREE.WebGLRenderer();
renderer.name = "Renderer";
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);

var scene = new THREE.Scene();
scene.name = "Main Scene";

var sunLight = new THREE.DirectionalLight(0xffffff);
sunLight.position.set(0, 1, 1).normalize();
sunLight.name = "Sun Light";
scene.add(sunLight);

var ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
ambientLight.name = "Ambient Light";
scene.add(ambientLight);

var earthGeometry = new THREE.SphereGeometry(1.0, 32, 32);
var earthMaterial = new THREE.MeshPhongMaterial();
earthMaterial.map = THREE.ImageUtils.loadTexture('earthMap.png');
earthMaterial.bumpMap = THREE.ImageUtils.loadTexture('earthbump1k.jpg');
earthMaterial.bumpScale = 0.05;
earthMaterial.specularMap = THREE.ImageUtils.loadTexture('earthspec1k.jpg');
earthMaterial.specular = new THREE.Color('grey');
earthMaterial.shininess = 5.00;
var earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
earthMesh.name = "Earth";
earthMesh.position.x = 50.0;
scene.add(earthMesh);

var sunGeometry = new THREE.SphereGeometry(109.0, 32, 32);
var sunMaterial = new THREE.MeshPhongMaterial();
sunMaterial.map = THREE.ImageUtils.loadTexture('sunMap.png');
var sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
sunMesh.name = "Sun";
sunMesh.position.x = -100.0;
scene.add(sunMesh);

var moonGeometry = new THREE.SphereGeometry(0.25, 32, 32);
var moonMaterial = new THREE.MeshPhongMaterial();
moonMaterial.map = THREE.ImageUtils.loadTexture('moonMap.png');
var moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
moonMesh.name = "moon";
moonMesh.position.x = 55.0;
scene.add(moonMesh);

camera.position.z = 300;

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    earthMesh.rotation.y += 0.01;
    sunMesh.rotation.y += 0.01;
    moonMesh.rotation.y += 0.01;
}
animate();