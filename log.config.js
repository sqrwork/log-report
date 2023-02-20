import axios from "axios";
const instance = axios.create();

const BASEURL='http://127.0.0.1:3000' //定义上报url


const reportAxios={
  /**
   * 用于发送post请求
   * @param {String} url 请求资源路径
   * @param {Object} params  请求参数对象{参数名1：参数值1，参数名2：参数值2}
   */
  post(url, params) {
    return instance({
      method: "post",
      url: url,
      data: params,
      headers: {
        "Machine-Id": navigator.userAgent,
        "App-Id":"wims_fdddcs"
      },
    });
  },
}
const reportApi={
  // 通用日志上报接口
  allLogs(params){
    return reportAxios.post(BASEURL + '/log/all', params);
  },
  // 错误日志上报接口
  errorLogs(params){
    return reportAxios.post(BASEURL + '/log/error', params);
  },
  // 性能指标上报接口
  perLogs(params){
    return reportAxios.post(BASEURL + '/log/performance', params);
  },
  // 用户操作日志上报接口
  userLogs(params){
    return reportAxios.post(BASEURL + '/log/user', params);
  },
}

export default reportApi;