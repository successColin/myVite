const routes = [
  {
    path: "/",
    name: "three",
    component: () => import("_v/Three/index.vue"),
  },
  {
    path: "/demo2",
    name: "demo2",
    component: () => import("_v/Three/index2.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("_v/Login/index.vue"),
    meta: {
      notChangeTheme: true,
    },
  },
  {
    path: "/home",
    name: "layout",
    redirect: "/home",
    component: () => import("_v/Layout/index.vue"),
    children: [
      {
        path: "/home",
        name: "home",
        component: () => import("_v/Home/index.vue"),
      },
    ],
  },
  // 404页面
  {
    path: "/404",
    name: "404",
    component: () => import("_v/ErrorPage/404.vue"),
  },
  {
    path: "/:pathMatch(.*)*", // 匹配所有路由
    redirect: "/404",
  },
];
export default routes;
