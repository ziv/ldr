import * as THREE from 'three';
import {LdrawJsLoader} from "../ldrawloader/ldraw-loader.mjs";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

document.body.appendChild(renderer.domElement);

// controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// lightning
scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(1, 1.2, 0.5).normalize();
scene.add(directionalLight);

const loader =  new LdrawJsLoader();
const g = await loader.load("000.dat", 1);

g.rotation.x = Math.PI;
scene.add(g);
centerModel(g);
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({color: 0xff00ff});
// const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);
//
// camera.position.z = 5;
//
function animate(time: DOMHighResTimeStamp) {
    // cube.rotation.x = time / 2000;
    // cube.rotation.y = time / 2000;
    controls.update();
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

function centerModel(group: THREE.Group) {
    const box = new THREE.Box3().setFromObject(group);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    camera.position.set(center.x, size.y + (maxDim * 0.5), cameraZ * 1.5);
    controls.target.copy(center);
    controls.update();
}