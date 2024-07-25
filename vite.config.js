import vue from "@vitejs/plugin-vue";
import path from "path";
import postcsspxtoviewport8plugin from "postcss-px-to-viewport-8-plugin";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./", // 开发或生产环境服务的公共基础路径
  resolve: {
    alias: {
      "@": path.resolve("src"),
      "@s": path.resolve("static"),
      "@p": path.resolve("public"),
      _c: path.resolve("src/components"),
      _u: path.resolve("src/utils"),
      _v: path.resolve("src/views"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },
  server: {
    host: true, // 监听所有地址
    port: 8088,
    open: true,
    proxy: {
      "/api": {
        target: "http://coc.51api.dcqcjlb.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/assets/style/mixin.scss";',
      },
    },
    postcss: {
      plugins: [
        postcsspxtoviewport8plugin({
          // unitToConvert: "px", // 要转化的单位
          // viewportWidth: 1920, // UI设计稿的宽度
          // unitPrecision: 6, // 转换后的精度，即小数点位数
          // propList: ["*"], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换 !border表示border不转
          // viewportUnit: "vw", // 指定需要转换成的视窗单位，默认vw
          // fontViewportUnit: "vw", // 指定字体需要转换成的视窗单位，默认vw
          // selectorBlackList: ["ignore-"], // 指定不转换为视窗单位的类名，
          // minPixelValue: 14, // 默认值1，小于或等于1px则不进行转换
          // mediaQuery: false, // 是否在媒体查询的css代码中也进行转换，默认false
          // replace: true, // 是否转换后直接更换属性值
          // landscape: false, // 是否处理横屏情况

          // viewportWidth: file => {
          //     let num = 1920;
          //     if (file.indexOf('m_') !== -1) {
          //         num = 375;
          //     }
          //     return num;
          // },
          unitToConvert: "px",
          viewportWidth: 1920,
          unitPrecision: 6, // 单位转换后保留的精度
          propList: ["*"], // 能转化为vw的属性列表
          viewportUnit: "vw", // 希望使用的视口单位
          fontViewportUnit: "vw", // 字体使用的视口单位
          selectorBlackList: ["ignore-"], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
          minPixelValue: 14, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
          mediaQuery: false, // 媒体查询里的单位是否需要转换单位
          replace: true, //  是否直接更换属性值，而不添加备用属性
          exclude: [], // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件 exclude: [/node_modules\/ant-design-vue/]
          include: [], // 如果设置了include，那将只有匹配到的文件才会被转换
          landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
          landscapeUnit: "vw", // 横屏时使用的单位
          landscapeWidth: 1024, // 横屏时使用的视口宽度
        }),
      ],
    },
  },
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      dts: true,
    }),
  ],
  // build: {
  //   outDir: "build",
  // },
});
