// Variables to control the timing delays (in milliseconds)
let dropdownDelay = 500; // Delay after opening the dropdown
let checkboxDelay = 1000; // Delay before finding the checkbox
let watchLaterCheckbox; // Variable to store the checkbox element
let initialCheckboxState; // Variable to store the initial state of the checkbox
let previousUrl = window.location.href; // Store the initial URL

// Function to observe when the "More actions" button is loaded
function observeForLoad() {
  return new Promise((resolve) => {
    const observer = new MutationObserver((mutationsList, observer) => {
      const button = document.querySelector('button[aria-label="More actions"]');
      if (button) {
        console.log('More actions button found');
        observer.disconnect(); // Stop observing once the button is found
        resolve(true);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Timeout in case the button isn't found
    setTimeout(() => {
      observer.disconnect();
      console.log('More actions button not found within time limit');
      resolve(false);
    }, 5000); // Adjust the timeout as needed
  });
}

// Function to simulate a click on the "More actions" button
function clickMoreActionsButton() {
  return new Promise((resolve) => {
    const button = document.querySelector('button[aria-label="More actions"]');
    if (button) {
      button.click();
      console.log('More actions button clicked');
      // Wait for the dropdown to open
      setTimeout(() => {
        resolve(true);
      }, dropdownDelay);
    } else {
      console.log('More actions button not found');
      resolve(false);
    }
  });
}

// Function to click the "Save" item in the dropdown menu
function clickSaveItem() {
  return new Promise((resolve) => {
    const saveButton = [...document.querySelectorAll('ytd-menu-service-item-renderer')]
      .find(item => item.textContent.trim() === 'Save');

    if (saveButton) {
      saveButton.click();
      console.log('Save button clicked');
      // Wait before finding the "Watch later" checkbox
      setTimeout(() => {
        resolve(true);
      }, checkboxDelay);
    } else {
      console.log('Save button not found');
      resolve(false);
    }
  });
}

// Function to find the "Watch later" checkbox and store it in a variable
function findWatchLaterCheckbox() {
  return new Promise((resolve) => {
    const watchLaterOption = [...document.querySelectorAll('ytd-playlist-add-to-option-renderer')]
      .find(item => item.querySelector('#label') && item.querySelector('#label').textContent.trim() === 'Watch later');

    if (watchLaterOption) {
      watchLaterCheckbox = watchLaterOption.querySelector('tp-yt-paper-checkbox');

      if (watchLaterCheckbox) {
        initialCheckboxState = watchLaterCheckbox.getAttribute('aria-checked') === 'true';
        console.log('Watch later checkbox found and stored');
        resolve(true);
      } else {
        console.log('Checkbox not found in Watch later option');
        resolve(false);
      }
    } else {
      console.log('Watch later option not found');
      resolve(false);
    }
  });
}

// Function to click the close button
function clickCloseButton() {
  return new Promise((resolve) => {
    const closeButton = document.querySelector('yt-icon-button#close-button button[aria-label="Cancel"]');

    if (closeButton) {
      closeButton.click();
      console.log('Close button clicked');
      resolve(true);
    } else {
      console.log('Close button not found');
      resolve(false);
    }
  });
}

// Function to add a new button to trigger the checkbox click
function addWatchLaterButton() {
  return new Promise((resolve) => {
    const greenStateButtonColor = '#3a3a3a';
    const greenStateTextColor = '#ffffff';
    const greenStateText = 'Don\'t watch later';

    const redStateButtonColor = '#ffffff';
    const redStateTextColor = '#000000';
    const redStateText = 'Watch later';

    const newButton = document.createElement('button');
    newButton.id = 'watchLaterButton'; // Button ID for reference

    newButton.innerText = initialCheckboxState ? greenStateText : redStateText;
    newButton.style.backgroundColor = initialCheckboxState ? greenStateButtonColor : redStateButtonColor;
    newButton.style.color = initialCheckboxState ? greenStateTextColor : redStateTextColor;

    // Apply styles
    newButton.style.display = 'inline-block';
    newButton.style.outline = '0';
    newButton.style.border = 'none';
    newButton.style.cursor = 'pointer';
    newButton.style.height = '32px';
    newButton.style.padding = '0px 16px';
    newButton.style.borderRadius = '50px';
    newButton.style.fontSize = '12px';
    newButton.style.fontWeight = '500';
    newButton.style.marginRight = '10px';

    newButton.addEventListener('click', () => {
      if (watchLaterCheckbox) {
        watchLaterCheckbox.click();
        console.log('Watch later checkbox clicked');
        const isChecked = watchLaterCheckbox.getAttribute('aria-checked') === 'true';
        newButton.style.backgroundColor = isChecked ? greenStateButtonColor : redStateButtonColor;
        newButton.style.color = isChecked ? greenStateTextColor : redStateTextColor;
        newButton.innerText = isChecked ? greenStateText : redStateText;
      } else {
        console.log('No Watch later checkbox available to click');
      }
    });

    const buttonsContainer = document.getElementById('buttons');
    if (buttonsContainer) {
      buttonsContainer.prepend(newButton);
      console.log('New button added to the container');
      resolve(true);
    } else {
      console.log('Buttons container not found');
      resolve(false);
    }
  });
}

// Function to check if the URL has changed
function checkUrlChange() {
  const currentUrl = window.location.href;
  if (currentUrl.includes('youtube.com/watch?v=') && currentUrl !== previousUrl) {
    console.log('URL changed to a YouTube video');
    previousUrl = currentUrl; // Update the previous URL
    return true;
  }
  return false;
}

// Sequential execution function
function executeSequence() {
  observeForLoad().then((result) => {
    if (result) {
      return clickMoreActionsButton();
    } else {
      throw new Error('observeForLoad failed');
    }
  }).then((result) => {
    if (result) {
      return clickSaveItem();
    } else {
      throw new Error('clickMoreActionsButton failed');
    }
  }).then((result) => {
    if (result) {
      return findWatchLaterCheckbox();
    } else {
      throw new Error('clickSaveItem failed');
    }
  }).then((result) => {
    if (result) {
      return clickCloseButton();
    } else {
      throw new Error('findWatchLaterCheckbox failed');
    }
  }).then((result) => {
    if (result) {
      return addWatchLaterButton();
    } else {
      throw new Error('clickCloseButton failed');
    }
  }).catch((error) => {
    console.error(error.message);
  });
}

// Start observing for the button load after a delay when the script runs
setTimeout(() => {
  executeSequence();
}, 2500); // Wait for 2.5 seconds before starting

// Set an interval to check for URL changes every second
setInterval(() => {
  if (checkUrlChange()) {
    executeSequence();
  }
}, 1000); // Check for URL changes every second
