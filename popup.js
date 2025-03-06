import {
  parseVideoId,
  checkThumbnailExistence,
  downloadThumbnail,
} from "./download-helpers.js";

// For right-clicking on a video thumbnail and downloading it
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "downloadThumbnail") {
    const videoId = message.videoId;
    downloadThumbnail(videoId);
  }
});

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
      downloadThumbnail(videoId, tabs[0].title);
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
    // For custom URL input, we don't have a title, so the function will use the active tab title as fallback
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
    checkThumbnailExistence(videoId).then((highestQuality) => {
      // Reset or set the download button's state depending on highestQuality
      if (highestQuality) {
        thumbnailEle.src = highestQuality;
        thumbnailEle.classList.remove("display-none");
        document.getElementById("currentVideo").disabled = false;
      } else {
        document.getElementById("currentVideo").disabled = true;
      }
    });
  }
});
