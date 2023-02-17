import axios from "axios";


window.onload = function () {
  setTimeout(function () {
    let t = performance.timing
    let dns=t.domainLookupEnd - t.domainLookupStart //DNS查询耗时
    let tcp=t.connectEnd - t.connectStart  //TCP链接耗时
    let request=t.responseEnd - t.responseStart  //request请求耗时
    let dom=t.domComplete - t.domInteractive  //解析dom树耗时
    let whiteScreen=t.responseStart - t.navigationStart  //白屏时间
    let domReady=t.domContentLoadedEventEnd - t.navigationStart  //domready时间
    let onload=t.loadEventEnd - t.navigationStart  //onload时间
    let jsMemory=(performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize * 100).toFixed(2) + '%'  //js内存使用占比
    

    axios.post('http://127.0.0.1:3000/error/add', { dns,tcp,request,dom,whiteScreen,domReady,onload,jsMemory }).then(res => {
      console.log(res)
    })
    // console.log(dns,tcp,request,dom,whiteScreen,domReady,onload,jsMemory)
    
  })
}