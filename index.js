import Vue from 'vue'
import { nowDate } from './date'
import './performance'
import router from '@/router/index'
import reportApi from './log.config'
import axios from "axios";
const instance = axios.create();

//配置项
const reportAxios = {
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
        "Machine-Id": navigator.userAgent,  // 设备标识
        "App-Id": "wims_fdddcs"  // 应用标识(事业部名称_项目名称)
      },
    });
  },
}
// 接口
const reportApi = {
  // 通用日志上报接口
  allLogs(params) {
    return reportAxios.post(BASEURL + '/log/all', params);
  },
  // 错误日志上报接口
  errorLogs(params) {
    return reportAxios.post(BASEURL + '/log/error', params);
  },
  // 性能指标上报接口
  perLogs(params) {
    return reportAxios.post(BASEURL + '/log/performance', params);
  },
  // 用户操作日志上报接口
  userLogs(params) {
    return reportAxios.post(BASEURL + '/log/user', params);
  },
}

//判断系统
function myOS(BASEURL) {
  var userAgent = navigator.userAgent.toLocaleLowerCase(); //取得浏览器的userAgent字符串并转换为小写
  if (userAgent.indexOf("compatible") > -1 || userAgent.indexOf("windows") > -1) {
    return 'windows';
  } else if (userAgent.indexOf("macintosh") > -1 && userAgent.indexOf("macintel") > -1) {
    return "macOS";
  } else if (userAgent.indexOf("iphone") > -1) {
    return "ios";
  } else if (userAgent.indexOf("android") > -1) {
    return 'android';
  } else if (userAgent.indexOf('ipad') > -1) {
    return 'ipad';
  } else {
    return "other";
  }
}

// js运行异常
function jsErr(BASEURL) {
  window.onerror = function (message, file, line, col, error) {
    const jsErr = {    		// 错误代码
      msg: message,	  		// 错误内容
      router: router.currentRoute.fullPath,	// 错误路由地址
      file: error.stack,					// 错误的文件
      createTime: nowDate(),			// 发现错误的时间
      type: "jserror",			// 错误的类型
      device: myOS()
    }
    reportApi.allLogs({ jsErr: JSON.stringify(jsErr), time: nowDate(), }).then(res => {
      console.log(res)
    })
  };
}


//监听鼠标点击事件
function mouseClick(BASEURL) {
  window.addEventListener('mouseup', (event) => {
    const params = {
      time: nowDate(),
      mouseUp: event.srcElement.outerHTML
    }
    reportApi.allLogs(params).then(res => {
      console.log(res)
    })

  })

}

// 捕获Vue warn
function vueWarn(BASEURL) {
  Vue.config.errorHandler = function (err, vm, info) {
    let {
      message, // 异常信息        
      stack // 异常堆栈信息    
    } = err;
    const params = { message, stack }
    console.log('error', message, stack)
    reportApi.allLogs({ warn: JSON.stringify(params), time: nowDate() }).then(res => {
      console.log(res)
    })
  }
}


// 捕获promise报错
function promiseErr(BASEURL) {
  window.addEventListener("unhandledrejection", function (e) {
    e.preventDefault();
    console.log("promise 错误,错误的原因是", e.reason);
    console.log("Promise 对象是", e.promise);
    if (e.reason) {
      reportApi.allLogs({ time: nowDate(), promise: e.reason || e.reason.stack }).then(res => {
        console.log(res)
      })
    }
    return true;
  });
}


// 监听报错信息 比window.onerror先执行
function reportErr(BASEURL) {
  window.addEventListener("error", (error) => {
    if (error.message) {
      const params = {
        time: nowDate(),
        jsmsg: error.message,
        jsfile: error.filename
      }
      reportApi.allLogs(params).then(res => {
        console.log(res)
      })
    }

    // error.message:js错误原因
    // error.filename：错误的文件
  })
}


// 页面停留时长
let timeStr
let rewriteHis = function (type) {
  let origin = window.history[type]
  return function () {
    let rs = origin.apply(this, arguments)
    let e = new Event(type.toLocaleLowerCase())
    e.arguments = argumentsarguments的
    window.dispatchEvent(e) // 触发自定义事件，把载荷传给自定义事件
    return rs
  }
}

window.history.pushState = rewriteHis('pushState') // 覆盖原来的pushState方法

// 监听自定义事件， pushstate事件是在rewriteHis时注册的，不是原生事件
function stayTime(BASEURL) {
  window.addEventListener('pushstate', () => {
    let t = new Date().getTime() - timeStr
    timeStr = new Date().getTime()
    console.log('待了时长pushstate：' + t)
    const params = {
      stayTime: t
    }
    reportApi.allLogs(params).then(res => {
      console.log(res)
    })
  })
}


//用户跳转
function routerChange(BASEURL) {
  router.afterEach((to, from) => {
    console.log('to,from', to.path, from.path)
    if (to.path && from.path) {
      const params = {
        toPage: to.path,
        fromPage: from.path,
        time: nowDate()
      }
      reportApi.allLogs(params).then(res => {
        console.log(res)
      })
    }
  })
}

export { myOS, jsErr, mouseClick, vueWarn, promiseErr, reportErr, stayTime, routerChange }

