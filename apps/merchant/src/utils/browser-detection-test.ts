// Simple browser detection test utility

// Extend Navigator interface for Web Bluetooth
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options: any): Promise<any>;
    };
  }
}

export function testBrowserDetection() {
  console.log("=== Browser Detection Test ===");
  console.log("User Agent:", navigator.userAgent);
  console.log("Vendor:", navigator.vendor);

  const isChrome =
    /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isEdge = /Edg/.test(navigator.userAgent);
  const isOpera =
    /OPR/.test(navigator.userAgent) || /Opera/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  const isSafari =
    /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

  console.log("isChrome:", isChrome);
  console.log("isEdge:", isEdge);
  console.log("isOpera:", isOpera);
  console.log("isFirefox:", isFirefox);
  console.log("isSafari:", isSafari);

  console.log("navigator.bluetooth:", navigator.bluetooth);
  console.log("'bluetooth' in navigator:", "bluetooth" in navigator);

  const supportedBrowsers = ["Chrome", "Edge", "Opera"];
  const detectedBrowser = isChrome
    ? "Chrome"
    : isEdge
      ? "Edge"
      : isOpera
        ? "Opera"
        : isFirefox
          ? "Firefox"
          : isSafari
            ? "Safari"
            : "Unknown";

  console.log("Detected browser:", detectedBrowser);
  console.log(
    "Web Bluetooth supported:",
    supportedBrowsers.includes(detectedBrowser),
  );

  return {
    browser: detectedBrowser,
    isSupported: supportedBrowsers.includes(detectedBrowser),
    hasBluetooth: "bluetooth" in navigator && navigator.bluetooth !== undefined,
  };
}
