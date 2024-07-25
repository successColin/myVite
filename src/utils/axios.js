import { PREFIX } from "@/config/index";
import axios from "axios";
import { ElLoading, ElMessage } from "element-plus";

let messageInstance = null;

const resetMessage = (options) => {
  if (messageInstance && messageInstance.type !== "error") {
    messageInstance.close();
  }
  messageInstance = ElMessage({ duration: 1500, ...options });
  return messageInstance;
};

["error", "success", "info", "warning"].forEach((type) => {
  resetMessage[type] = (options) => {
    if (typeof options === "string") {
      options = {
        duration: 1500,
        message: options,
      };
    }
    options.type = type;
    return resetMessage(options);
  };
});

// 3.响应拦截器
const errorCode = {
  400: "错误请求",
  401: "未授权，请重新登录",
  403: "拒绝访问",
  404: "请求错误,未找到该资源",
  405: "请求方法未允许",
  408: "请求超时",
  500: "服务器端出错",
  501: "网络未实现",
  502: "网络错误",
  503: "服务不可用",
  504: "网络超时",
  505: "http版本不支持该请求",
};

class FetchData {
  constructor() {
    // https://club.dcqcjlb.com
    // http://coc.51api.dcqcjlb.com
    this.baseURL =
      process.env.NODE_ENV === "development"
        ? `/${PREFIX}`
        : "https://club.dcqcjlb.com/"; // 请求路径
    this.timeout = 300000000; // 设置超时时间
    this.withCredentials = true;
    this.loadingInstance = null;
  }

  setInterceptor(instance) {
    instance.interceptors.request.use(
      (config) => {
        if (config.showLoading) {
          // 打开loading
          this.loadingInstance = ElLoading.service({
            lock: true,
            text: "",
            spinner: "Loading",
            background: "rgba(255, 255, 255, 0.2)",
            customClass: "mask",
          });
        }
        config.headers["Content-Type"] = "application/json;charset=UTF-8";
        return config;
      },
      (err) => Promise.reject(err),
    );

    instance.interceptors.response.use(
      (res) => {
        if (res.config.showLoading) {
          this.loadingInstance.close();
        }
        const codeNumber = res.data.code;
        if (codeNumber === 200) {
          return res.data.data;
        }
        return Promise.reject(res.data);
      },
      (error) => {
        if (this.loadingInstance) {
          this.loadingInstance.close();
        }
        if (error && error.response) {
          const code = error.response.status || 0;
          const errorMsg = `${errorCode[code] || "连接错误"}`;
          resetMessage.warning({
            showClose: true,
            message: errorMsg,
          });
        } else if (JSON.stringify(error).includes("timeout")) {
          resetMessage.warning({
            showClose: true,
            message: "服务器响应超时，请刷新当前页",
          });
        } else {
          resetMessage.warning({
            showClose: true,
            message: "接口数据异常",
          });
        }
        return Promise.reject(error);
      },
    );
  }

  request(request, baseURL) {
    const instance = axios.create();
    // 合并配置
    const config = {
      ...request,
      baseURL: baseURL || this.baseURL,
      timeout: this.timeout,
      withCredentials: this.withCredentials,
    };
    this.setInterceptor(instance);
    return instance(config);
  }
}

export default new FetchData();
