import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export function useThree(sceneContainer) {
  let scene,
    camera,
    renderer,
    mixer,
    plane,
    dirLight,
    clock = new THREE.Clock();

  const initThree = () => {
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
  };

  const initMeshes = () => {
    // 创建立方体
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // 底平面
    plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0x999999 }),
    );
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // gltf
    const loader = new GLTFLoader();
    loader.load("public/models/gltf/Soldier.glb", (gltf) => {
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

      const clip = gltf.animations[1];
      mixer = new THREE.AnimationMixer(gltf.scene);
      mixer.clipAction(clip);
      const action = mixer.clipAction(clip);
      action.play();
    });
  };

  const initLight = () => {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    scene.add(hemiLight);

    // dirLight = new THREE.DirectionalLight(0xffffff);
    // dirLight.position.set(-3, 10, -10);
    // scene.add(dirLight);
  };

  const enableShadow = () => {
    renderer.shadowMap.enabled = true;
    // dirLight.castShadow = true;
    plane.receiveShadow = true;
  };

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    let delta = clock.getDelta();
    mixer && mixer.update(delta);
  };

  const initControls = () => {
    // 放大缩小
    const controls = new OrbitControls(camera, renderer.domElement);
    // 设置控制器的最小和最大距离
    // controls.minDistance = 1;
    // controls.maxDistance = 100;
    // // 可选：限制缩放速度
    // controls.zoomSpeed = 1.0;
    // controls.target.set(0, 1, 0);

    // 辅助线
    const axesHelper = new THREE.AxesHelper(1);
    scene.add(axesHelper);
    // x: 红色  y：绿色  z：蓝色
  };

  const onWindowResize = () => {
    camera.aspect =
      sceneContainer.value.clientWidth / sceneContainer.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
      sceneContainer.value.clientWidth,
      sceneContainer.value.clientHeight,
    );
  };

  return {
    initThree,
    initMeshes,
    initLight,
    enableShadow,
    animate,
    initControls,
    onWindowResize,
  };
}
