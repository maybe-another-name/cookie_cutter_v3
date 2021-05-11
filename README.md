# chromium cookie cutter

Takes a a popular cookie editor extension, and makes the following changes
* no beaconing - completely local
* migrated to version 3 of the extension manifest

From the chromium extensions menu, enable developer mode, then 'load unpacked' and pick this directory.

'Permissions' and entry points are defined in the manifest.  

##### References:

 * https://support.google.com/chrome/a/answer/7515036?hl=en
 * https://developer.chrome.com/docs/extensions/mv2/declare_permissions/
 * https://github.com/GoogleChrome/chrome-extensions-samples/blob/main/api/cookies/cookie-clearer/manifest.json
 * https://developer.chrome.com/docs/extensions/reference/cookies/
