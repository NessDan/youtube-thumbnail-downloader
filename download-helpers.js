const thumbnailFormats = [
  "maxresdefault.jpg",
  "maxresdefault.webp",
  "sddefault.jpg",
  "hqdefault.jpg",
  "mqdefault.jpg",
];

export const parseVideoId = (url) => {
  let videoId = "";
  if (url.includes("youtube.com/watch?v=")) {
    videoId = url.split("v=")[1].substring(0, 11);
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].substring(0, 11);
  }
  return videoId;
};

export const checkThumbnailExistence = async (videoId) => {
  let highestQualityImage = "";

  const fetchThumbnail = async (format) => {
    const imgUrl = `https://img.youtube.com/vi/${videoId}/${format}`;
    try {
      const response = await fetch(imgUrl, { method: "HEAD" });
      if (response.status === 200) {
        return imgUrl;
      }
    } catch (error) {
      // Skip this format if fetch fails
    }
    return null;
  };

  // Kick-off all fetches at once
  const fetchPromises = thumbnailFormats.map(fetchThumbnail);

  // Wait for promises in order of preferred format
  for (const promise of fetchPromises) {
    const result = await promise;
    if (result) {
      highestQualityImage = result;
      break;
    }
  }

  return highestQualityImage;
};

export const downloadThumbnail = async (videoId) => {
  const highestQuality = await checkThumbnailExistence(videoId);

  if (highestQuality) {
    chrome.downloads.download({
      url: highestQuality,
      filename: `${videoId}_thumbnail_${highestQuality.split("/").pop()}`,
    });
  }
};
