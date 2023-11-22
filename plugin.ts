import { IApi } from 'umi';

export default (api: IApi) => {
  api.modifyHTML(($) => {
    $('head').append([
      `<script>
       (function () {
        // match true to render BrowserUpdate popup
        function matchBrowser() {
          var uaExp = /((CPU[ +]OS|iPhone[ +]OS|CPU[ +]iPhone|CPU IPhone OS)[ +]+(10[_.]0|10[_.]([1-9]|\\d{2,})|10[_.]2|10[_.]([3-9]|\\d{2,})|(1[1-9]|[2-9]\\d|\\d{3,})[_.]\\d+|11[_.]0|11[_.]([1-9]|\\d{2,})|11[_.]2|11[_.]([3-9]|\\d{2,})|(1[2-9]|[2-9]\\d|\\d{3,})[_.]\\d+|12[_.]0|12[_.]([1-9]|\\d{2,})|12[_.]4|12[_.]([5-9]|\\d{2,})|(1[3-9]|[2-9]\\d|\\d{3,})[_.]\\d+|13[_.]0|13[_.]([1-9]|\\d{2,})|13[_.]7|13[_.]([8-9]|\\d{2,})|(1[4-9]|[2-9]\\d|\\d{3,})[_.]\\d+|14[_.]0|14[_.]([1-9]|\\d{2,})|14[_.]4|14[_.]([5-9]|\\d{2,})|(1[5-9]|[2-9]\\d|\\d{3,})[_.]\\d+)(?:[_.]\\d+)?)|(CFNetwork\\/808\\.(\\d))|(CFNetwork\\/8.* Darwin\\/16\\.5\\.\\d+)|(CFNetwork\\/8.* Darwin\\/16\\.6\\.\\d+)|(CFNetwork\\/8.* Darwin\\/16\\.7\\.\\d+)|(CFNetwork\\/8.* Darwin\\/16\\.\\d+)|(CFNetwork\\/8.* Darwin\\/17\\.0\\.\\d+)|(CFNetwork\\/8.* Darwin\\/17\\.2\\.\\d+)|(CFNetwork\\/8.* Darwin\\/17\\.3\\.\\d+)|(CFNetwork\\/8.* Darwin\\/17\\.\\d+)|(Edge\\/(79(?:\\.0)?|79(?:\\.([1-9]|\\d{2,}))?|([8-9]\\d|\\d{3,})(?:\\.\\d+)?|83(?:\\.0)?|83(?:\\.([1-9]|\\d{2,}))?|(8[4-9]|9\\d|\\d{3,})(?:\\.\\d+)?))|((Chromium|Chrome)\\/(76\\.0|76\\.([1-9]|\\d{2,})|(7[7-9]|[8-9]\\d|\\d{3,})\\.\\d+|83\\.0|83\\.([1-9]|\\d{2,})|(8[4-9]|9\\d|\\d{3,})\\.\\d+)(?:\\.\\d+)?)|(Version\\/(10\\.0|10\\.([1-9]|\\d{2,})|(1[1-9]|[2-9]\\d|\\d{3,})\\.\\d+|11\\.0|11\\.([1-9]|\\d{2,})|(1[2-9]|[2-9]\\d|\\d{3,})\\.\\d+|12\\.0|12\\.([1-9]|\\d{2,})|(1[3-9]|[2-9]\\d|\\d{3,})\\.\\d+|13\\.0|13\\.([1-9]|\\d{2,})|(1[4-9]|[2-9]\\d|\\d{3,})\\.\\d+|14\\.0|14\\.([1-9]|\\d{2,})|(1[5-9]|[2-9]\\d|\\d{3,})\\.\\d+)(?:\\.\\d+)? Safari\\/)|(Firefox\\/(60\\.0|60\\.([1-9]|\\d{2,})|(6[1-9]|[7-9]\\d|\\d{3,})\\.\\d+)\\.\\d+)|(Firefox\\/(60\\.0|60\\.([1-9]|\\d{2,})|(6[1-9]|[7-9]\\d|\\d{3,})\\.\\d+)(pre|[ab]\\d+[a-z]*)?)/;
          // ignore crawlers
          var botExp = /Pagespeed|pingdom|Preview|ktxn|dynatrace|Ruxit|PhantomJS|Headless|Lighthouse|bot|spider|archiver|transcoder|crawl|checker|monitoring|prerender|screenshot|python-|php|uptime|validator|fetcher|facebook|slurp|google|yahoo|node|mail.ru|github|cloudflare|addthis|thumb|proxy|feed|fetch|favicon|link|http|scrape|seo|page|search console|AOLBuild|Teoma|Expeditor/i;
          if (typeof navigator !== "undefined") {
            // exclude browsers
            if (botExp.test(navigator.userAgent)) {
              return false;
            }
            if (uaExp instanceof RegExp) {
              // workaround for UserAgent bug from iOS 15.7
              // ref: https://developer.apple.com/forums/thread/715191
              // issue: https://github.com/browserslist/browserslist-useragent-regexp/issues/1409
              var ua = navigator.userAgent.replace("15.6,2", "15.6.2");
              return !uaExp.test(ua);
            }
          }
          // skip if UAExp error
          return false;
        }

        function renderBrowserUpdate() {
          var div = document.createElement("div");
          var style = document.createElement("style");
          style.setAttribute("type", "text/css");
          var styleContent =
            "html, body { width: 100%; height: 100%; overflow: hidden; }.legacy-warn { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #fff; z-index: 999999; }  .legacy-container {      position: relative;    width: 940px;      margin: 150px auto;  }  .legacy-close {      position: absolute;    right: -16px;    top: -32px;    cursor: pointer;   }  .legacy-img { width: 438px; float: left;  margin-right: 16px;}.legacy-tips{float: right;}.legacy-img img {min-width: 100%; max-width: 100%;}.legacy-tips-title { margin-bottom: .5em; color: rgba(0,0,0,.85); font-weight: 600; font-size: 30px;line-height: 1.35;}.legacy-tips-desc {  margin: 8px 0 24px;color: rgba(0,0,0,.45);font-size: 16px;  line-height: 24px;}.legacy-browsers {  margin-top: 40px;}.legacy-browsers li {  display: inline-block;  text-align: center;  width: 44px;  margin-right: 32px;}.legacy-browsers a {  color: rgba(0, 0, 0, 0.65); text-decoration: none; }.legacy-browsers img { margin-bottom: 8px;}";
          // support IE 8
          if (style.styleSheet) {
            style.styleSheet.cssText = styleContent;
          } else {
            style.innerHTML = styleContent;
          }

          div.innerHTML =
            '<div class="legacy-warn"><div class="legacy-container"><div class="legacy-close" id="legacy-close">X</div><div class="legacy-img">'
            + '<img src="'+ window.publicPath + 'img/browser_version.png' + '" alt="" width="438" height="238" ></div><div class="legacy-tips"><p class="legacy-tips-title">浏览器版本不兼容</p><p class="legacy-tips-desc">浏览器版本过低，为避免可能存在的安全隐患，推荐升级以下浏览器</p><ul class="legacy-browsers"><li><a target="_blank" rel="noopener noreferrer" href="https://www.google.com/chrome/">'
            + '<img src="'+ window.publicPath + 'img/chrome.png' + '" alt="" width="32" height="32"><span>Chrome</span></a></li><li><a target="_blank" rel="noopener noreferrer" href="https://www.microsoft.com/edge">'
            +  '<img src="'+ window.publicPath + 'img/edge.png' + '" alt="" width="32" height="32"><span>Edge</span></a></li><li><a target="_blank" rel="noopener noreferrer" href="https://support.apple.com/downloads/safari">'
            +  '<img src="'+ window.publicPath + 'img/safari.png' + '" alt="" width="32" height="32"><span>Safari</span></a></li><li><a target="_blank" rel="noopener noreferrer" href="https://www.mozilla.org/exp/firefox/new/">'
            +  '<img src="'+ window.publicPath + 'img/firefox.png' + '" alt="" width="32" height="32"><span>Firefox</span></a></li></div></div></div></div>';

          document.body.appendChild(style);
          document.body.appendChild(div);

          var closeEle = document.getElementById("legacy-close");
          if (closeEle) {
            closeEle.onclick = function () {
              document.body.removeChild(div);
              document.body.removeChild(style);
            };
          }
        }

        try {
          if (matchBrowser()) {
            renderBrowserUpdate();
          }
        } catch (e) {
          console.error("[BrowserUpdate ERROR]", navigator.userAgent, e);
        }
      })();
      </script>`,
    ]);
    $('#' + api.config.mountElementId).append([
      `<div class="odc-loading">
        <style>
            .odc-loading {
                position: fixed;
                height: 100%;
                width: 100%;
                padding: 0px;
                margin: 0px;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #ffffff;
            }

            #ob-loading-icon {
                position: fixed;
                bottom: 50px;
                margin-left: 50%;
                transform: translateX(-50%);
            }

            .dot-box {
                position: relative;
                display: inline-block;
                margin-bottom: 10px;
                margin-right: 40px;
            }

            .dot-item {
                display: block;
                float: left;
                height: 50px;
                position: absolute;
            }

            .dot1 {
                -webkit-animation: bouncy1 1.5s infinite;
                top: -40px;
                animation: bouncy1 1.5s infinite;
            }

            .dot1 .dot {
                background: #076fff;
            }

            .dot2 {
                -webkit-animation: bouncy2 1.5s infinite;
                animation: bouncy2 1.5s infinite;
                top: 0
            }

            .dot3 {
                -webkit-animation: bouncy3 1.5s infinite;
                animation: bouncy3 1.5s infinite;
                top: 40px
            }

            .dot {
                height: 12px;
                width: 12px;
                border-radius: 50%;
                background: #050d29;
            }

            @-webkit-keyframes bouncy1 {
                0% {
                    -webkit-transform: translate(0, 0) rotate(0)
                }

                50% {
                    -webkit-transform: translate(0, 0) rotate(180deg)
                }

                100% {
                    -webkit-transform: translate(0, 40px) rotate(-180deg)
                }
            }

            @keyframes bouncy1 {
                0% {
                    transform: translate(0, 0) rotate(0)
                }

                50% {
                    transform: translate(0, 0) rotate(180deg)
                }

                100% {
                    transform: translate(0, 40px) rotate(-180deg)
                }
            }

            @-webkit-keyframes bouncy2 {
                0% {
                    -webkit-transform: translateX(0)
                }

                50% {
                    -webkit-transform: translateX(-40px)
                }

                100% {
                    -webkit-transform: translateX(-40px)
                }
            }

            @keyframes bouncy2 {
                0% {
                    transform: translateY(0)
                }

                50% {
                    transform: translateY(-40px)
                }

                100% {
                    transform: translateY(-40px)
                }
            }

            @-webkit-keyframes bouncy3 {
                0% {
                    -webkit-transform: translateY(0)
                }

                50% {
                    -webkit-transform: translateY(0)
                }

                100% {
                    -webkit-transform: translateY(-40px)
                }
            }

            @keyframes bouncy3 {
                0% {
                    transform: translateY(0)
                }

                50% {
                    transform: translateY(0)
                }

                100% {
                    transform: translateY(-40px)
                }
            }
        </style>
        <div class="dot-box">
            <div class="dot-item dot1">
                <div class="dot"></div>
            </div>
            <div class="dot-item dot2">
                <div class="dot"></div>
            </div>
            <div class="dot-item dot3">
                <div class="dot"></div>
            </div>
        </div>
        <img src="/img/odc_icon.svg" width="90px" />
    </div>`,
      `<img id="ob-loading-icon" src="/img/ob_logo.svg" />`,
    ]);
    return $;
  });
};
