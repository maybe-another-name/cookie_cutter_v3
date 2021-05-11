// react to installation
chrome.runtime.onInstalled.addListener((_reason) => {
  showSplash();
});

// react to the extension being clicked
chrome.action.onClicked.addListener((tab) => {
  showSplash();
});

function showSplash(info, tab) {
  let url = chrome.runtime.getURL("manager.html");
  chrome.tabs.create({ url });
}

// react to messages from the extension
chrome.runtime.onMessage.addListener(
  (json_message, chrome_runtime, function_callback) => {
    try {
      json_message = JSON.parse(json_message);
      console.log("received message");
      console.log(json_message);
    } catch (v) {
      json_message = {};
    }

    switch (json_message.id) {
      case 1:
        function_callback();
        break;
      case 3:
        apply_function_to_cookies(function_callback);
        break;
      case 5:
        remove_cookies_by_attribute(json_message.v || []);
        function_callback();
        break;
      case 7:
        remove_cookies(json_message.v || []);
        function_callback();
        break;
    }
    return true;
  }
);

apply_function_to_cookies = function (function_to_apply) {
  chrome.cookies.getAll({}, function (e) {
    log_last_error() ? function_to_apply(null) : function_to_apply(e);
  });
};

remove_cookies = function (a) {
  a.forEach((a) => {
    chrome.cookies.remove(a, log_last_error);
  });
};

remove_cookies_by_attribute = function (a) {
  a.forEach((a) => {
    chrome.cookies.remove(
      {
        url: a.url,
        name: a.name,
      },
      function () {
        log_last_error();
        chrome.cookies.set(a, log_last_error);
      }
    );
  });
};

log_last_error = function () {
  var a = chrome.runtime.lastError;
  a && console.info(a.message);
  return a;
};
