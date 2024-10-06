// Define button states as constants
const BUTTON_STYLE = {
  GREEN_STATE: {
    style: {
      backgroundColor: '#3a3a3a',
      color: '#ffffff',
    },
    innerHTML: "Don't watch later"
  },
  RED_STATE: {
    style: {
      backgroundColor: '#ffffff',
      color: '#000000',
    },
    innerHTML: 'Watch later'
  }
};

// Define common button styles as a constant
const BUTTON_STYLE_COMMON = {
  display: 'inline-block',
  outline: '0',
  border: 'none',
  cursor: 'pointer',
  height: '32px',
  padding: '0px 16px',
  borderRadius: '50px',
  fontSize: '12px',
  fontWeight: '500',
  marginRight: '10px'
};

// Variables to control the timing delays (in milliseconds)
let dropdownDelay = 500; // Delay after opening the dropdown
let checkboxDelay = 1000; // Delay before finding the checkbox
let watchLaterCheckbox; // Variable to store the checkbox element
let initialCheckboxState; // Variable to store the initial state of the checkbox
let previousUrl = window.location.href; // Store the initial URL
let retryLimit = 3; // Number of retries for clicking the "More actions" button

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
function clickMoreActionsButton(retries = 0) {
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

// Function to click the "Save" item in the dropdown menu, retrying if necessary
function clickSaveItem(retries = 0) {
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

      // Close the "More actions" menu and retry clicking it if retries are available
      if (retries < retryLimit) {
        console.log(`Retrying clickMoreActionsButton (${retries + 1}/${retryLimit})`);

        clickCloseMoreActions().then(() => {
          setTimeout(() => {
            clickMoreActionsButton(retries + 1)
              .then(clickSaveItem.bind(null, retries + 1)) // Retry clickSaveItem
              .then(resolve); // Continue if success
          }, dropdownDelay);
        });
      } else {
        console.log('Retry limit reached, Save button not found');
        resolve(false);
      }
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

// Function to click the close button in the "More actions" menu
function clickCloseMoreActions() {
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
    const newButton = document.createElement('button');
    newButton.id = 'watchLaterButton'; // Button ID for reference

    const initialState = initialCheckboxState ? BUTTON_STYLE.GREEN_STATE : BUTTON_STYLE.RED_STATE;

    // Apply common styles
    Object.assign(newButton, initialState);
    Object.assign(newButton.style, initialState.style);
    Object.assign(newButton.style, BUTTON_STYLE_COMMON);

    newButton.addEventListener('click', () => {
      if (watchLaterCheckbox) {
        watchLaterCheckbox.click();
        console.log('Watch later checkbox clicked');
        const isChecked = watchLaterCheckbox.getAttribute('aria-checked') === 'true';
        const newState = isChecked ? BUTTON_STYLE.GREEN_STATE : BUTTON_STYLE.RED_STATE;
        Object.assign(newButton, newState);
        Object.assign(newButton.style, newState.style);
        Object.assign(newButton.style, BUTTON_STYLE_COMMON);
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
    previousUrl = currentUrl;
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
      return clickCloseMoreActions();
    } else {
      throw new Error('findWatchLaterCheckbox failed');
    }
  }).then((result) => {
    if (result) {
      return addWatchLaterButton();
    } else {
      throw new Error('clickCloseMoreActions failed');
    }
  }).catch((error) => {
    console.error(error.message);
  });
}

// Make executeSequence globally accessible
window.executeSequence = executeSequence;

// Start observing for the button load after a delay when the script runs
setTimeout(() => {
  executeSequence();
}, 2500); // Wait for 2.5 seconds before starting

// Create a MutationObserver to watch for URL changes
const urlObserver = new MutationObserver(() => {
  if (checkUrlChange()) {
    executeSequence();
  }
});

// Configure the observer to watch for changes in the document's title
urlObserver.observe(document.querySelector('title'), {
  subtree: true,
  characterData: true,
  childList: true
});

// Initial check when the script runs
setTimeout(() => {
  if (checkUrlChange()) {
    executeSequence();
  }
}, 2500);
