
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Мобилно Меню (Запазено) ---
    const menuBtn = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('nav ul');
    
    if(menuBtn) {
        menuBtn.addEventListener('click', () => {
            navUl.classList.toggle('showing');
            menuBtn.classList.toggle('is-active');
        });
    }

    // --- 2. Чат Бот с CLAUDE API (Anthropic) ---
    const chatInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatWindow = document.getElementById('chat-window');

    // ВАЖНО: Тук слагаш твоя ключ от console.anthropic.com
    // Той започва с "sk-ant-..."
    const ANTHROPIC_API_KEY = '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';

    if (chatInput && sendBtn && chatWindow) {
        
        // Функция за добавяне на съобщение в екрана
        function addMsg(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message', sender + '-message');
            
            const bubble = document.createElement('div');
            bubble.classList.add(sender + '-bubble');
            bubble.textContent = text;
            
            msgDiv.appendChild(bubble);
            chatWindow.appendChild(msgDiv);
            
            // Скролваме автоматично най-долу
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }

        // Асинхронна функция за връзка с Claude
        async function getClaudeResponse(userMessage) {
            // Показваме, че ботът "мисли"...
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'bot-message');
            loadingDiv.innerHTML = '<div class="bot-bubble">...</div>'; 
            loadingDiv.id = 'loading-bubble';
            chatWindow.appendChild(loadingDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;

            try {
                // Изпращаме заявка към сървърите на Anthropic
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'x-api-key': ANTHROPIC_API_KEY,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json',
                        // ТОЗИ РЕД Е ЗАДЪЛЖИТЕЛЕН, когато се ползва директно от браузър (script.js)
                        'anthropic-dangerous-direct-browser-access': 'true'
                    },
                    body: JSON.stringify({
                        model: "claude-3-sonnet-20240229", // Използваме модела Sonnet (бърз и умен)
                        max_tokens: 1024,
                        messages: [
                            { role: "user", content: userMessage }
                        ]
                    })
                });

                const data = await response.json();

                // Махаме балончето "..."
                const loadingBubble = document.getElementById('loading-bubble');
                if(loadingBubble) loadingBubble.remove();

                // Проверяваме за грешки от API-то
                if (data.error) {
                    console.error('API Error:', data.error);
                    addMsg("Грешка: " + data.error.message, 'bot');
                    return;
                }

                // Взимаме отговора (структурата на Claude е малко по-различна от OpenAI)
                if (data.content && data.content.length > 0) {
                    const aiReply = data.content[0].text;
                    addMsg(aiReply, 'bot');
                }

            } catch (error) {
                // Ако няма интернет или ключът е грешен
                const loadingBubble = document.getElementById('loading-bubble');
                if(loadingBubble) loadingBubble.remove();
                
                console.error('Fetch error:', error);
                addMsg("Грешка при връзката! Проверете конзолата (F12) за детайли.", 'bot');
            }
        }

        // Обработка на клик върху бутона "Изпрати"
        sendBtn.addEventListener('click', () => {
            const text = chatInput.value.trim();
            
            if (text) {
                // 1. Показваме твоето съобщение
                addMsg(text, 'user');
                chatInput.value = ''; // Чистим полето
                
                // 2. Проверка за API ключ
                if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.includes('ТУК_СЛОЖИ')) {
                    setTimeout(() => {
                        addMsg("Липсва API ключ! Моля, добавете го в script.js.", 'bot');
                    }, 500);
                } else {
                    // 3. Викаме Claude
                    getClaudeResponse(text);
                }
            }
        });

        // Изпращане с Enter
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendBtn.click();
        });
    }
    
    // --- 3. Контактна форма (Запазена) ---
    const form = document.querySelector('form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Благодарим ви! Вашето съобщение беше изпратено.");
            form.reset();
        });
    }

});
