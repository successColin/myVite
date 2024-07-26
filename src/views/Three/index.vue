<template>
  <div ref="sceneContainer" class="scene-container"></div>
  <div class="content" v-if="isShow" @click="handleClick">
    <div class="content__box">
      <canvas width="1000" height="200" id="mycanvas"></canvas>
    </div>
  </div>
</template>

<script setup>
import * as THREE from "three";
import WebGL from "three/addons/capabilities/WebGL.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";

const sceneContainer = ref(null);
let scene, camera, renderer;
let plane;
let dirLight, hemiLight;
let dirLightHelper;
let mixer;
let clock = new THREE.Clock();
let gui = new GUI();
let isShow = ref(true);

function handleClick() {
  isShow.value = false;
}

function initThree() {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa0a0a0);
  scene.fog = new THREE.Fog(0xa0a0a0a, 10, 50);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    sceneContainer.value.clientWidth / sceneContainer.value.clientHeight,
    0.1,
    1000,
  );
  // camera.position.z = 5;
  camera.position.set(1, 2, -3);
  camera.lookAt(0, 1, 0);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
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
  sceneContainer.value.appendChild(renderer.domElement);
}

const initMeshes = () => {
  // 创建立方体
  // const geometry = new THREE.BoxGeometry();
  // const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // const cube = new THREE.Mesh(geometry, material);
  // scene.add(cube);

  // 底部
  plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshPhongMaterial({
      color: 0x999999,
    }),
  );
  plane.rotation.x = -Math.PI / 2;
  scene.add(plane);

  const loader = new GLTFLoader();
  loader.load("public/models/gltf/Soldier.glb", (gltf) => {
    console.log(gltf);

    scene.add(gltf.scene);
    let model = gltf.scene;
    if (model) {
      model.traverse((object) => {
        if (object) {
          object.castShadow = true;
        }
      });
    } else {
      console.error("Failed to load GLTF model");
    }

    // 动画混合器是用于场景中特定对象的动画的播放器
    mixer = new THREE.AnimationMixer(gltf.scene);

    let actionsGILT = {};
    // 保存动画
    gltf.animations.forEach((clip) => {
      actionsGILT[clip.name] = mixer.clipAction(clip);
    });
    const animations = Object.keys(actionsGILT);
    const params = {
      animation: animations[0],
    };
    const GltfPerple = gui.addFolder("GLTF People 人动画");

    let previousAction, activeAction;

    GltfPerple.add(params, "animation", animations).onChange((name) => {
      previousAction = activeAction;
      activeAction = actionsGILT[name];

      if (previousAction !== activeAction) {
        previousAction.fadeOut(3);
        activeAction.reset().fadeIn(3).play();
      }
    });
    GltfPerple.close();

    // 初始化第一个动画
    activeAction = actionsGILT[animations[0]];
    activeAction.play();
  });
};

const initLight = () => {
  // 半球光
  hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(hemiLight);

  // 平行光 => 定向光
  dirLight = new THREE.DirectionalLight(0xffffff);
  dirLight.position.set(-3, 10, -10);
  scene.add(dirLight);
};

// 阴影
const enableShadow = () => {
  renderer.shadowMap.enabled = true;
  dirLight.castShadow = true;
  plane.receiveShadow = true;
};

const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);

  dirLightHelper.update();

  let delta = clock.getDelta();
  mixer && mixer.update(delta);
};

function initControls() {
  // 放大缩小
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  // 你能够将相机向外/内移动多少
  controls.maxDistance = 9;
  controls.minDistance = 1;
  // 你能够垂直旋转的角度的下限
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = (80 / 360) * 2 * Math.PI;

  // 辅助线 x: 红色  y：绿色  z：蓝色
  const axesHelper = new THREE.AxesHelper(1);
  scene.add(axesHelper);

  // -------------------------------
  // 平行线
  dirLightHelper = new THREE.DirectionalLightHelper(dirLight);
  scene.add(dirLightHelper);

  // 半球光
  const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight);
  scene.add(hemiLightHelper);
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

function buildGUI() {
  const DirLightFolder = gui.addFolder("Dir Light 平行灯光");
  DirLightFolder.addColor(dirLight, "color");

  DirLightFolder.add(dirLight.position, "x", -10, 10).step(1);
  DirLightFolder.add(dirLight.position, "y", -10, 10).step(1);
  DirLightFolder.add(dirLight.position, "z", -10, 10).step(1);
  DirLightFolder.close();

  // gui.close();
}

function canvasFont() {
  //用于输出文字的变量
  var sub = 0;
  var arr = [];
  var time = 0;
  //设定文字颜色，字体，大小，x和y坐标
  var x = 0;
  var y = 50;
  var color = "red";
  var size = "20";
  var font = "宋体";
  //设制文字内容
  var tosplitFont =
    "大昌俱乐部，大昌俱乐部，大昌俱乐部，大昌俱乐部，大昌俱乐部，大昌俱乐部，大昌俱乐部大昌俱乐部";

  sub = 0;
  arr = tosplitFont.split("");

  var c = document.getElementById("mycanvas");
  const rect = c.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const ctx = c.getContext("2d");

  c.width = rect.width * dpr;
  c.height = rect.height * dpr;
  ctx.font = size + "px" + " " + font;
  ctx.fillStyle = color;
  ctx.clearRect(0, 0, c.width, c.height);
  //循环输出
  for (var i = 0; i < arr.length; i++) {
    setTimeout(function () {
      ctx.fillText(arr[sub], x, y);
      x += ctx.measureText(arr[sub]).width;
      sub += 1;
    }, time);
    time += 100;
  }
}

onMounted(() => {
  if (WebGL.isWebGL2Available()) {
    initThree();
    initMeshes();
    initLight();
    enableShadow();
    buildGUI();
    initControls();
    animate();

    canvasFont();

    window.addEventListener("resize", onWindowResize);
  } else {
    const warning = WebGL.getWebGL2ErrorMessage();
    sceneContainer.value.appendChild(warning);
  }
});
onUnmounted(() => {
  window.removeEventListener("resize", onWindowResize);
});
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
