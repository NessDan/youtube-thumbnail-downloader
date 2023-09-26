import { parseVideoId, downloadThumbnail } from "./download-helpers.js";

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "downloadThumbnailLink",
    title: "Download thumbnail",
    contexts: ["link"],
    targetUrlPatterns: ["*://www.youtube.com/watch?v=*", "*://youtu.be/*"],
  });
  chrome.contextMenus.create({
    id: "downloadThumbnailPage",
    title: "Download thumbnail",
    contexts: ["page"],
    documentUrlPatterns: ["*://www.youtube.com/watch?v=*", "*://youtu.be/*"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    info.menuItemId === "downloadThumbnailLink" ||
    info.menuItemId === "downloadThumbnailPage"
  ) {
    const videoId = parseVideoId(info.linkUrl || tab.url);
    downloadThumbnail(videoId);
  }
});
