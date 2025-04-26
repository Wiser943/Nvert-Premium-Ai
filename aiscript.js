const notifications = document.createElement('ul');
notifications.className = 'notifications';
const toastDetails = {
  timer: 5000,
  success: {
    icon: 'bx bx-check-double',
    className: 'success'
  },
  error: {
    icon: 'bx bx-close',
    className: 'error'
  },
  warning: {
    icon: 'bx bx-alt-bug',
    className: 'warning'
  },
  info: {
    icon: 'bx bx-info-circle',
    className: 'info'
  }
}

const removeToast = (toast) => {
  toast.classList.add("hide");
  if (toast.timeoutId) clearTimeout(toast.timeoutId);
  setTimeout(() => toast.remove(), 500);
}

const createToast = (text, type) => {
  const { icon, className } = toastDetails/*[type]*/;
  const toast = document.createElement("li");
  toast.className = `toast ${className}`;
  toast.innerHTML = `
    <div class="column">
      <i class="${icon}"></i>
      <span>${text}</span>
    </div>
    <i class="bx bx-x" onclick="removeToast(this.parentElement)"></i>
  `;
  notifications.appendChild(toast);
  toast.timeoutId = setTimeout(() => removeToast(toast), toastDetails.timer);
  document.body.appendChild(notifications)
}
// Example usage:
const showToast = (text, type) => {
  createToast(text, type);
}

// Toggle the visibility of a dropdown menu
const toggleDropdown = (dropdown, menu, isOpen) => {
  dropdown.classList.toggle("open", isOpen);
  menu.style.height = isOpen ? `${menu.scrollHeight}px` : 0;
};

// Close all open dropdowns
const closeAllDropdowns = () => {
  document.querySelectorAll(".dropdown-container.open").forEach((openDropdown) => {
    const menu = openDropdown.querySelector(".dropdown-menu");
    toggleDropdown(openDropdown, menu, false);
  });
};

// Attach click event to all dropdown toggles
document.querySelectorAll(".dropdown-toggle").forEach((dropdownToggle) => {
  dropdownToggle.addEventListener("click", (e) => {
    e.preventDefault();
    const dropdown = dropdownToggle.closest(".dropdown-container");
    const menu = dropdown.querySelector(".dropdown-menu");
    const isOpen = dropdown.classList.contains("open");
    closeAllDropdowns(); // Close all open dropdowns
    toggleDropdown(dropdown, menu, !isOpen); // Toggle current dropdown visibility
  });
});

// Attach click event to sidebar toggle buttons
document.querySelectorAll(".sidebar-toggler, .sidebar-menu-button").forEach((button) => {
  button.addEventListener("click", () => {
    closeAllDropdowns(); // Close all open dropdowns
    document.querySelector(".sidebar").classList.toggle("collapsed"); // Toggle collapsed class on sidebar
  });
});

// Collapse sidebar by default on small screens
if (window.innerWidth <= 1024) {
  document.querySelector(".sidebar").classList.add("collapsed");
}


// Select all elements with the class "sub-heading"
const dynamicTextElements = document.querySelectorAll(".sub-heading");

// Define the words to be typed
const words = ["How can i help you today ?"];

// Define the typing effect function
const typeEffect = (dynamicText, wordIndex, charIndex, isDeleting) => {
  const currentWord = words[wordIndex];
  const currentChar = currentWord.substring(0, charIndex);
  dynamicText.textContent = currentChar;
  dynamicText.classList.add("stop-blinking");
  
  if (!isDeleting && charIndex < currentWord.length) {
    charIndex++;
    setTimeout(() => typeEffect(dynamicText, wordIndex, charIndex, isDeleting), 200);
  } else if (isDeleting && charIndex > 0) {
    charIndex--;
    setTimeout(() => typeEffect(dynamicText, wordIndex, charIndex, isDeleting), 100);
  } else {
    isDeleting = !isDeleting;
    dynamicText.classList.remove("stop-blinking");
    wordIndex = !isDeleting ? (wordIndex + 1) % words.length : wordIndex;
    // setTimeout(() => typeEffect(dynamicText, wordIndex, charIndex, isDeleting), 1200);
  }
};
// Initialize the typing effect for each element
dynamicTextElements.forEach((dynamicText, index) => {
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  typeEffect(dynamicText, wordIndex, charIndex, isDeleting);
});


