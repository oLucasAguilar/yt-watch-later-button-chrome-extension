chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("youtube.com/watch")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        if (typeof executeSequence === "function") {
          executeSequence();
        } else {
          console.error("executeSequence function not found");
        }
      }
    });
  } else {
    console.log("Not a YouTube video page");
  }
});