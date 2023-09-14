document.addEventListener("DOMContentLoaded", function () {
  // Activate or deactivate the current video button
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    if (url.includes("youtube.com/watch?v=") || url.includes("youtu.be/")) {
      const currentVideoThumbnail = document.getElementById(
        "currentVideoThumbnail"
      );
      updateImage(url, currentVideoThumbnail);
      document.getElementById("currentVideo").disabled = false;
    }
  });

  function downloadCurrentVideoThumbnail() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const url = tabs[0].url;
      const videoId = parseVideoId(url);
      downloadThumbnail(videoId);
    });
  }

  document
    .getElementById("currentVideo")
    .addEventListener("click", downloadCurrentVideoThumbnail);
  document
    .getElementById("currentVideoThumbnail")
    .addEventListener("click", downloadCurrentVideoThumbnail);

  const urlInput = document.getElementById("urlInput");
  urlInput.addEventListener("input", function () {
    const url = urlInput.value;
    const customVideoThumbnail = document.getElementById(
      "customVideoThumbnail"
    );
    if (url.includes("youtube.com/watch?v=") || url.includes("youtu.be/")) {
      updateImage(url, customVideoThumbnail);
      document.getElementById("customVideo").disabled = false;
    } else {
      updateImage("", customVideoThumbnail);
      document.getElementById("customVideo").disabled = true;
    }
  });

  function downloadCustomVideoThumbnail() {
    const url = urlInput.value;
    const videoId = parseVideoId(url);
    downloadThumbnail(videoId);
  }

  document
    .getElementById("customVideo")
    .addEventListener("click", downloadCustomVideoThumbnail);
  document
    .getElementById("customVideoThumbnail")
    .addEventListener("click", downloadCustomVideoThumbnail);

  function updateImage(url, thumbnailEle) {
    const videoId = parseVideoId(url);
    const imgUrl = getThumbnailUrl(videoId);
    if (imgUrl === "") {
      thumbnailEle.src = "";
      thumbnailEle.classList.add("display-none");
      return;
    }

    thumbnailEle.src = imgUrl;
    thumbnailEle.classList.remove("display-none");
  }

  function parseVideoId(url) {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].substring(0, 11);
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].substring(0, 11);
    }
    return videoId;
  }

  function getThumbnailUrl(videoId) {
    if (videoId === "") return "";

    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }

  function downloadThumbnail(videoId) {
    const imgUrl = getThumbnailUrl(videoId);
    chrome.downloads.download({
      url: imgUrl,
      filename: `${videoId}_thumbnail.jpg`,
    });
  }
});
