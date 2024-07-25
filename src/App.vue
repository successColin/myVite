<template>
  <RouterView />
</template>

<script setup></script>
<style scoped lang="scss">
#app {
  width: 100%;
  height: 100vh;
}
.moreLine {
  word-break: break-all;
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.oneLine {
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
