const chatWidget = document.getElementById('chat-widget');
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatWindow = document.getElementById('chat-window');
const chatCloseBtn = document.getElementById('chat-close-btn');
const chatInput = document.getElementById('chat-input');
const chatSendBtn = document.getElementById('chat-send-btn');
const chatMessages = document.getElementById('chat-messages');
const chatHeader = document.querySelector('.chat-header');

const API_URL = 'https://khagu-portfolio-bot.hf.space/query';

// Toggle Chat Window
function toggleChat() {
    chatWindow.classList.toggle('active');
    if (chatWindow.classList.contains('active')) {
        chatInput.focus();
        // Reset position if needed, or keep last dragged position
    }
}

chatToggleBtn.addEventListener('click', toggleChat);
chatCloseBtn.addEventListener('click', toggleChat);

// Drag Functionality
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

chatHeader.addEventListener('mousedown', dragStart);

function dragStart(e) {
    if (window.innerWidth <= 576) return; // Disable drag on mobile
    if (e.target === chatCloseBtn || e.target.closest('.chat-close-btn')) return;

    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;

    if (e.target === chatHeader || chatHeader.contains(e.target)) {
        isDragging = true;
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, chatWindow);
    }
}

function setTranslate(xPos, yPos, el) {
    // We need to maintain the scale(1) when active, or scale(0.95) when inactive
    // But dragging only happens when active.
    // The CSS transition might conflict with dragging.
    // Let's use style.transform directly.
    el.style.transform = `translate(${xPos}px, ${yPos}px) scale(1)`;
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

// Resize Functionality
const resizers = document.querySelectorAll('.resizer');
let isResizing = false;
let currentResizer;

resizers.forEach(resizer => {
    resizer.addEventListener('mousedown', (e) => {
        if (window.innerWidth <= 576) return; // Disable resize on mobile
        e.preventDefault();
        isResizing = true;
        currentResizer = resizer;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });
});

function resize(e) {
    if (!isResizing) return;

    if (currentResizer.classList.contains('resizer-t')) {
        // Resize height (Top handle)
        // Height increases as mouse moves up (y decreases)
        // But we need to account for the fixed bottom position.
        // Actually, since it's bottom-anchored, increasing height grows it upwards.
        // So we just need to calculate the new height based on mouse position relative to bottom.
        const rect = chatWindow.getBoundingClientRect();
        const bottom = rect.bottom;
        const newHeight = bottom - e.clientY;
        if (newHeight > 400 && newHeight < window.innerHeight * 0.8) {
            chatWindow.style.height = newHeight + 'px';
        }
    } else if (currentResizer.classList.contains('resizer-l')) {
        // Resize width (Left handle)
        // Width increases as mouse moves left (x decreases)
        const rect = chatWindow.getBoundingClientRect();
        const right = rect.right;
        const newWidth = right - e.clientX;
        if (newWidth > 300 && newWidth < window.innerWidth * 0.9) {
            chatWindow.style.width = newWidth + 'px';
        }
    } else if (currentResizer.classList.contains('resizer-tl')) {
        // Resize both (Top-Left handle)
        const rect = chatWindow.getBoundingClientRect();
        const bottom = rect.bottom;
        const right = rect.right;

        const newHeight = bottom - e.clientY;
        const newWidth = right - e.clientX;

        if (newHeight > 400 && newHeight < window.innerHeight * 0.8) {
            chatWindow.style.height = newHeight + 'px';
        }
        if (newWidth > 300 && newWidth < window.innerWidth * 0.9) {
            chatWindow.style.width = newWidth + 'px';
        }
    }
}

function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}

// Global Mouse Events for Drag
document.addEventListener('mousemove', drag);
document.addEventListener('mouseup', dragEnd);


// Send Message
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add User Message
    addMessage(message, 'user');
    chatInput.value = '';

    // Show Loading
    const loadingId = addLoadingIndicator();

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: message })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Remove Loading
        removeLoadingIndicator(loadingId);

        // Add Bot Message
        // Assuming the API returns { answer: "..." } or { response: "..." } or similar.
        // Adjust based on actual API response structure.
        const botResponse = data.answer || data.response || data.result || JSON.stringify(data);
        addMessage(botResponse, 'bot');

    } catch (error) {
        console.error('Error:', error);
        removeLoadingIndicator(loadingId);
        addMessage('Sorry, something went wrong. Please try again later.', 'bot');
    }
}

chatSendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Add Message to UI
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    if (sender === 'bot') {
        // Use marked to parse Markdown for bot messages
        messageDiv.innerHTML = marked.parse(text);
    } else {
        // Simple text for user messages to prevent XSS from user input if we were to parse it too
        // But for consistency, we can just set textContent or simple formatting.
        // Let's stick to textContent for user to be safe, or simple replacement if needed.
        // For now, let's just use innerHTML with simple replacement for user, or just text.
        // Actually, let's just use textContent for user to avoid any issues, 
        // or simple regex if they want to use bold.
        // Given the requirement is for BOT response, let's keep user simple.
        messageDiv.textContent = text;
    }

    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Loading Indicator
function addLoadingIndicator() {
    const id = 'loading-' + Date.now();
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('typing-indicator');
    loadingDiv.id = id;
    loadingDiv.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
    `;
    chatMessages.appendChild(loadingDiv);
    scrollToBottom();
    return id;
}

function removeLoadingIndicator(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
