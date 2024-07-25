import FetchData from "@/utils/axios";

export function localCharmInfoList(params) {
  return FetchData.request({
    url: "coc-active/api/v1/localCharmInfo/homePage/localCharmInfoList",
    params,
  });
}

export function welfareGroupBuyList(data) {
  return FetchData.request({
    url: "/coc-active/api/v1/group/homePage/welfareGroupBuy/list",
    method: "post",
    data,
  });
}
