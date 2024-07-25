// 获取assets静态资源
export const getAssetsFile = (url) => {
  return new URL(`../assets/img/${url}`, import.meta.url).href;
};
