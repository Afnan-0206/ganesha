export function preloadAssets() {
  const imageUrls = [
    '/intro.mp4'
  ];

  // Silently fetch and cache images in the background
  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}
