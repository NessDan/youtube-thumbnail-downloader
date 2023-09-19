const thumbnailFormats = [
  "maxresdefault.jpg",
  "maxresdefault.webp",
  "sddefault.jpg",
  "hqdefault.jpg",
  "mqdefault.jpg",
];
let highestQualityImage = "";
let highestQualityFormat = thumbnailFormats[thumbnailFormats.length - 1];

function checkThumbnailExistence(videoId, formats, thumbnailEle) {
  let firstValidImageLoaded = false;

  const promises = formats.map((format) => {
    return new Promise((resolve) => {
      const imgUrl = `https://img.youtube.com/vi/${videoId}/${format}`;
      const img = new Image();

      img.onload = () => {
        if (img.width !== 120 || img.height !== 90) {
          if (!firstValidImageLoaded) {
            thumbnailEle.src = imgUrl;
            thumbnailEle.classList.remove("display-none");
            firstValidImageLoaded = true;
          }

          if (formats.indexOf(format) < formats.indexOf(highestQualityFormat)) {
            highestQualityFormat = format;
            highestQualityImage = imgUrl;
          }
          resolve(imgUrl);
        } else {
          resolve(null);
        }
      };

      img.onerror = () => {
        resolve(null);
      };

      img.src = imgUrl;
    });
  });

  return Promise.all(promises).then(() => highestQualityImage);
}

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

  function parseVideoId(url) {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].substring(0, 11);
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].substring(0, 11);
    }
    return videoId;
  }

  function updateImage(url, thumbnailEle) {
    const videoId = parseVideoId(url);
    highestQualityFormat = thumbnailFormats[thumbnailFormats.length - 1]; // Reset the highest quality found
    checkThumbnailExistence(videoId, thumbnailFormats, thumbnailEle).then(
      (highestQuality) => {
        // Reset or set the download button's state depending on highestQuality
        if (highestQuality) {
          document.getElementById("currentVideo").disabled = false;
        } else {
          document.getElementById("currentVideo").disabled = true;
        }
      }
    );
  }

  function downloadThumbnail(videoId) {
    if (highestQualityImage) {
      chrome.downloads.download({
        url: highestQualityImage,
        filename: `${videoId}_thumbnail_${highestQualityFormat}`,
      });
    }
  }
});
