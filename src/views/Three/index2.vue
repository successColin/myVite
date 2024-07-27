<template>
  <div ref="sceneContainer" class="scene-container"></div>
</template>

<script setup>
// 辅助工具
// AxesHelper
// lil-gui
// GridHelper
// OrbitControls

// 阴影：渲染器、模型、地板


import * as THREE from "three";

import TWEEN from "@tweenjs/tween.js";
import {
  AmbientLight,
  // BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  GridHelper,
  Mesh,
  // MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RectAreaLight,
  Scene,
  SpotLight,
  TextureLoader,
  Vector2,
  WebGLRenderer
} from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper";
// import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import GUI from 'lil-gui';
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

const sceneContainer = ref(null);
let scene, camera, renderer;
let controls;
let carStatus;
let doors = [];
let tweenCarDoor;
let tweenCarChange;
// let tweenVal;
// let mesh;
// 车身材质
let bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: "#6e2121",
  metalness: 1,
  roughness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
});

// 玻璃材质
let glassMaterial = new THREE.MeshPhysicalMaterial({
  color: "#793e3e",
  metalness: 0.25,
  roughness: 0,
  transmission: 1.0, //透光性.transmission属性可以让一些很薄的透明表面，例如玻璃，变得更真实一些。
});
onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize);
  window.removeEventListener("click", onPointClick);
});
onMounted(() => {
  if (WebGL.isWebGL2Available()) {
    initThree();
    initMeshes();
    initLight();
    initGUI();
    initControls();
    animate();

    

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("click", onPointClick);
  } else {
    const warning = WebGL.getWebGL2ErrorMessage();
    sceneContainer.value.appendChild(warning);
  }
});

function initThree() {
  // 创建场景
  scene = new Scene();
  RectAreaLightUniformsLib.init();
  // scene.background = new THREE.Color(0xa0a0a0);
  // scene.fog = new THREE.Fog(0xa0a0a0a, 10, 50);

  // 创建相机
  camera = new PerspectiveCamera(
    75,
    sceneContainer.value.clientWidth / sceneContainer.value.clientHeight,
    0.1,
    1000,
  );
  camera.position.set(4.25, 1.4, -4.5);

  // 创建渲染器
  renderer = new WebGLRenderer({ antialias: true });
  // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
  renderer.setPixelRatio(window.devicePixelRatio);
  // 将输出canvas的大小调整为(width, height)并考虑设备像素比，
  // 且将视口从(0, 0)开始调整到适合大小 将updateStyle设置为false以阻止对canvas的样式做任何改变。
  renderer.setSize(
    sceneContainer.value.clientWidth,
    sceneContainer.value.clientHeight,
  );
  // 默认 THREE.LinearEncoding 可以改善颜色的显示，使其更加符合人眼的感知
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // 支持阴影
  renderer.shadowMap.enabled = true;
  sceneContainer.value.appendChild(renderer.domElement);
}

const initMeshes = () => {
  // const geometryBox = new BoxGeometry(1, 1, 1);
  // const texture = new TextureLoader().load('public/static/img/messi.JPG');
  // const material = new MeshBasicMaterial({
  //   color: "red",
  //   map: texture
  // })
  // mesh = new Mesh(geometryBox, material)
  // scene.add(mesh)


  // const coords = { x: 0, y: 0 }
  // tweenVal = new TWEEN.Tween(coords).to({ x: 3, y: 3 }, 4000)
  //   .easing(TWEEN.Easing.Quadratic.Out)
  //   .onUpdate((v) => {
  //     console.log('v========>>>>', v)
  //     mesh.position.x = v.x;
  //     mesh.position.y = v.y;
  //   }).start();

  new GLTFLoader().load("public/models/gltf/Lamborghini.glb", function (gltf) {
    const carModel = gltf.scene;
    console.log(gltf);
    carModel.rotation.y = Math.PI;
    if (carModel) {
      carModel.traverse((obj) => {
        if (
          obj.name === "Object_103" ||
          obj.name == "Object_64" ||
          obj.name == "Object_77"
        ) {
          // 车身
          obj.material = bodyMaterial;
        } else if (obj.name === "Object_90") {
          // 玻璃
          obj.material = glassMaterial;
        } else if (obj.name === "Empty001_16" || obj.name === "Empty002_20") {
          // 门
          doors.push(obj);
          console.log(obj);
        } else {
        }
        obj.castShadow = true;
      });
    } else {
      console.error("Failed to load GLTF model");
    }
    scene.add(carModel);
  });

  const floorGeometry = new PlaneGeometry(20, 20);
  const materialOne = new MeshPhysicalMaterial({
    // 双面绘制
    side: DoubleSide,
    color: 0x808080,
    // 金属度
    metalness: 0,
    roughness: 0.1,
  });
  const floorMesh = new Mesh(floorGeometry, materialOne);
  floorMesh.rotation.x = Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  const geometry = new CylinderGeometry(10, 10, 20, 20);
  const materialTwo = new MeshPhysicalMaterial({
    color: 0x6c6c6c,
    side: DoubleSide,
  });
  const cylinder = new Mesh(geometry, materialTwo);
  scene.add(cylinder);
};

