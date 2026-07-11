document.addEventListener('DOMContentLoaded', () => {
    const messageForm = document.getElementById('message-form');
    const messagesContainer = document.getElementById('messages-container');
    const submitBtn = document.getElementById('submit-btn');
    const submitLoader = document.getElementById('submit-loader');
    const btnText = submitBtn.querySelector('span');
    const messagesLoader = document.getElementById('messages-loader');

    // Fetch and render messages on load
    fetchMessages();

    // Handle form submission
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const messageInput = document.getElementById('message');
        
        const name = nameInput.value.trim();
        const message = messageInput.value.trim();
        
        if (!name || !message) return;
        
        // Show loading state
        btnText.style.display = 'none';
        submitLoader.style.display = 'block';
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, message })
            });

            if (response.ok) {
                // Clear form and refresh messages
                nameInput.value = '';
                messageInput.value = '';
                await fetchMessages();
            } else {
                console.error('Failed to post message');
            }
        } catch (error) {
            console.error('Error posting message:', error);
        } finally {
            // Restore button state
            btnText.style.display = 'inline';
            submitLoader.style.display = 'none';
            submitBtn.disabled = false;
        }
    });

    async function fetchMessages() {
        try {
            const response = await fetch('/api/messages');
            const messages = await response.json();
            
            renderMessages(messages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            if (messagesLoader) {
                messagesContainer.innerHTML = '<p style="color: #ef4444; text-align: center;">Failed to load messages. Is the server running?</p>';
            }
        }
    }

    function renderMessages(messages) {
        messagesContainer.innerHTML = '';
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); margin-top: 1rem;">No entries yet. Be the first!</p>';
            return;
        }

        messages.forEach(msg => {
            const date = new Date(msg.timestamp + 'Z'); // SQLite timestamp is UTC
            const formattedDate = date.toLocaleString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit'
            });

            const card = document.createElement('div');
            card.className = 'message-card';
            
            card.innerHTML = `
                <div class="message-header">
                    <span class="message-name">${escapeHTML(msg.name)}</span>
                    <span class="message-time">${formattedDate}</span>
                </div>
                <div class="message-content">${escapeHTML(msg.message)}</div>
            `;
            
            messagesContainer.appendChild(card);
        });
    }

    // Basic HTML escaping to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }
});
