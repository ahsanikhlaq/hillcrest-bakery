/* ============================================================
   include.js — pulls sections/*.html into [data-include] slots.

   Usage in index.html:
       <div data-include="sections/story.html"></div>

   The placeholder element is REPLACED by the partial's markup
   (no leftover wrapper div).

   NOTE: this uses fetch(), so the page must be served over http://
   (Live Server, `python -m http.server`, etc). Opening index.html
   straight from disk (file://) will be blocked by CORS.
   ============================================================ */
(function () {
  function loadIncludes() {
    var nodes = Array.prototype.slice.call(
      document.querySelectorAll("[data-include]")
    );
    if (!nodes.length) {
      return Promise.resolve();
    }

    return Promise.all(
      nodes.map(function (el) {
        var url = el.getAttribute("data-include");
        return fetch(url)
          .then(function (res) {
            if (!res.ok) {
              throw new Error(res.status + " " + res.statusText);
            }
            return res.text();
          })
          .then(function (html) {
            return { el: el, html: html };
          })
          .catch(function (err) {
            console.error(
              '[include] could not load "' + url + '": ' + err.message
            );
            return { el: el, html: "" };
          });
      })
    ).then(function (results) {
      /* Inject in document order, so the SVG sprite is in the DOM before
         anything that <use>s its symbols. */
      results.forEach(function (item) {
        var tpl = document.createElement("template");
        tpl.innerHTML = item.html.trim();
        item.el.replaceWith(tpl.content);
      });
    });
  }

  /* main.js waits on this promise before touching the DOM. */
  window.sectionsReady =
    document.readyState === "loading"
      ? new Promise(function (resolve) {
          document.addEventListener("DOMContentLoaded", function () {
            resolve(loadIncludes());
          });
        })
      : loadIncludes();
})();


