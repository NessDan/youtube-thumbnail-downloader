import { parseVideoId, downloadThumbnail } from "./download-helpers.js";

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "downloadThumbnail",
    title: "Download thumbnail",
    contexts: ["page", "link"],
    targetUrlPatterns: ["*://www.youtube.com/watch?v=*", "*://youtu.be/*"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "downloadThumbnail") {
    const videoId = parseVideoId(info.linkUrl || tab.url);
    downloadThumbnail(videoId);
  }
});
