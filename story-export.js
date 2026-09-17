(function () {
  if (window.__myeStoryExportReady) return;
  window.__myeStoryExportReady = true;

  const scriptUrl = document.currentScript?.src || new URL("story-export.js", location.href).href;
  const templateUrl = new URL("assets/mye-story-template.png", scriptUrl).href;

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Could not load ${source}`));
      image.src = source;
    });
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function progressText() {
    const label = document.querySelector("#progress-label, .progress-panel strong")?.textContent || "";
    const match = label.match(/(\d+)\s*\/\s*(\d+)/);
    return match ? `${match[1]} / ${match[2]} activities completed` : "Movie lesson completed";
  }

  function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function createStory(button) {
    const status = document.querySelector("#story-status");
    const posterElement = document.querySelector(".hero-poster");
    const posterUrl = posterElement?.currentSrc || posterElement?.src;
    const title = document.body.dataset.reportTitle || document.querySelector(".lesson-hero h1, .movie-hero h1")?.textContent?.trim() || "movie";
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    button.disabled = true;
    if (status) status.textContent = "Creating your Story image…";
    try {
      if (!posterUrl) throw new Error("Movie poster unavailable");
      const [template, poster] = await Promise.all([loadImage(templateUrl), loadImage(posterUrl)]);
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(template, 0, 0, canvas.width, canvas.height);

      // Keep the whole original poster visible, including its title and credits.
      const maxWidth = 620;
      const maxHeight = 930;
      const scale = Math.min(maxWidth / poster.naturalWidth, maxHeight / poster.naturalHeight);
      const width = poster.naturalWidth * scale;
      const height = poster.naturalHeight * scale;
      const x = (canvas.width - width) / 2;
      const y = 600 + (maxHeight - height) / 2;
      context.save();
      context.shadowColor = "rgba(0, 0, 0, .75)";
      context.shadowBlur = 48;
      context.shadowOffsetY = 22;
      context.fillStyle = "#081619";
      roundedRect(context, x - 9, y - 9, width + 18, height + 18, 24);
      context.fill();
      context.restore();
      context.save();
      roundedRect(context, x, y, width, height, 17);
      context.clip();
      context.drawImage(poster, x, y, width, height);
      context.restore();
      context.strokeStyle = "rgba(133, 239, 229, .7)";
      context.lineWidth = 3;
      roundedRect(context, x - 2, y - 2, width + 4, height + 4, 19);
      context.stroke();

      if (document.fonts?.load) {
        await document.fonts.load('600 34px "Outfit"').catch(() => {});
      }
      context.textAlign = "center";
      context.fillStyle = "#eaf8f7";
      context.font = '600 34px "Outfit", Arial, sans-serif';
      context.fillText(progressText(), 540, 1609, 850);

      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Image export unavailable");
      const filename = `${slug || "movie"}-story.png`;
      const file = new File([blob], filename, { type: "image/png" });
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile && navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: `${title} | Movie Your English` });
          if (status) status.textContent = "Story image ready to share!";
          return;
        } catch (error) {
          if (error?.name === "AbortError") {
            if (status) status.textContent = "Story sharing canceled.";
            return;
          }
        }
      }
      download(blob, filename);
      if (status) status.textContent = "Story image downloaded. Add it to your Instagram Story!";
    } catch (error) {
      console.error("Movie Your English Story export failed", error);
      if (status) status.textContent = "We couldn't create the Story image. Please try again.";
    } finally {
      button.disabled = false;
    }
  }

  // Capture before older lesson-specific handlers, so all lessons use one design.
  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("#share-story");
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!button.disabled) createStory(button);
  }, true);
})();
