import "./scrollButton";

export default class VideoScroll extends HTMLElement {
  connectedCallback() {
    const srcDesktop = this.getAttribute("src-desktop");
    const srcMobile = this.getAttribute("src-mobile");
    const pixelsPerSecond =
      parseInt(this.getAttribute("pixels-per-second")) || 800;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const src = isMobile ? srcMobile : srcDesktop;

    this.innerHTML = `
      <div class="video-scroll-portal" style="position: relative;">
        <div class="video-placeholder"></div>
        <div class="video-fixed">
          <video id="videoScroll" preload="auto" muted playsinline>
            <source src="${src}" type="video/mp4" />
          </video>


          <scroll-button
            id="scrollHint"
            label="Scroll para mas fosas"
            animated="true"
            icon="mouse"
            style="position: absolute; bottom: 100px; left: 50%; transform: translateX(-50%);
                   opacity: 1; transition: opacity 0.5s;">
          </scroll-button>
        </div>
      </div>
    `;

    this.initVideoScroll(pixelsPerSecond);
  }

  initVideoScroll(pixelsPerSecond) {
    const video = this.querySelector("#videoScroll");
    const placeholder = this.querySelector(".video-placeholder");
    const scrollHint = this.querySelector("#scrollHint");
    if (!video || !placeholder || !scrollHint) return;

    let rafId = null;
    let duration = 0;
    let totalScroll = 0;
    let hintVisible = true;

    const syncVideoToScroll = () => {
      const rect = placeholder.getBoundingClientRect();
      const scrolled = Math.min(Math.max(-rect.top, 0), totalScroll);
      const frac = totalScroll === 0 ? 0 : scrolled / totalScroll;
      video.currentTime = Math.min(duration, Math.max(0, duration * frac));
    };

    const onScroll = () => {
      const scrolled = window.scrollY;
      if (scrolled === 0) {
        scrollHint.style.opacity = "1";
      } else {
        scrollHint.style.opacity = "0";
      }

      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        syncVideoToScroll();
        rafId = null;
      });
    };

    video.addEventListener("loadedmetadata", () => {
      duration = video.duration || 1;
      totalScroll = Math.max(1, Math.round(duration * pixelsPerSecond));
      placeholder.style.height = `${totalScroll + window.innerHeight}px`;
      syncVideoToScroll();
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      if (duration) {
        totalScroll = Math.round(duration * pixelsPerSecond);
        placeholder.style.height = `${totalScroll + window.innerHeight}px`;
        syncVideoToScroll();
      }
    });
  }
}

customElements.define("video-scroll", VideoScroll);