// Toggle the visibility of a premium menu
document.querySelectorAll(".premium-btn").forEach((premiumToggle) => {
  premiumToggle.addEventListener("click", () => {
    document.querySelectorAll(".premium-menu").forEach((premiumMenu) => {
      premiumMenu.classList.toggle("show-premium");
    });
    closeAllDropdowns(); // Close all open dropdowns
  });
});


//declaration of variables
const container = document.querySelector(".container");
const premiumContainer = document.querySelector(".premium-container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInputs = promptForm.querySelectorAll(".prompt-input");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = promptForm.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggleBtn = document.querySelector("#theme-toggle-btn");


const sendbtn = document.querySelector(".send-prompt-btn");
let userChatInput = promptInput;
userChatInput.addEventListener('input', () => {
  userChatInput.style.height = 'auto';
  userChatInput.style.height = `${userChatInput.scrollHeight}px`;
  let maxHeight = 85; // maximum height in pixels
  if (this === "") {
    sendbtn.style.display = "none";
  }
  else if (userChatInput.scrollHeight > maxHeight) {
    userChatInput.style.overflowY = 'auto';
    userChatInput.style.height = `${maxHeight}px`;
  }
  else {
    userChatInput.style.overflowY = 'hidden';
    sendbtn.style.display = "block";
  }
});


const premiumToggler = document.querySelectorAll(".premium-switch");
premiumToggler.forEach((premiumSwitch) => {
  premiumSwitch.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm("Are you sure you sure you want to save and Switch!! ")) {
      let isPremium = premiumContainer.classList.toggle("switched-on");
      container.classList.toggle("switched-off");
      showToast("Switched Success!!");
      
    }
  })
})

const switchContainer = document.querySelector(".switch");
const skeletonContainer = document.querySelector(".skeleton-container");
const CHAT_HISTORY_KEY = 'chatHistory';

// Load chat history from local storage on page load
let chatHistory = JSON.parse(localStorage.getItem(CHAT_HISTORY_KEY)) || [];

