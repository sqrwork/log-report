import Vue from 'vue'
import { nowDate } from './date'
import axios from "axios";
import './performance'
import router from '@/router/index'
import { REPORT_URL } from './log.config'

// 创建一个子线程
// const worker = new Worker('worker.js')
// // 接收子线程发来的消息
// worker.onmessage = e => {
//     console.log('主线程接收到：', e.data)
//     worker.terminate();
// }


// // 向子线程发消息
// worker.postMessage('子线程，你真帅！')


//判断系统
function myOS() {
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
console.log('我是' + myOS());

// js运行异常
window.onerror = function (message, file, line, col, error) {
  // message：错误信息（字符串）。
  // file：发生错误的脚本URL（字符串）
  // line：发生错误的行号（数字）
  // col：发生错误的列号（数字）
  // error：Error对象（对象）
  console.log("捕获到异常：", { message, file, line, col, error });
  const errorParams = {    				// 错误代码
    msg: message,	  				// 错误内容
    router: router.currentRoute.fullPath,				// 错误路由地址（根据hash地址‘/#/’切割而来，具体看需求）
    file: error.stack,					// 错误的文件（不一定有）
    createTime: nowDate(),			// 发现错误的时间
    type: "jserror",			// 错误的类型
    device: myOS()
  }
  console.log('errorParams', errorParams)
  axios.post(REPORT_URL, { errParams: JSON.stringify(errorParams) }).then(res => {
    console.log(res)
  })
  saveLog(errorParams)
};



//监听鼠标点击事件
window.addEventListener('mouseup', (event) => {
  // console.log(event)
  axios.post(REPORT_URL, { mouseUp: event.srcElement.outerHTML, userAgent: navigator.userAgent }).then(res => {
    console.log(res)
  })

})


// 捕获Vue warn
Vue.config.errorHandler = function (err, vm, info) {
  let {
    message, // 异常信息        
    stack // 异常堆栈信息    
  } = err;
  const params={message,stack}
  console.log('error',message,stack)
  axios.post(REPORT_URL, { warn:JSON.stringify(params) }).then(res => {
    console.log(res)
  })
}

// 捕获promise报错
window.addEventListener("unhandledrejection", function (e) {
  e.preventDefault();
  console.log('e', e)
  console.log("promise 错误,错误的原因是", e.reason);
  console.log("Promise 对象是", e.promise);
  if (e.reason) {
    axios.post(REPORT_URL, { time: nowDate(), err: e.reason }).then(res => {
      // console.log(res)
    })
  }

  return true;

});


// 监听报错信息 比window.onerror先执行
window.addEventListener("error", (error) => {
  if (error.message) {
    axios.post(REPORT_URL, { time: nowDate(), jsmsg: error.message, jsfile: error.filename }).then(res => {
      console.log(res)
    })
  }

  // error.message:js错误原因
  // error.filename：错误的文件
})


// try{
//   console.log('try')
// } catch(e) {
//   console.log('error',e)
// } 
// finally {
//   throw new Error('抛出错误')
//   console.log('finally')
// }

let timeStr

// 对原函数做一个拓展
let rewriteHis = function (type) {
  let origin = window.history[type] // 先将原函数存放起来
  return function () { // 当window.history[type]函数被执行时，这个函数就会被执行
    let rs = origin.apply(this, arguments) // 执行原函数
    let e = new Event(type.toLocaleLowerCase()) // 定义一个自定义事件
    e.arguments = arguments // 把默认参数，绑定到自定义事件上，new Event返回的结果，自身上没有arguments的
    window.dispatchEvent(e) // 触发自定义事件，把载荷传给自定义事件
    return rs
  }
}

window.history.pushState = rewriteHis('pushState') // 覆盖原来的pushState方法
// window.history.replaceState = rewriteHis('replaceState') // 覆盖原来的replaceState方法

// 监听自定义事件， pushstate事件是在rewriteHis时注册的，不是原生事件
// 当点击router-link 或者 window.history.pushState 或者 this.$router.push 时都会被该事件监听到
window.addEventListener('pushstate', () => {
  let t = new Date().getTime() - timeStr
  timeStr = new Date().getTime()
  console.log('待了时长pushstate：' + t)
  axios.post(REPORT_URL, { stayTime: t }).then(res => {
    console.log(res)
  })
})

// 将错误日志存储在本地

// 错误日志排序
const sortArray = (allData) => {
  allData.sort((a, b) => {
    if (a.createTime > b.createTime) {
      return 1
    }
    return -1
  })
}
const saveLog = (errorParams) => {
  const nowData = localStorage.getItem('ERROR')
  if (nowData) {
    const allData = JSON.parse(nowData)
    sortArray(allData)
    // 只存50条错误信息
    if (allData.length > 50) {
      // 已存50条
      allData[0] = errorParams
      sortArray(allData)
    } else {
      allData.push(errorParams)
    }
    localStorage.setItem('ERROR', JSON.stringify(allData))
  } else {
    localStorage.setItem('ERROR', JSON.stringify([errorParams]))
  }
}
const a = 1
window.localStorage.setItem("user", JSON.stringify(a))
window.localStorage.setItem("user1", 2)


