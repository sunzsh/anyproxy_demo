const AnyProxy = require('anyproxy');
const https = require('https');
var ip = require('ip');


function push(ans) {
  const url = 'https://api.day.app/deviceid/' + encodeURIComponent(ans) + '?autoCopy=1&copy=' + encodeURIComponent(ans);
  const urlObject = new URL(url);
  // return;

  const options = {
    hostname: urlObject.hostname,
    port: 443,
    path: urlObject.pathname,
    method: 'POST',
    headers: {
      'Content-Length': 0
    }
  };

  const req = https.request(options, (res) => { });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });
  req.end();
}

const getAnswer = (q) => {
  return q.ans;
}

var myRule = {
  summary: 'demo questions',
  *beforeSendResponse(requestDetail, responseDetail) {
    if (!requestDetail || !requestDetail.url) {
      return null;
    }
    if (!requestDetail.url.startsWith('https://xxxx.com/xxxx')) {
      return null;
    }
    if (!responseDetail || !responseDetail.response || !responseDetail.response.body) {
      return null;
    }

    let content = responseDetail.response.body.toString();
    let resJson = eval("(" + content + ")");

    if (resJson.errno !== 0) {
      return null;
    }
    const data = resJson.data;
    if (!data) {
      return null;
    }
    
    let ans = getAnswer(data);
    console.log(ans);

    if (ans && ans.length > 0) {
      push(ans);
    }

    return null;
  },
};

const options = {
  port: 8888,
  rule: myRule,
  webInterface: {
    enable: true,
    webPort: 8002
  },
  forceProxyHttps: true,
  intercept: true,
  wsIntercept: false,
  silent: true,
  dangerouslyIgnoreUnauthorized: true
};
const proxyServer = new AnyProxy.ProxyServer(options);

var myip = ip.address();
console.log(myip);

proxyServer.on('ready', () => { /* */ });
proxyServer.on('error', (e) => { /* */ console.log(e); });
proxyServer.start();

 