// API Setup
const TEXTAPI_KEY = "GOOGLE-GEMINI-API"; // Replace with your actual API key
const TEXTAPI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${TEXTAPI_KEY}`;

let controller, typingInterval;
const userData = { message: "", file: {} };

// Set initial theme from local storage
const isLightTheme = localStorage.getItem("themeColor") === "light_mode";
document.body.classList.toggle("light-theme", isLightTheme);
themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";


// Function to create message elements
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Scroll to the bottom of the container
const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

// Simulate typing effect for bot responses
const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  let currentIndex = 0;
  
  typingInterval = setInterval(() => {
    if (currentIndex < text.length) {
      textElement.textContent += text.charAt(currentIndex);
      scrollToBottom();
      currentIndex++;
    } else {
      clearInterval(typingInterval);
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
      // Add copy button after typing is complete
      addCopyButton(botMsgDiv);
    }
  }, 20); // Adjust typing speed as needed
};

// Function to add a copy button to the bot message
const addCopyButton = (messageDiv) => {
  const messageTextElement = messageDiv.querySelector('.message-text');
  const messageText = messageTextElement.textContent;
  const copyButton = document.createElement('button');
  copyButton.innerHTML = '<span class="material-symbols-rounded">content_copy</span>';
  copyButton.classList.add('copy-button');
  copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(messageText).then(() => {
      showToast('Response copied!', 'success');
    }).catch(err => {
      console.error('Could not copy text: ', err);
      showToast('Could not copy response.', 'warning');
    });
  });
  messageDiv.appendChild(copyButton);
};

// Make the API call and generate the bot's response
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  controller = new AbortController();
  
  // Add user message and file data to the chat history
  chatHistory.push({
    role: "user",
    parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: (({ fileName, isImage, ...rest }) => rest)(userData.file) }] : [])],
  });
  saveChatHistory(); // Save after user message
  
  try {
    // Send the chat history to the API to get a response
    const response = await fetch(TEXTAPI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
      signal: controller.signal,
    });
    
    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    sendbtn.style.display = "none";
    // Process the response text and display with typing effect
    let responseText = data.candidates[0].content.parts[0].text.trim();
    typingEffect(responseText, textElement, botMsgDiv);
    
    chatHistory.push({ role: "model", parts: [{ text: responseText }] });
    saveChatHistory(); // Save after bot response
  } catch (error) {
    textElement.textContent = error.name === "AbortError" ? "You stopped this response." : error.message;
    textElement.style.color = "#d62939";
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
    scrollToBottom();
  } finally {
    userData.file = {};
  }
};

// Handle the form submission
const handleFormSubmit = (e) => {
  e.preventDefault();
  const userMessage = promptInput.value.trim();
  if (!userMessage || document.body.classList.contains("bot-responding")) return;
  userData.message = userMessage;
  promptInput.value = "";
  document.body.classList.add("chats-active", "bot-responding");
  fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");
  
  // Generate user message HTML with optional file attachment
  const userMsgHTML = `
        <p class="message-text"></p>
        ${userData.file.data ? (userData.file.isImage ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />` : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`) : ""}
    `;
  
  const userMsgDiv = createMessageElement(userMsgHTML, "user-message");
  userMsgDiv.querySelector(".message-text").textContent = userData.message;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();
  
  setTimeout(() => {
    // Generate bot message HTML and add in the chat container
    const botMsgHTML = `<p class="avatar"><span class="material-symbols-outlined">graph_5</span></p> <p class="message-text">Just a sec...</p>`;
    const botMsgDiv = createMessageElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 600); // 600 ms delay
};

// Handle file input change (file upload)
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  
  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);
  
  reader.onload = (e) => {
    fileInput.value = "";
    const base64String = e.target.result.split(",")[1];
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");
    
    // Store file data in userData obj
    userData.file = { fileName: file.name, data: base64String, mime_type: file.type, isImage };
  };
});

// Cancel file upload
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("file-attached", "img-attached", "active");
});

// Stop Bot Response
document.querySelector("#stop-response-btn").addEventListener("click", () => {
  showToast("Oops: You stopped the response", 'warning')
  controller?.abort();
  userData.file = {};
  clearInterval(typingInterval);
  const loadingBotMessage = chatsContainer.querySelector(".bot-message.loading");
  if (loadingBotMessage) {
    loadingBotMessage.classList.remove("loading");
    loadingBotMessage.querySelector(".message-text").textContent = "Response generation stopped.";
  }
  document.body.classList.remove("bot-responding");
});

// Toggle dark/light theme
themeToggleBtn.addEventListener("click", () => {
  showToast("Configuration succes", 'success')
  const isLightTheme = document.body.classList.toggle("light-theme");
  localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
  themeToggleBtn.textContent = isLightTheme ? "dark_mode" : "light_mode";
});

// Delete all chats
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  if (confirm("Are you sure you want to delete this chat history")) {
    chatHistory.length = 0;
    chatsContainer.innerHTML = "";
    document.body.classList.remove("chats-active", "bot-responding");
    showToast("Chat history cleared", 'info')
    localStorage.removeItem(CHAT_HISTORY_KEY); // Clear local storage}
  }
});

// Handle suggestions click
document.querySelectorAll(".suggestions-item").forEach((suggestion) => {
  suggestion.addEventListener("click", () => {
    promptInput.value = suggestion.querySelector(".text").textContent;
    promptForm.dispatchEvent(new Event("submit"));
  });
});

// Show/hide controls for mobile on prompt input focus
document.addEventListener("click", ({ target }) => {
  const wrapper = document.querySelector(".prompt-wrapper");
  const shouldHide = target.classList.contains("prompt-input") || (wrapper.classList.contains("hide-controls") && (target.id === "add-file-btn" || target.id === "stop-response-btn"));
  wrapper.classList.toggle("hide-controls", shouldHide);
});

// Add event listeners for form submission and file input click
promptForm.addEventListener("submit", handleFormSubmit);
promptForm.querySelector("#add-file-btn").addEventListener("click", () => fileInput.click());

// Function to save chat history to local storage
const saveChatHistory = () => {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatHistory));
  showToast("Auto save enabled", 'info')
};

// Function to render chat history from local storage
const renderChatHistory = () => {
  chatsContainer.innerHTML = ""; // Clear existing messages
  if (chatHistory.length > 0) {
    document.body.classList.add("chats-active");
    chatHistory.forEach(message => {
      let messageContent = message.parts[0].text;
      let messageHTML = `<p class="message-text">${messageContent}</p>`;
      
      if (message.role === "user") {
        if (message.parts.find(part => part.inline_data)) {
          const inlineData = message.parts.find(part => part.inline_data);
          messageHTML += inlineData.mine_type.startsWith('image/') ?
            `<img src="data:${inlineData.mime_type};base64,${inlineData.data}" class="img-attachment" />` :
            `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${inlineData.fileName}</p>`;
        }
        const userMsgDiv = createMessageElement(messageHTML, "user-message");
        chatsContainer.appendChild(userMsgDiv);
      } else if (message.role === "model") {
        const botMsgDiv = createMessageElement(messageHTML, "bot-message");
        chatsContainer.appendChild(botMsgDiv);
        addCopyButton(botMsgDiv); // Add copy button when rendering from history
      }
    });
    scrollToBottom();
  }
};



window.addEventListener('load', () => {
  if (navigator.onLine) {
    showToast("You're online!", 'info');
   // skeletonContainer.style.display = "none";
    //switchContainer.style.display = "block";
    // Re-render chat history from local storage
    renderChatHistory();
  }
  else if (!navigator.onLine) {
    //skeletonContainer.style.display = "block";
    switchContainer.style.display = "none";
  } else {
    showToast("Unstable Network connection ");
  }
  
  window.addEventListener('online', () => {
    showToast("Your connection was restored!", 'success');
    
  });
  
  
});


/*const popup = document.createElement("div");
popup.classList = "popup";
popup.innerHTML =
  ` <div class="icon"><i class=""></i></div>
    <div class="details">
      <h2 class="title"></h2>
      <p class="desc"></p>
      <button class="reconnect">Reconnect Now</button>
  </div>`
document.body.appendChild(popup)
*/
const popup = document.querySelector(".popup");
//const popup = document.querySelector(".popup"),
//wifiIcon = document.querySelector(".icon i"),
  popupTitle = document.querySelector(".popup .title"),
  popupDesc = document.querySelector(".desc"),
  reconnectBtn = document.querySelector(".reconnect");

let isOnline = true,
  intervalId, timer = 10;

const checkConnection = async () => {
  try {
    // Try to fetch random data from the API. If the status code is between 
    // 200 and 300, the network connection is considered online 
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    isOnline = response.status >= 200 && response.status < 300;
    switchContainer.style.display = "block";
  } catch (error) {
    isOnline = false; // If there is an error, the connection is considered offline
    
    popupTitle.innerHTML = "Still offline";
    showToast("Still offline", 'warning');
    switchContainer.style.display = "none";
  }
  timer = 10;
  clearInterval(intervalId);
  handlePopup(isOnline);
}

const handlePopup = (status) => {
  if (status) { // If the status is true (online), update icon, title, and description accordingly
    //wifiIcon.className = "uil uil-wifi";
    popupTitle.innerText = "Restored Connection";
   // showToast("Restored Connection", 'info');
    popupDesc.innerHTML = "Your device is now successfully connected to the internet.";
    return setTimeout(() => popup.classList.remove("show"), 2000);
    //renderChatHistory();
  }
  
  // If the status is false (offline), update the icon, title, and description accordingly
  //wifiIcon.className = "uil uil-wifi-slash";
  popupTitle.innerText = "Lost Connection";
  popupDesc.innerHTML = "Your network is unavailable. We will attempt to reconnect you in <b>10</b> seconds.";
  popup.className = "popup show";
  
  intervalId = setInterval(() => { // Set an interval to decrease the timer by 1 every second
    timer--;
    if (timer === 0) checkConnection(); // If the timer reaches 0, check the connection again
    popup.querySelector(".desc b").innerText = timer;
  }, 1000);
}

// Only if isOnline is true, check the connection status every 3 seconds
setInterval(() => isOnline && checkConnection(), 3000);
reconnectBtn.addEventListener("click", checkConnection);