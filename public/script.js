document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    const dropzone = document.querySelector('.dropzone');
  
    function closePopup() {
      document.getElementById('popupOverlay').style.display = 'none';
      document.getElementById('popup').style.display = 'none';
    }
  
    // Add event listener to the close button
    const closeButton = document.querySelector('.close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', closePopup);
    }
  
    // Also close the popup if the overlay is clicked
    const popupOverlay = document.getElementById('popupOverlay');
    if (popupOverlay) {
      popupOverlay.addEventListener('click', closePopup);
    }
   
  
    // Safely reference the file input elements
    const twibbonUpload = document.getElementById('twibbonUpload');
    const twibbonPreview = document.getElementById('twibbonPreview');
  
    function loadSavedTwibbon() {
      const savedTwibbon = localStorage.getItem('twibbonImage');
      if (savedTwibbon) {
        twibbonPreview.src = savedTwibbon;
        document.getElementById('twibbonPreviewContainer').style.display = 'block';
        document.getElementById('twibbonSection').style.display = 'none';
      }
    }
  
    loadSavedTwibbon();
    
    twibbonUpload.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          twibbonPreview.src = e.target.result;
          document.getElementById('twibbonPreviewContainer').style.display = 'block';
          document.getElementById('twibbonSection').style.display = 'none';
  
          // Save to localStorage
          localStorage.setItem('twibbonImage', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  
    // Allow clicking Twibbon to re-upload
    twibbonPreview.addEventListener('click', function () {
      console.log("Twibbon clicked!");
      twibbonUpload.click();
    });
    
    const imageUpload = document.getElementById('imageUpload');
  
    // Ensure these elements exist
    if (!twibbonUpload || !imageUpload) {
      console.error('Upload input elements not found!');
      return;
    }
    
    
  
    // Drag-and-drop functionality for Twibbon
    function setupDropZone(dropZone, inputElement, isTwibbon = false) {
      if (!dropZone || !inputElement) {
        console.error('Drop zone or input element not found');
        return;
      }
  
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
  
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });
  
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        inputElement.files = e.dataTransfer.files;
        if (isTwibbon) {
          uploadTwibbon();
        } else {
          previewUploadedImages();
        }
      });
  
      dropZone.addEventListener('click', () => {
        inputElement.click();
      });
  
      inputElement.addEventListener('change', () => {
        if (isTwibbon) {
          uploadTwibbon();
        } else {
          previewUploadedImages();
        }
      });
    }
  
    // Function to upload the Twibbon
    async function uploadTwibbon() {
      if (!twibbonUpload.files[0]) {
        alert('Please select a Twibbon file.');
        return;
      }
  
      const file = twibbonUpload.files[0];
      const formData = new FormData();
      formData.append('twibbon', file);
  
      const response = await fetch('/upload-twibbon', {
        method: 'POST',
        body: formData,
      });
  
      if (response.ok) {
        const dropZone = document.getElementById('twibbonDropZone');
        dropZone.innerHTML = ''; // Clear the drop zone content
  
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = 'Uploaded Twibbon';
        img.style.width = '100px';
        img.style.margin = '5px';
        dropZone.appendChild(img);
      } else {
        alert('Failed to upload Twibbon.');
      }
    }
  
  
      function previewUploadedImages() {
      const dropZone = document.getElementById('imageDropZone');
      dropZone.innerHTML = ''; // Clear previous previews
  
      for (let file of imageUpload.files) {
        const imgSrc = URL.createObjectURL(file);
        const imageCard = createImageCard(imgSrc, file.name);
        dropZone.appendChild(imageCard);
      }
    }
    
    const deleteTwibbon = document.getElementById('deleteTwibbon');

    if (deleteTwibbon) {
        deleteTwibbon.addEventListener('click', function () {
            // Clear the preview image
            twibbonPreview.src = '';
            
            // Hide the preview container and show the upload section
            document.getElementById('twibbonPreviewContainer').style.display = 'none';
            document.getElementById('twibbonSection').style.display = 'block';
            
            // Reset file input
            twibbonUpload.value = '';
    
            // Remove Twibbon from localStorage
            localStorage.removeItem('twibbonImage');
        });
    }
    
  
    
  
    // Process Images button click handler
    const processImagesButton = document.getElementById('processImages');
    if (processImagesButton) {
      processImagesButton.addEventListener('click', async () => {
        const files = imageUpload.files;
        if (files.length === 0) {
          alert('Please select at least one image.');
          return;
        }
  
        const imageFormat = document.getElementById('imageFormat').value;
        const loading = document.getElementById('loading');
        loading.style.display = 'block';
  
        const formData = new FormData();
        for (let file of files) {
          formData.append('images', file);
        }
        formData.append('format', imageFormat);
  
        try {
          const response = await fetch('/process', {
            method: 'POST',
            body: formData,
          });
  
          if (!response.ok) {
            throw new Error('Failed to process images.');
          }
  
          const result = await response.json();
          displayProcessedImages(result.processedImages);
        } catch (error) {
          console.error('Error processing images:', error);
          alert('Failed to process images.');
        } finally {
          loading.style.display = 'none';
        }
      });
    }
  
  
    function displayProcessedImages(processedImages) {
      const container = document.getElementById('processedImagesContainer');
      container.innerHTML = ''; // Clear previous images
  
      processedImages.forEach(imageData => {
        if (!imageData.path) {
          console.error("Missing image path:", imageData);
          return;
        }
  
        const imageCard = createImageCard(imageData.path, imageData.name);
        container.appendChild(imageCard);
      });
    }
  
    // Initialize drop zones
    setupDropZone(document.getElementById('twibbonDropZone'), twibbonUpload, true);
    setupDropZone(document.getElementById('imageDropZone'), imageUpload);
  
    function createImageCard(imageSrc, imageName) {
        const card = document.createElement('div');
        card.className = 'image-card';
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = imageName;
        
        card.appendChild(img);
        card.addEventListener('click', () => openPopup(imageSrc, imageName));
        return card;
      }
  
      function openPopup(imageSrc, imageName) {
        const popup = document.getElementById('popup');
        const popupImage = document.getElementById('popupImage');
  
        popupImage.src = imageSrc;
        document.getElementById('popupText').innerText = imageName;
        
  
        popup.style.display = 'block';
        document.getElementById('popupOverlay').style.display = 'block';
  
        // Ensure the popup fits within the screen
        popup.style.maxWidth = '90vw';
        popup.style.maxHeight = '90vh';
      }
  
  
      function closePopup() {
        document.getElementById('popupOverlay').style.display = 'none';
        document.getElementById('popup').style.display = 'none';
        }
        document.getElementById('popupOverlay').addEventListener('click', closePopup);
  
      });
  