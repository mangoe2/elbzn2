(function () {
  var page = document.body.getAttribute("data-page");
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

  var slider = document.querySelector(".business-slider");
  if (slider) {
    var slides = Array.prototype.slice.call(
      slider.querySelectorAll(".business-slide"),
    );
    var dots = Array.prototype.slice.call(
      slider.querySelectorAll(".slider-dot"),
    );
    var prev = slider.querySelector(".slider-prev");
    var next = slider.querySelector(".slider-next");
    var index = 0;
    var timer = null;
    var startX = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function startAuto() {
      stopAuto();
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5000);
    }

    function stopAuto() {
      if (timer) window.clearInterval(timer);
    }

    if (prev)
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        startAuto();
      });
    if (next)
      next.addEventListener("click", function () {
        showSlide(index + 1);
        startAuto();
      });
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        startAuto();
      });
    });
    slider.addEventListener("mouseenter", stopAuto);
    slider.addEventListener("mouseleave", startAuto);
    slider.addEventListener(
      "touchstart",
      function (e) {
        startX = e.touches[0].clientX;
      },
      { passive: true },
    );
    slider.addEventListener("touchend", function (e) {
      var endX = e.changedTouches[0].clientX;
      if (Math.abs(endX - startX) > 45) {
        showSlide(endX < startX ? index + 1 : index - 1);
        startAuto();
      }
    });
    showSlide(0);
    startAuto();
  }

  var topBtn = document.querySelector(".back-top");
  window.addEventListener("scroll", function () {
    if (topBtn) topBtn.classList.toggle("show", window.scrollY > 360);
  });
  if (topBtn) {
    topBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  var form = document.querySelector("#demandForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      alert("需求已记录，请通过电话或微信进一步沟通");
      form.reset();
    });
  }
})();
