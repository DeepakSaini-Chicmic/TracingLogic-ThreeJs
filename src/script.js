import "./style.css";
import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import * as dat from "dat.gui";

const gui = new dat.GUI();
var text = null;
/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");
/**
 * Textures
 */
// const textureLoader = new THREE.TextureLoader();
// const alphabet_A = textureLoader.load("/download.png");
/**
 * Raycaster
 */
const rayCaster = new THREE.Raycaster();

// Scene
const scene = new THREE.Scene();
let mousedown = false;
/**
 * Letter
 */
// const geometry = new THREE.PlaneGeometry(0.6, 1, 2, 2);
// console.log(geometry.attributes.uv);
// const material = new THREE.MeshBasicMaterial({
//   map: alphabet_A,
//   color: 0xf1104e,
// });
// const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);
const colorParameters = { color: 0x1ed3fe, strokeColor: 0xffffff };
const textMaterial = new THREE.MeshBasicMaterial({
  color: colorParameters.color,
});
const fontLoader = new FontLoader();
fontLoader.load("fonts/helvetiker_regular.typeface.json", (font) => {
  const textGeometry = new TextGeometry("G", {
    font: font,
    size: 0.6,
    height: 0.5,
    curveSegments: 10,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelOffset: 0,
    bevelSegments: 2,
  });
  console.log("Font Loaded", font);
  text = new THREE.Mesh(textGeometry, textMaterial);
  textGeometry.center();
  scene.add(text);
  console.log(textGeometry);
  gui
    .add(textGeometry.parameters.options, "height")
    .min(0)
    .max(1)
    .name("Text Height");
  gui.add(textMaterial, "wireframe").name("WireFrame");
  gui.add(textMaterial, "visible").name("Visible");
  gui
    .addColor(colorParameters, "color")
    .onChange(() => {
      textMaterial.color.set(colorParameters.color);
    })
    .name("Text Color");
});

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
window.addEventListener("mousedown", () => {
  console.log("mouse-down");
  mousedown = true;
});

const mouse = new THREE.Vector2();
const lines = [];

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = -(event.clientY / window.innerHeight - 0.5) * 2;
  if (mousedown) drawnPath();
});
const tracingGeometry = new THREE.CircleGeometry(0.04, 64);
const tracingMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
function drawnPath() {
  const line = new THREE.Mesh(tracingGeometry, tracingMaterial);
  line.position.set(mouse.x, mouse.y, 1);
  lines.push(line);
  scene.add(line);
}
gui
  .addColor(colorParameters, "strokeColor")
  .onChange(() => {
    tracingMaterial.color.set(colorParameters.strokeColor);
  })
  .name("Stroke Color");

window.addEventListener("mouseup", () => {
  console.log("mouse-up");
  mousedown = false;
});
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Main camera
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
// const camera = new THREE.PerspectiveCamera(
//   10,
//   sizes.width / sizes.height,
//   0.1,
//   100
// );
camera.position.z = 3;
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();

function disposeAllTracedLines() {
  tracingGeometry.dispose();
  tracingMaterial.dispose();
}

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update controls
  // controls.update();

  //RayCaster Update
  rayCaster.setFromCamera(mouse, camera);

  //Check if Tracing is over the letter or not
  if (text && mousedown) {
    const arrText = rayCaster.intersectObject(text);
    if (arrText.length > 0) {
      console.log("tracing");
    } else {
      disposeAllTracedLines();
      for (let i = 0; i < lines.length; i++) {
        scene.remove(lines[i]);
      }
      console.log("not tracing");
    }
    // Render
  }
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
