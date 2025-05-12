

const submitForm = document.querySelector(".submit-form");
const promptBtn = document.getElementById("shuffle-btn");
const chatInput = document.getElementById("chat-input");
const generateBtn = document.getElementById("second-generate-btn");
const galleryGrid = document.querySelector(".gallery-grid");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");

const IMGAPI_KEY = "HUGGING-FACE-API"; // Hugging Face API Key
const WATERMARK_TEXT = "nvert";
const WATERMARK_FONT = "20px sans-serif";
const WATERMARK_COLOR = "rgba(0, 0, 0, 0.5)"; // Semi-transparent black
const WATERMARK_MARGIN = 10;
const ZOOM_SCALE = 2; // Scale factor for zoom

// Example prompts
const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

// Set theme based on saved preference or system default

// Calculate width/height based on chosen ratio
const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const [width, height] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);
  
  let calculatedWidth = Math.round(width * scaleFactor);
  let calculatedHeight = Math.round(height * scaleFactor);
  
  // Ensure dimensions are multiples of 16 (AI model requirements)
  calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
  calculatedHeight = Math.floor(calculatedHeight / 16) * 16;
  
  return { width: calculatedWidth, height: calculatedHeight };
};

// Add watermark to the image
const addWatermark = (image) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  
  ctx.font = WATERMARK_FONT;
  ctx.fillStyle = WATERMARK_COLOR;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  const textWidth = ctx.measureText(WATERMARK_TEXT).width;
  ctx.fillText(WATERMARK_TEXT, canvas.width - WATERMARK_MARGIN, canvas.height - WATERMARK_MARGIN);
  
  return canvas.toDataURL();
};

// Replace loading spinner with the actual image
const updateImageCard = (index, imageUrl) => {
  const imgCard = document.getElementById(`img-card-${index}`);
  if (!imgCard) return;
  
  imgCard.classList.remove("loading");
  
  const img = new Image();
  img.onload = () => {
    const watermarkedUrl = addWatermark(img);
    imgCard.innerHTML = `<img class="result-img" src="${watermarkedUrl}" style="cursor: pointer;" />
                  <div class="img-overlay">
                    <a href="${watermarkedUrl}" class="img-download-btn" title="Download Image" download>
                      <span class="material-symbols-outlined">download</span>
                    </a>
                  </div>`;
    
    // Add event listener for zoom functionality
    const resultImg = imgCard.querySelector(".result-img");
    if (resultImg) {
      resultImg.addEventListener("click", () => {
        if (!resultImg.dataset.originalWidth) {
          // Store original dimensions
          resultImg.dataset.originalWidth = resultImg.naturalWidth;
          resultImg.dataset.originalHeight = resultImg.naturalHeight;
          // Increase dimensions
          resultImg.style.width = `${resultImg.naturalWidth * ZOOM_SCALE}px`;
          resultImg.style.height = `${resultImg.naturalHeight * ZOOM_SCALE}px`;
        } else {
          // Restore original dimensions
          resultImg.style.width = `${resultImg.dataset.originalWidth}px`;
          resultImg.style.height = `${resultImg.dataset.originalHeight}px`;
          // Remove stored dimensions
          delete resultImg.dataset.originalWidth;
          delete resultImg.dataset.originalHeight;
        }
      });
    }
  };
  img.onerror = () => {
    imgCard.classList.replace("loading", "error");
    imgCard.querySelector(".status-text").textContent = "Failed to load image.";
  };
  img.src = imageUrl;
};

// Send requests to Hugging Face API to create images
const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
  const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
  const { width, height } = getImageDimensions(aspectRatio);
  generateBtn.setAttribute("disabled", "true");
  
  // Create an array of image generation promises
  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      // Send request to the AI model API
      const response = await fetch(MODEL_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${IMGAPI_KEY}`,
          "Content-Type": "application/json",
          "x-use-cache": "false",
        },
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },
        }),
      });
      
      if (!response.ok) throw new Error((await response.json())?.error);
      
      // Convert response to an image URL and update the image card
      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      // We still pass the original imageUrl to updateImageCard,
      // but the watermarking and download link update happen within it.
      updateImageCard(i, imageUrl);
    } catch (error) {
      console.error(error);
      // Assuming showToast function is defined elsewhere for displaying error messages
      // showToast("Please check your internet connection", "error");
      const imgCard = document.getElementById(`img-card-${i}`);
      if (imgCard) {
        imgCard.classList.replace("loading", "error");
        imgCard.querySelector(".status-text").textContent = "Generation failed! Check console for more details.";
      }
    }
  });
  
  await Promise.allSettled(imagePromises);
  generateBtn.removeAttribute("disabled");
};

// Create placeholder cards with loading spinners
const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
  galleryGrid.innerHTML = "";
  
  for (let i = 0; i < imageCount; i++) {
    galleryGrid.innerHTML += `
      <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
        <div class="status-container">
          <div class="spinner"></div>
          <span class="material-symbols-outlined">graph_5</span>
          <p class="status-text">Generating...</p>
        </div>
      </div>`;
  }
  
  // Stagger animation
  document.querySelectorAll(".img-card").forEach((card, i) => {
    setTimeout(() => card.classList.add("animate-in"), 100 * i);
  });
  
  generateImages(selectedModel, imageCount, aspectRatio, promptText); // Generate Images
};

// Handle form submission
const handleImgFormSubmit = (e) => {
  e.preventDefault();
  //skeletonContainer.style.display = "none";
  // Get form values
  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = chatInput.value.trim();
  //document.body.classList.add("chats-active", "bot-responding");
  createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

// Fill prompt input with random example (typing effect)
promptBtn.addEventListener("click", () => {
  const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  
  let i = 0;
  chatInput.focus();
  chatInput.value = "";
  
  // Disable the button during typing animation
  promptBtn.disabled = true;
  promptBtn.style.opacity = "0.5";
  
  // Typing effect
  const typeInterval = setInterval(() => {
    if (i < prompt.length) {
      chatInput.value += prompt.charAt(i);
      i++;
    } else {
      clearInterval(typeInterval);
      promptBtn.disabled = false;
      promptBtn.style.opacity = "0.8";
    }
  }, 10); // Speed of typing
});

submitForm.addEventListener("submit", handleImgFormSubmit);


