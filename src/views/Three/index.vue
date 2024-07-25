<template>
  <div ref="sceneContainer" class="scene-container"></div>
</template>

<script setup>
import { useThree } from "@/hooks/useThree.js";
import WebGL from "three/addons/capabilities/WebGL.js";

const sceneContainer = ref(null);
const {
  initThree,
  initMeshes,
  initLight,
  enableShadow,
  animate,
  initControls,
  onWindowResize,
} = useThree(sceneContainer);

onMounted(() => {
  if (WebGL.isWebGL2Available()) {
    initThree();
    initMeshes();
    initControls();
    initLight();
    enableShadow();
    animate();

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

<style>
.scene-container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