const initLight = () => {
  // 环境光
  const ambientLight = new AmbientLight("#fff", 0.5);
  ambientLight.position.set(-3, 10, -10);
  scene.add(ambientLight);

  // 添加头顶聚光灯
  const bigSpotLight = new SpotLight("#ffffff", 0.5);
  bigSpotLight.angle = Math.PI / 8; //散射角度，跟水平线的家教
  bigSpotLight.penumbra = 0.2; // 聚光锥的半影衰减百分比
  bigSpotLight.decay = 2; // 纵向：沿着光照距离的衰减量。
  bigSpotLight.distance = 30;
  bigSpotLight.shadow.radius = 10;
  // // 阴影映射宽度，阴影映射高度
  bigSpotLight.shadow.mapSize.set(4096, 4096);
  bigSpotLight.position.set(-5, 10, 1);
  // // 光照射的方向
  bigSpotLight.target.position.set(0, 0, 0);
  bigSpotLight.castShadow = true;
  // // bigSpotLight.map = bigTexture
  scene.add(bigSpotLight);

  const spotLight = new THREE.SpotLight("#ffffff", 2);
  spotLight.castShadow = true;
  spotLight.angle = Math.PI / 6;
  spotLight.penumbra = 0.2;
  spotLight.decay = 2;
  spotLight.distance = 50;
  spotLight.position.set(0, 3, 0);
  spotLight.target.position.set(-10, 3, 10);
  const texture = new TextureLoader().load("public/static/img/messi.JPG");
  spotLight.map = texture;
  new THREE.SpotLightHelper(spotLight);
  scene.add(spotLight);

  //创建三色光源
  const rectLight1 = new RectAreaLight(0xff0000, 50, 1, 10);
  rectLight1.position.set(15, 10, 15);
  rectLight1.rotation.x = -Math.PI / 2;
  rectLight1.rotation.z = -Math.PI / 4;
  scene.add(rectLight1);
  const rectLight2 = new RectAreaLight(0x00ff00, 50, 1, 10);
  rectLight2.position.set(13, 10, 13);
  rectLight2.rotation.x = -Math.PI / 2;
  rectLight2.rotation.z = -Math.PI / 4;
  scene.add(rectLight2);
  const rectLight3 = new RectAreaLight(0x0000ff, 50, 1, 10);
  rectLight3.position.set(11, 10, 11);
  rectLight3.rotation.x = -Math.PI / 2;
  rectLight3.rotation.z = -Math.PI / 4;
  scene.add(rectLight3);
  scene.add(new RectAreaLightHelper(rectLight1));
  scene.add(new RectAreaLightHelper(rectLight2));
  scene.add(new RectAreaLightHelper(rectLight3));

  const carTween = new TWEEN.Tween({ x: -5 })
    .to({ x: 25 }, 2000)
    .easing(TWEEN.Easing.Quadratic.Out);
  carTween.onUpdate(function (that) {
    rectLight1.position.set(15 - that.x, 10, 15 - that.x);
    rectLight2.position.set(13 - that.x, 10, 13 - that.x);
    rectLight3.position.set(11 - that.x, 10, 11 - that.x);
  });
  carTween.onComplete(function (that) {
    rectLight1.position.set(-15, 10, 15);
    rectLight2.position.set(-13, 10, 13);
    rectLight3.position.set(-11, 10, 11);

    rectLight1.rotation.z = Math.PI / 4;
    rectLight2.rotation.z = Math.PI / 4;
    rectLight3.rotation.z = Math.PI / 4;
  });
  carTween.repeat(10);
  const carTween2 = new TWEEN.Tween({ x: -5 })
    .to({ x: 25 }, 2000)
    .easing(TWEEN.Easing.Quadratic.Out);
  carTween2.onUpdate(function (that) {
    rectLight1.position.set(-15 + that.x, 10, 15 - that.x);
    rectLight2.position.set(-13 + that.x, 10, 13 - that.x);
    rectLight3.position.set(-11 + that.x, 10, 11 - that.x);
  });
  carTween2.onComplete(function (that) {
    rectLight1.position.set(15, 10, 15);
    rectLight2.position.set(13, 10, 13);
    rectLight3.position.set(11, 10, 11);
    rectLight1.rotation.z = -Math.PI / 4;
    rectLight2.rotation.z = -Math.PI / 4;
    rectLight3.rotation.z = -Math.PI / 4;
  });
  carTween.start();
};

