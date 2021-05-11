"use strict";
(function () {
  var y, shadowDOM, numberOfDomains, numberOfCookies;
  const emptyFunction = function () {},
    saveCookiesElement = function (a, b) {
      var c = document.createElement("div"),
        d = document.createElement("a"),
        e = function (a) {
          a &&
            a.isTrusted &&
            (d.removeEventListener("click", e, !1),
            c.remove(),
            d.remove(),
            (c = d = null));
        };
      c.className = "__shade";
      d.className = "__download-btn";
      d.textContent = "Save";
      d.href = a;
      d.download = b;
      c.appendChild(d);
      shadowDOM.appendChild(c);
      d.addEventListener("click", e, !1);
    },
    cookiesDialog = function (a, b, c, d, e) {
      var f = document.createElement("div"),
        g = document.createElement("div"),
        k = function (a) {
          if (a && a.isTrusted) {
            if ((a = a.target) && a.classList.contains("__prompt-ok"))
              if (((a = a.previousElementSibling), a.validity.valid)) {
                e(a.value);
                a.value = null;
                var b = !0;
              } else a.reportValidity();
            else
              a && a.classList.contains("__prompt-cancel") && (e(), (b = !0));
            b &&
              (g.removeEventListener("click", k, !1),
              g.remove(),
              f.remove(),
              (f = null));
          }
        };
      f.className = "__shade";
      g.className = "__prompt-box";
      html_append(g, [
        {
          n: "h3",
          textContent: a,
        },
        {
          n: "p",
          textContent: b,
        },
        {
          n: "input",
          type: "password",
          className: "__prompt-pass",
          placeholder: "Enter password",
        },
        {
          n: "button",
          className: "__prompt-ok",
          textContent: c,
        },
        {
          n: "button",
          className: "__prompt-cancel",
          textContent: d,
        },
      ]);
      f.appendChild(g);
      shadowDOM.appendChild(f);
      g.addEventListener("click", k, !1);
    },
    encrypt = function (textToEncrypt, cryptKeyText, exponent, textFunction) {
      var e, f;
      const g = function (a) {
          a = Array.from(f).concat(Array.from(new Uint8Array(a)));
          textFunction(btoa(String.fromCharCode.apply(null, new Uint8Array(a))));
        },
        k = function (b) {
          window.crypto.subtle
            .encrypt(
              {
                name: "AES-GCM",
                iv: f,
                tagLength: 128,
              },
              b,
              new TextEncoder("utf-8").encode(textToEncrypt)
            )
            .then(g, emptyFunction);
        },
        h = function (a) {
          f = a;
          window.crypto.subtle
            .importKey("raw", e, { name: "AES-GCM" }, !1, ["encrypt"])
            .then(k, emptyFunction);
        };
      cryptoDerivation(cryptKeyText, cryptKeyText + cryptKeyText, Math.pow(2, exponent), 32, "SHA-256", function (c) {
        e = c;
        c = btoa(
          String.fromCharCode.apply(
            null,
            window.crypto.getRandomValues(new Uint8Array(12))
          )
        );
        cryptoDerivation(cryptKeyText + c, textToEncrypt + new Date().getTime().toString(), 1, 12, "SHA-256", h);
      });
    },
    decrypt = function (textToDecrypt, cryptKeyText, exponent, textFunction) {
      const e = Array.from(stringToCharcodes(textToDecrypt)),
        f = function (a) {
          textFunction(new TextDecoder("utf-8").decode(new Uint8Array(a)));
        },
        g = function (a) {
          window.crypto.subtle
            .decrypt(
              {
                name: "AES-GCM",
                iv: new Uint8Array(e.slice(0, 12)),
                tagLength: 128,
              },
              a,
              new Uint8Array(e.slice(12))
            )
            .then(f, emptyFunction);
        };
      cryptoDerivation(cryptKeyText, cryptKeyText + cryptKeyText, Math.pow(2, exponent), 32, "SHA-256", function (a) {
        window.crypto.subtle
          .importKey("raw", a, { name: "AES-GCM" }, !1, ["decrypt"])
          .then(g, emptyFunction);
      });
    },
    cryptoDerivation = function (cryptKeyText, saltText, iterations, numberOfCharacters, hash, textFunction) {
      cryptKeyText = new TextEncoder("utf-8").encode(cryptKeyText);
      cryptKeyText = new Uint8Array(cryptKeyText);
      saltText = new TextEncoder("utf-8").encode(saltText);
      const g = new Uint8Array(saltText),
        h = function (a) {
          textFunction(new Uint8Array(a));
        };
      crypto.subtle
        .importKey("raw", cryptKeyText, { name: "PBKDF2" }, !1, ["deriveBits"])
        .then(function (a) {
          crypto.subtle
            .deriveBits(
              {
                name: "PBKDF2",
                salt: g,
                iterations: iterations,
                hash: hash,
              },
              a,
              8 * numberOfCharacters
            )
            .then(h, emptyFunction);
        }, emptyFunction);
    },
    stringToCharcodes = function (text) {
      return new Uint8Array(
        atob(text)
          .split("")
          .map((a) => a.charCodeAt(0))
      );
    },
    chromeSendMessage = function (messageId, value, callback) {
      try {
        chrome.runtime.sendMessage(
          JSON.stringify({
            id: messageId,
            v: value,
          }),
          callback || emptyFunction
        );
      } catch (d) {}
    },
    html_textContentSummary = function () {
      var a = numberOfCookies + " cookies from " + numberOfDomains + " domains";
      shadowDOM.querySelector(".__status span").textContent = a;
    },
    html_expansion = function () {
      var a = shadowDOM.querySelector(".__tree");
      if (a.__expanded) {
        a.__expanded = !1;
        a = a.querySelectorAll("dt.__expanded");
        for (var b = 0, c = a.length; b < c; b++)
          a[b].classList.remove("__expanded");
      } else
        for (
          a.__expanded = !0,
            a = a.querySelectorAll("dt:not(.__expanded)"),
            b = 0,
            c = a.length;
          b < c;
          b++
        )
          a[b].classList.add("__expanded");
    },
    html_input_checked = function (a) {
      for (
        var b = shadowDOM.querySelectorAll("dt:not([hidden]) input"),
          c = 0,
          d = b.length;
        c < d;
        c++
      )
        b[c].checked = a;
      b = shadowDOM.querySelectorAll("dt:not([hidden]) + dl input");
      c = 0;
      for (d = b.length; c < d; c++) b[c].checked = a;
    },
    cookieToUrl = function (a) {
      var b = a.domain;
      b = "." === b[0] ? b.slice(1) : b;
      return "http" + (a.secure ? "s" : "") + "://" + b + a.path;
    },
    send_selectedCookies = function () {
      var a = shadowDOM.querySelectorAll("dt:not([hidden]) + dl input:checked"),
        b = (a && a.length) || 0;
      if (0 < b && b == numberOfCookies) {
        for (var c = [], d, e = 0; e < b; e++)
          (d = a[e].parentElement.cprop),
            c.push({
              url: cookieToUrl(d),
              name: d.name,
              storeId: d.storeId,
            });
        chromeSendMessage(7, c, null);
        html_A();
      } else if (0 < b) {
        var f,
          g = new Set();
        c = [];
        for (e = 0; e < b; e++) {
          var k = a[e].parentElement;
          d = k.cprop;
          c.push({
            url: cookieToUrl(d),
            name: d.name,
            storeId: d.storeId,
          });
          d = k.parentElement;
          k.remove();
          numberOfCookies--;
          g.add(d);
        }
        g.forEach((a) => {
          b = a.children.length;
          f = a.previousElementSibling;
          0 < b
            ? (f.querySelector("span").textContent = b)
            : (a.remove(), f.remove(), numberOfDomains--);
        });
        g = null;
        html_textContentSummary();
        chromeSendMessage(7, c, null);
      }
    },
    html_hiding = function (a) {
      if (a && a.isTrusted) {
        a = a.target.value;
        for (
          var b = shadowDOM.querySelectorAll("dt"), c, d = 0, e = b.length;
          d < e;
          d++
        )
          (c = b[d]), (c.hidden = a ? (0 > c.domain.indexOf(a) ? !0 : !1) : !1);
      }
    },
    dateManipulation = function (a) {
      a = new Date(1000 * a);
      var b = (a) => (10 > a ? "0" + a : a);
      return {
        date:
          a.getFullYear() + "-" + b(a.getMonth() + 1) + "-" + b(a.getDate()),
        time: b(a.getHours()) + ":" + b(a.getMinutes()),
      };
    },
    displayCookiesInForm = function (a) {
      a = a || {};
      var b = shadowDOM.querySelector(".__prop"),
        c = dateManipulation(a.expirationDate || Date.now() / 1000 + 86400),
        d = b.querySelector("#__cdate"),
        e = b.querySelector("#__ctime"),
        f = b.querySelector("#__cval");
      b.querySelector("#__cdomain").value = a.domain || ".example.com";
      b.querySelector("#__cpath").value = a.path || "/";
      b.querySelector("#__cname").value = a.name || "test";
      b.querySelector("#__cstore").value = a.storeId || 0;
      f.value = a.value || "";
      d.value = c.date;
      e.value = c.time;
      d.disabled = e.disabled = a.session ? !0 : !1;
      c = a.sameSite || "";
      b.querySelector("#__csamesite").value =
        "no_restriction" === c ? "none" : "unspecified" == c ? "" : c;
      b.querySelector("#__csession").checked = a.session ? !0 : !1;
      b.querySelector("#__chostonly").checked = a.hostOnly ? !0 : !1;
      b.querySelector("#__chttponly").checked = a.httpOnly ? !0 : !1;
      b.querySelector("#__csecure").checked = a.secure ? !0 : !1;
    },
    updateCookiesFromForm = function () {
      var a = shadowDOM.querySelector(".__prop"),
        b = {},
        c,
        d,
        e = (b) => {
          var d;
          c = a.querySelector(b);
          b = c.value;
          "" === b
            ? c.focus()
            : c.validity.valid
            ? (d = b)
            : "reportValidity" in c && c.reportValidity();
          return d;
        };
      if ((d = e("#__cdomain")))
        if (((b.domain = d), (d = e("#__cpath"))))
          if (((b.path = d), (d = e("#__cname"))))
            if (((b.name = d), (d = e("#__cstore"))))
              (b.storeId = d),
                (b.value = a.querySelector("#__cval").value),
                (b.session = a.querySelector("#__csession").checked),
                b.session ||
                  ((d = a.querySelector("#__cdate").value),
                  (e = a.querySelector("#__ctime").value),
                  (d = Date.parse(d + " " + e)),
                  (b.expirationDate = d / 1000)),
                (d = a.querySelector("#__csamesite").value),
                (b.sameSite = d
                  ? "none" === d
                    ? "no_restriction"
                    : d
                  : "unspecified"),
                (b.hostOnly = a.querySelector("#__chostonly").checked),
                (b.httpOnly = a.querySelector("#__chttponly").checked),
                (b.secure = a.querySelector("#__csecure").checked);
      return "secure" in b ? b : null;
    },
    saveCookies = function () {
      var a = shadowDOM.querySelectorAll("dt:not([hidden]) + dl input:checked"),
        b = (a && a.length) || 0,
        c = function (d) {
          if (d) {
            for (var c = [], f = 0; f < b; f++)
              c.push(a[f].parentElement.cprop);
            c = JSON.stringify(c);
            encrypt(c, d, 10, function (a) {
              saveCookiesElement(
                'data:application/json;utf-8,{"version":2,"data":"' + a + '"}',
                "cut-cookies.json"
              );
            });
          }
        };
      0 < b &&
        cookiesDialog(
          "Export Cookies",
          "Please enter a password which will be used to encrypt or decrypt cookies. Only someone knowing this password can access and use cookies. Please note: we cannot recover your password if you lose it, so please ensure you keep it in a safe place.",
          "Export",
          "Cancel",
          c
        );
    },
    importCookies = function (a) {
      var b = function (b) {
        try {
          decrypt(a.data, b, 10, function (a) {
            try {
              a = JSON.parse(a);
            } catch (e) {
              a = null;
            }
            a && 0 < a.length && a[0].domain && html_w(a, !0);
          });
        } catch (d) {
          alert("Could not decrypt data.");
        }
      };
      try {
        a = JSON.parse(a);
      } catch (c) {
        a = null;
      }
      a &&
        2 == a.version &&
        a.data &&
        cookiesDialog(
          "Import Cookies",
          "Password required to decrypt cookies data:",
          "Decrypt",
          "Cancel",
          b
        );
    },
    html_loadCookies = function () {
      var a = document.createElement("input"),
        b,
        c = function (d) {
          b.removeEventListener("load", c, !1);
          importCookies(d.target.result || 0);
          a = b = null;
        },
        d = function (a) {
          if (a && a.isTrusted) {
            var e = ((a = a.target) && a.files) || [],
              g = e.length;
            a.removeEventListener("change", d, !1);
            1 === g &&
              ((b = new FileReader()),
              b.addEventListener("load", c, !1),
              b.readAsText(e[0]));
          }
        };
      a.type = "file";
      a.addEventListener("change", d, !1);
      a.click();
    },
    V = function (a) {
      a &&
        a.isTrusted &&
        ((a = a.target),
        "checkbox" === a.type
          ? html_input_checked(a.checked)
          : a.classList.contains("__btn-expand")
          ? html_expansion()
          : a.classList.contains("__btn-refresh")
          ? send_getAndSortCookies(function (a) {
              html_w(a, !1);
            })
          : a.classList.contains("__btn-remove") && send_selectedCookies());
    },
    D = function (a) {
      if (a && a.isTrusted)
        if (((a = a.target), "checkbox" === a.type)) {
          var b = a.parentElement;
          if ("dt" === b.localName) {
            a = a.checked;
            b = b.nextElementSibling.querySelectorAll("input");
            for (var c = 0, d = b.length; c < d; c++) b[c].checked = a;
          }
        } else if (a.classList.contains("__btn-web"))
          window.open(
            "https://" + a.nextElementSibling.textContent,
            "_blank",
            "noopener"
          );
        else if ("dd" === a.localName) displayCookiesInForm(a.cprop);
        else if ("span" === a.localName && "dd" === a.parentElement.localName)
          displayCookiesInForm(a.parentElement.cprop);
        else if ("dt" === a.parentElement.localName)
          a.parentElement.classList.toggle("__expanded");
        else if (
          a.classList.contains("__btn-setsel") &&
          ((b =
            ((a = shadowDOM.querySelectorAll("dt:not([hidden]) + dl input:checked")) &&
              a.length) ||
            0),
          0 < b)
        ) {
          c = [];
          for (d = 0; d < b; d++) {
            var e = a[d].parentElement.cprop;
            e = Object.assign(e);
            e.url = cookieToUrl(e);
            delete e.hostOnly;
            delete e.session;
            c.push(e);
          }
          chromeSendMessage(5, c, null);
        }
    },
    html_save_load = function (a) {
      a &&
        a.isTrusted &&
        ((a = a.target),
        a.classList.contains("__btn-export") && saveCookies(),
        a.classList.contains("__btn-import") && html_loadCookies());
    },
    html_X = function (a) {
      if (a && a.isTrusted)
        if (((a = a.target), "__csession" === a.id)) {
          var b = shadowDOM.querySelector("#__cdate"),
            c = shadowDOM.querySelector("#__ctime");
          b.disabled = c.disabled = a.checked;
        } else if (
          a.classList.contains("__btn-cset") &&
          (a = updateCookiesFromForm())
        ) {
          for (
            var d = a.domain,
              e = shadowDOM.querySelectorAll("dt"),
              f,
              g,
              k = 0,
              l = e.length;
            k < l;
            k++
          )
          if (((f = e[k]), (g = f.domain), g === d)) {
            c = { exist: f };
            break;
          } else if (g > d) {
            c = { insertBefore: f };
            break;
          }
          c = c ? c : { append: !0 };
          if (c.exist) {
            d = a.name;
            e = c.exist.nextElementSibling.querySelectorAll("dd");
            k = 0;
            for (l = e.length; k < l; k++)
              if (((f = e[k]), (g = f.cprop.name), g === d)) {
                b = { exist: f };
                break;
              } else if (g > d) {
                b = { insertBefore: f };
                break;
              }
            e = b ? b : { append: !0 };
            if (e.exist)
              (e.exist.cprop = a),
                (b = e.exist.firstElementChild.nextElementSibling),
                (b.className = cookie_colour(a)),
                (b.title =
                  "Third-party " +
                  a.sameSite +
                  ";" +
                  (a.secure ? "Secure" : "Insecure"));
            else {
              b = html_create_cookie_element(a);
              d = c.exist.nextElementSibling;
              e.append ? d.appendChild(b) : d.insertBefore(b, e.insertBefore);
              numberOfCookies++;
              if ((b = c.exist.querySelector("span")))
                (c = parseInt(b.textContent, 10) + 1),
                  (b.textContent = isNaN(c) ? "" : c);
              html_textContentSummary();
            }
          } else
            (e = shadowDOM.querySelector(".__tree")),
              (f = html_create_input(a.domain)),
              (g = document.createElement("span")),
              (d = document.createElement("dl")),
              (k = shadowDOM.querySelector(".__filter")),
              (l = k.value),
              (b = html_create_cookie_element(a)),
              l && 0 > a.domain.indexOf(l) && ((f.hidden = !0), k.focus()),
              (g.textContent = "1"),
              f.appendChild(g),
              d.appendChild(b),
              c.append
                ? (e.appendChild(f), e.appendChild(d))
                : (e.insertBefore(f, c.insertBefore),
                  e.insertBefore(d, c.insertBefore)),
              numberOfDomains++,
              numberOfCookies++,
              html_textContentSummary(),
              b.scrollIntoView();
          a = Object.assign(a);
          a.url = cookieToUrl(a);
          delete a.hostOnly;
          delete a.session;
          chromeSendMessage(5, [a], null);
        }
    },
    html_create_input = function (a) {
      var b = document.createElement("dt");
      b.domain = a;
      html_append(b, [
        {
          n: "input",
          type: "checkbox",
          className: "__chk",
        },
        {
          n: "button",
          className: "__btn-web",
          title: "Website",
        },
        {
          n: "b",
          textContent: "." === a[0] ? a.slice(1) : a,
        },
        {
          n: "button",
          className: "__btn-arrow",
        },
      ]);
      return b;
    },
    cookie_colour = function (a) {
      var b = a.sameSite || "unspecified";
      return "strict" === b
        ? "__cook-green"
        : "lax" === b
        ? "__cook-salad"
        : "unspecified" === b
        ? "__cook-white"
        : a.secure
        ? "__cook-yellow"
        : "__cook-red";
    },
    html_create_cookie_element = function (a) {
      var b = document.createElement("dd");
      b.cprop = a;
      html_append(b, [
        {
          n: "input",
          type: "checkbox",
          className: "__chk",
        },
        {
          n: "i",
          className: cookie_colour(a),
          title:
            "Third-Party " +
            a.sameSite +
            ";" +
            (a.secure ? "Secure" : "Insecure"),
        },
        {
          n: "span",
          textContent: a.name,
        },
      ]);
      return b;
    },
    html_A = function () {
      var a = shadowDOM.querySelector(".__lbox"),
        b = a.querySelector(".__tree");
      b && (b.removeEventListener("click", D, !1), b.remove());
      b = document.createElement("div");
      b.className = "__tree";
      a.insertBefore(b, a.firstElementChild);
      b.addEventListener("click", D, !1);
      numberOfDomains = numberOfCookies = 0;
      html_textContentSummary();
      return b;
    },
    html_w = function (a, b) {
      var c = html_A(),
        d = document.createDocumentFragment();
      if (b) {
        var e = document.createElement("div");
        e.className = "__imported";
        e.appendChild(
          document.createTextNode(
            "Imported cookies. Select required cookies and click on the "
          )
        );
        b = document.createElement("button");
        b.className = "__btn-setsel";
        b.textContent = "Set";
        e.appendChild(b);
        d.appendChild(e);
        c.classList.add("__imported");
      }
      e = 0;
      for (var f = a.length; e < f; e++) {
        var g = a[e];
        if (h !== g.domain) {
          l &&
            ((b = document.createElement("span")),
            (b.textContent = n),
            l.appendChild(b));
          var h = g.domain;
          var l = html_create_input(h);
          d.appendChild(l);
          var m = document.createElement("dl");
          d.appendChild(m);
          numberOfDomains++;
          var n = 0;
        }
        b = html_create_cookie_element(g);
        m.appendChild(b);
        n++;
        numberOfCookies++;
      }
      l &&
        ((b = document.createElement("span")),
        (b.textContent = n),
        l.appendChild(b));
      c.appendChild(d);
      html_textContentSummary();
    },
    html_append = function (appendTo, appendChildren) {
      var c;
      appendChildren.forEach((b) => {
        c = document.createElement(b.n);
        for (var d in b) "n" !== d && (c[d] = b[d]);
        appendTo.appendChild(c);
      });
    },
    html_append_controls = function () {
      var a = document.createElement("div");
      a.className = "__controls";
      html_append(a, [
        {
          n: "input",
          type: "checkbox",
          className: "__chk",
        },
        {
          n: "button",
          className: "__btn-expand",
          title: "Expand / Collapse",
        },
        {
          n: "button",
          className: "__btn-refresh",
          title: "Refresh to see what \rcookies are set",
        },
        {
          n: "button",
          className: "__btn-remove",
          title: "Delete Selected",
        },
        {
          n: "input",
          type: "text",
          className: "__filter",
          placeholder: "Filter by domain",
          spellcheck: !1,
        },
      ]);
      a.querySelector(".__filter").addEventListener("keyup", html_hiding, !1);
      return a;
    },
    html_append_status = function () {
      var a = document.createElement("div");
      a.className = "__status";
      html_append(a, [
        {
          n: "span",
          textContent: "Initializing\u2026",
        },
        {
          n: "button",
          className: "__btn-export",
          title: "Encypt selected cookies and save.",
        },
        {
          n: "button",
          className: "__btn-import",
          title: "Import cookies from \ran encrypted file.",
        },
      ]);
      a.addEventListener("click", html_save_load, !1);
      return a;
    },
    send_getAndSortCookies = function (a) {
      chromeSendMessage(3, null, function (b) {
        b.sort(function (a, b) {
          a = a.domain + a.name;
          b = b.domain + b.name;
          return a == b ? 0 : a < b ? -1 : 1;
        });
        a(b);
      });
    },
    html_createPage = function () {
      shadowDOM = document.body.attachShadow({ mode: "closed" });
      var a = document.createElement("link");
      a.rel = "stylesheet";
      a.href = "css/editor.css";
      shadowDOM.appendChild(a);
      a = document.createElement("div");
      a.className = "__editor";
      shadowDOM.appendChild(a);
      var b = document.createElement("div");
      b.className = "__lbox";
      a.appendChild(b);
      a = html_append_controls();
      a.addEventListener("click", V, !1);
      b.appendChild(a);
      a = html_append_status();
      b.appendChild(a);
      send_getAndSortCookies(function (a) {
        html_w(a, !1);
        a = document.createElement("div");
        a.className = "__prop";
        html_append(a, [
          {
            n: "label",
            htmlFor: "__cdomain",
            textContent: "Domain:",
          },
          { n: "br" },
          {
            n: "input",
            type: "text",
            id: "__cdomain",
            spellcheck: !1,
            placeholder: "The domain of the cookie",
            pattern:
              "^.?([A-Za-z0-9-]{1,63}.)+([A-Za-z0-9-]{2,32})|localhost|([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3}).([0-9]{1,3})",
          },
          { n: "br" },
          {
            n: "label",
            htmlFor: "__cpath",
            textContent: "Path:",
          },
          { n: "br" },
          {
            n: "input",
            type: "text",
            id: "__cpath",
            spellcheck: !1,
            placeholder: "The path of the cookie",
          },
          { n: "br" },
          {
            n: "label",
            htmlFor: "__cname",
            textContent: "Name:",
            title: 'Not allowed characters: \r( ) < > @ , ; :  " / [ ] ? = { }',
          },
          { n: "br" },
          {
            n: "input",
            type: "text",
            id: "__cname",
            spellcheck: !1,
            placeholder: "The name of the cookie",
            pattern: "[A-Za-z0-9!#$%&'*+. ^_`|~-]*",
          },
          { n: "br" },
          {
            n: "label",
            htmlFor: "__cstore",
            textContent: "Store ID:",
            title:
              "Represents a cookie store in the browser. \rAn incognito mode window, for instance, \ruses a separate cookie store from \ra non-incognito window",
          },
          { n: "br" },
          {
            n: "input",
            type: "number",
            id: "__cstore",
            value: 0,
            min: 0,
          },
          { n: "br" },
          {
            n: "label",
            htmlFor: "__cval",
            textContent: "Value:",
          },
          { n: "br" },
          {
            n: "textarea",
            id: "__cval",
            spellcheck: !1,
            rows: 2,
            placeholder: "Empty",
          },
          {
            n: "label",
            htmlFor: "__cdate",
            textContent: "Expires:",
            title:
              "The expiration date of the persistent cookie. \rNot required for session cookies.",
          },
          { n: "br" },
          {
            n: "input",
            type: "date",
            id: "__cdate",
            title: "Date: YYYY-MM-DD",
          },
          {
            n: "input",
            type: "time",
            id: "__ctime",
            title: "Time: HH-MM",
          },
          { n: "br" },
          {
            n: "label",
            htmlFor: "__csamesite",
            textContent: "Same Site:",
            title:
              "Set to none, lax, strict or leave empty. \rIf you set none, then select the Secure \rcheckbox also!",
          },
          { n: "br" },
          {
            n: "input",
            type: "text",
            id: "__csamesite",
            placeholder: "Set to none, lax, strict or leave empty",
            pattern: "(strict|lax|none)",
          },
          { n: "br" },
          {
            n: "input",
            type: "checkbox",
            className: "__chk",
            id: "__csession",
          },
          {
            n: "label",
            htmlFor: "__csession",
            textContent: "Session",
          },
          { n: "br" },
          {
            n: "input",
            type: "checkbox",
            className: "__chk",
            id: "__chostonly",
          },
          {
            n: "label",
            htmlFor: "__chostonly",
            textContent: "Host-Only",
            title:
              "A request's host must exactly match the domain of the cookie",
          },
          { n: "br" },
          {
            n: "input",
            type: "checkbox",
            className: "__chk",
            id: "__chttponly",
          },
          {
            n: "label",
            htmlFor: "__chttponly",
            textContent: "Http-Only",
            title: "The cookie is inaccessible to client-side scripts",
          },
          { n: "br" },
          {
            n: "input",
            type: "checkbox",
            className: "__chk",
            id: "__csecure",
          },
          {
            n: "label",
            htmlFor: "__csecure",
            textContent: "Secure",
          },
          { n: "br" },
          {
            n: "button",
            className: "__wide __btn-cset",
            textContent: "Set / Create New",
            title:
              "Save changes to the corresponding cookie \ror create a new one if a cookie with \rthe specified domain or name \rdoes not exist yet",
          },
        ]);
        a.addEventListener("click", html_X, !1);
        shadowDOM.querySelector(".__editor").appendChild(a);
      });
    },
    send_G = function () {
      chromeSendMessage(1, null, null);
      setTimeout(send_G, 15000);
    },
    main_H = function () {
      y || ((y = !0), html_createPage(), send_G());
    };
  "complete" == document.readyState && main_H();
  window.addEventListener("DOMContentLoaded", main_H, !1);
})();
