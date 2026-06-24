(function () {
  var page = document.body.getAttribute("data-page");
  var contentCache = null;

  document.querySelectorAll("[data-nav]").forEach(function (a) {
    if (a.dataset.nav === page) a.classList.add("active");
  });

  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function fetchJson(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function sortVisible(items) {
    return (items || [])
      .filter(function (item) {
        return item.visible !== false;
      })
      .sort(function (a, b) {
        return (a.order || 0) - (b.order || 0);
      });
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char];
    });
  }

  function imgStyle(image) {
    return image
      ? ' style="background-image: linear-gradient(rgba(220,229,238,.16), rgba(248,250,252,.16)), url(' +
          escapeHtml(image) +
          ');"'
      : "";
  }

  function loadContent() {
    if (contentCache) return contentCache;
    contentCache = Promise.all([
      fetchJson("content/home.json"),
      fetchJson("content/services.json"),
      fetchJson("content/cases.json"),
      fetchJson("content/about.json"),
      fetchJson("content/contact.json"),
    ]).then(function (results) {
      return {
        home: results[0],
        services: results[1].items || results[1],
        cases: results[2].items || results[2],
        about: results[3],
        contact: results[4],
      };
    });
    return contentCache;
  }

  function renderHeaderContact(contact) {
    var float = document.querySelector(".float-contact");
    if (!float || !contact.floatingButtons) return;
    float.innerHTML = contact.floatingButtons
      .map(function (button) {
        return (
          '<a href="' +
          escapeHtml(button.link) +
          '">' +
          escapeHtml(button.text) +
          "</a>"
        );
      })
      .join("");
  }

  function renderHero(home) {
    if (!home.banner) return;
    var banner = home.banner;
    var hero = document.querySelector(".hero-banner");
    if (hero && banner.image)
      hero.style.setProperty("--banner-image", "url(" + banner.image + ")");
    var h1 = document.querySelector(".hero-copy h1");
    var desc = document.querySelector(".hero-desc");
    var tags = document.querySelector(".hero-tags");
    var actions = document.querySelector(".hero-actions");
    if (h1) h1.textContent = banner.title || h1.textContent;
    if (desc) desc.textContent = banner.subtitle || desc.textContent;
    if (tags)
      tags.innerHTML = (banner.tags || [])
        .map(function (tag) {
          return "<span>" + escapeHtml(tag) + "</span>";
        })
        .join("");
    if (actions) {
      actions.innerHTML =
        '<a class="btn-primary" href="' +
        escapeHtml(banner.primaryButton.link) +
        '">' +
        escapeHtml(banner.primaryButton.text) +
        '</a><a class="btn-ghost" href="' +
        escapeHtml(banner.secondaryButton.link) +
        '">' +
        escapeHtml(banner.secondaryButton.text) +
        "</a>";
    }
  }

  function serviceCard(service) {
    var keywords = (service.keywords || [])
      .slice(0, 3)
      .map(function (word) {
        return "<span>" + escapeHtml(word) + "</span>";
      })
      .join("");
    return (
      '<article class="product-card"><a class="product-image-link" href="services.html"><div class="product-visual"' +
      imgStyle(service.image) +
      '></div></a><div class="product-body"><h3>' +
      escapeHtml(service.name) +
      "</h3><p>" +
      escapeHtml(service.summary) +
      '</p><div class="keyword-tags">' +
      keywords +
      '</div><a class="text-link" href="services.html">查看详情</a></div></article>'
    );
  }

  function caseKeywords(text) {
    return String(text || "")
      .replace(/[。；;]/g, "、")
      .split("、")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean)
      .slice(0, 4)
      .map(function (item) {
        return "<span>" + escapeHtml(item) + "</span>";
      })
      .join("");
  }

  function caseCard(item) {
    return (
      '<article class="case-media-card"><div class="case-image"' +
      imgStyle(item.image) +
      '> </div><div class="case-body"><span class="case-tag">' +
      escapeHtml(item.type) +
      "</span><h3>" +
      escapeHtml(item.name) +
      "</h3><p>" +
      escapeHtml(item.description) +
      '</p><div class="case-meta"><strong>核心设计</strong><div>' +
      caseKeywords(item.coreDesign) +
      '</div></div><div class="case-meta"><strong>交付成果</strong><div>' +
      caseKeywords(item.deliverables) +
      '</div></div><a class="btn-outline" href="contact.html">提交类似需求</a></div></article>'
    );
  }

  function renderHome(data) {
    renderHero(data.home);
    var serviceMap = {};
    sortVisible(data.services).forEach(function (item) {
      serviceMap[item.id] = item;
    });
    var homeServices = (data.home.homeServiceIds || [])
      .map(function (id) {
        return serviceMap[id];
      })
      .filter(Boolean);
    var homeGrid = document.querySelector("#homeServices");
    if (homeGrid && homeServices.length) {
      homeGrid.innerHTML = homeServices.map(serviceCard).join("");
    }
    var caseMap = {};
    sortVisible(data.cases).forEach(function (item) {
      caseMap[item.id] = item;
    });
    var ids = data.home.homeCaseIds || [];
    var homeCases = ids.length
      ? ids
          .map(function (id) {
            return caseMap[id];
          })
          .filter(Boolean)
      : sortVisible(data.cases).filter(function (item) {
          return item.featured;
        });
    var caseList = document.querySelector(".case-list");
    if (caseList && homeCases.length)
      caseList.innerHTML = homeCases.map(caseCard).join("");
    var advantageGrid = document.querySelector(".advantage-grid");
    if (advantageGrid) {
      advantageGrid.innerHTML = sortVisible(data.home.advantages)
        .map(function (item) {
          return (
            "<div><span>" +
            escapeHtml(item.icon || "✓") +
            "</span><strong>" +
            escapeHtml(item.title) +
            "</strong><p>" +
            escapeHtml(item.description) +
            "</p></div>"
          );
        })
        .join("");
    }
  }

  function renderServices(data) {
    var grid = document.querySelector(".service-grid");
    if (!grid) return;
    grid.innerHTML = sortVisible(data.services)
      .map(function (service) {
        var items = (service.items || [])
          .map(function (item) {
            return "<li>" + escapeHtml(item) + "</li>";
          })
          .join("");
        return (
          '<article class="service-card"><div class="service-visual"' +
          imgStyle(service.image) +
          "></div><h3>" +
          escapeHtml(service.name) +
          "</h3><p>" +
          escapeHtml(service.summary) +
          "</p><ul>" +
          items +
          "</ul></article>"
        );
      })
      .join("");
  }

  function renderCases(data) {
    var list = document.querySelector(".case-list");
    if (list) list.innerHTML = sortVisible(data.cases).map(caseCard).join("");
  }

  function renderAbout(data) {
    var copy = document.querySelector(".about-copy");
    var grid = document.querySelector(".capability-grid");
    if (copy) {
      copy.innerHTML =
        "<h2>二里半智能制造有限公司</h2><p>" +
        escapeHtml(data.about.companyIntro) +
        "</p><p>" +
        escapeHtml(data.about.serviceTargets) +
        "</p><p>" +
        escapeHtml(data.about.confidentiality) +
        "</p>";
    }
    if (grid)
      grid.innerHTML = (data.about.advantages || [])
        .map(function (item) {
          return "<div>" + escapeHtml(item) + "</div>";
        })
        .join("");
  }

  function renderContact(data) {
    var container = document.querySelector("#contactContent");
    if (!container) return;
    var contact = data.contact;
    container.innerHTML =
      '<article class="contact-card"><strong>联系电话</strong><p>' +
      escapeHtml(contact.phone) +
      '</p></article><article class="contact-card"><strong>微信</strong><p>' +
      escapeHtml(contact.wechat) +
      '</p></article><article class="contact-card"><strong>邮箱</strong><p>' +
      escapeHtml(contact.email) +
      '</p></article><article class="contact-card"><strong>地址</strong><p>' +
      escapeHtml(contact.address) +
      '</p></article><article class="contact-card"><strong>备案号</strong><p>' +
      escapeHtml(contact.recordNumber) +
      "</p></article>";
  }

  loadContent()
    .then(function (data) {
      renderHeaderContact(data.contact);
      if (page === "home") renderHome(data);
      if (page === "services") renderServices(data);
      if (page === "cases") renderCases(data);
      if (page === "about") renderAbout(data);
      if (page === "contact") renderContact(data);
    })
    .catch(function (error) {
      console.warn("静态内容 JSON 加载失败，已保留 HTML 默认内容。", error);
    });

  var topBtn = document.querySelector(".back-top");
  window.addEventListener("scroll", function () {
    if (topBtn) topBtn.classList.toggle("show", window.scrollY > 360);
  });
  if (topBtn)
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
})();