const animate = (time) => {
  // mesh.position.x += 0.01;
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  TWEEN.update(time);
  // tweenVal.update(time)
  tweenCarDoor && tweenCarDoor.update(time);
  tweenCarChange && tweenCarChange.update(time);
  controls.update();
};

function initControls() {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxDistance = 9;
  controls.minDistance = 1;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = (80 / 360) * 2 * Math.PI;

  // 辅助线 x: 红色  y：绿色  z：蓝色
  const axesHelper = new THREE.AxesHelper(1);
  scene.add(axesHelper);


  let grid = new GridHelper(20, 40, "red", 0xffffff);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);
}

function onWindowResize() {
  camera.aspect =
    sceneContainer.value.clientWidth / sceneContainer.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(
    sceneContainer.value.clientWidth,
    sceneContainer.value.clientHeight,
  );
}

function initGUI() {
  var obj = {
    bodyColor: "#6e2121",
    glassColor: "#aaaaaa",
    carOpen,
    carClose,
    carIn,
    carOut,
  };

  const gui = new GUI();
  gui
    .addColor(obj, "bodyColor")
    .name("车身颜色")
    .onChange((value) => {
      bodyMaterial.color.set(value);
    });
  gui
    .addColor(obj, "glassColor")
    .name("玻璃颜色")
    .onChange((value) => {
      glassMaterial.color.set(value);
    });
  gui.add(obj, "carOpen").name("打开车门");
  gui.add(obj, "carClose").name("关门车门");
  gui.add(obj, "carIn").name("车内视角");
  gui.add(obj, "carOut").name("车外视角");
}
function carOpen() {
  carStatus = "open";
  for (let i = 0; i < doors.length; i++) {
    setAnimationDoor({ x: 0 }, { x: Math.PI / 3 }, doors[i]);
  }
}
function carClose() {
  carStatus = "close";
  for (let i = 0; i < doors.length; i++) {
    setAnimationDoor({ x: Math.PI / 3 }, { x: 0 }, doors[i]);
  }
}
function carIn() {
  setAnimationCamera(
    { cx: 4.25, cy: 1.4, cz: -4.5, ox: 0, oy: 0.5, oz: 0 },
    { cx: -0.27, cy: 0.83, cz: 0.6, ox: 0, oy: 0.5, oz: -3 },
  );
}
function carOut() {
  setAnimationCamera(
    { cx: -0.27, cy: 0.83, cz: 0.6, ox: 0, oy: 0.5, oz: -3 },
    { cx: 4.25, cy: 1.4, cz: -4.5, ox: 0, oy: 0.5, oz: 0 },
  );
}
function setAnimationDoor(start, end, mesh) {
  tweenCarDoor = new TWEEN.Tween(start)
    .to(end, 1000)
    .easing(TWEEN.Easing.Quadratic.Out);
  console.log(11111111111, start, end, mesh, tweenCarDoor);
  tweenCarDoor.onUpdate((that) => {
    console.log(that)
    mesh.rotation.x = that.x;
  });
  tweenCarDoor.start();
}

function setAnimationCamera(start, end) {
  tweenCarChange = new TWEEN.Tween(start)
    .to(end, 3000)
    .easing(TWEEN.Easing.Quadratic.Out);
  tweenCarChange.onUpdate((that) => {
    //  camera.postition  和 controls.target 一起使用
    camera.position.set(that.cx, that.cy, that.cz);
    controls.target.set(that.ox, that.oy, that.oz);
  });
  tweenCarChange.start();
}

function onPointClick(event) {
  let pointer = {};
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  var vector = new Vector2(pointer.x, pointer.y);
  // 光线投射类
  var raycaster = new Raycaster();
  raycaster.setFromCamera(vector, camera);
  let intersects = raycaster.intersectObjects(scene.children);

  intersects.forEach((item) => {
    if (item.object.name === "Object_64" || item.object.name === "Object_77") {
      if (!carStatus || carStatus === "close") {
        carOpen();
      } else {
        carClose();
      }
      console.log(intersects);
    }
  });
}
</script>

<style lang="scss">
.scene-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 9;

  &__box {
    position: absolute;
    bottom: 100px;
    width: 70%;
    height: 200px;
    background: #fff;
    border-radius: 10px;
  }
}
</style>
