/**
 * AI Daily - Основен JavaScript файл
 * Версия: Професионална интеграция с Vercel API
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Мобилно Меню ---
    const menuBtn = document.querySelector('.menu-toggle');
    const navUl = document.querySelector('nav ul');
    
    if(menuBtn) {
        menuBtn.addEventListener('click', () => {
            navUl.classList.toggle('showing');
            menuBtn.classList.toggle('is-active');
        });
    }

    // --- 2. Чат Бот Логика (Vercel Serverless версия) ---
    const chatInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatWindow = document.getElementById('chat-window');

    // ЗАБЕЛЕЖКА: Ключът вече НЕ е тук. Той е скрит в настройките на Vercel.

    if (chatInput && sendBtn && chatWindow) {
        
        /**
         * Добавя балонче със съобщение в чат прозореца
         */
        function addMsg(text, sender) {
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message', sender + '-message');
            
            const bubble = document.createElement('div');
            bubble.classList.add(sender + '-bubble');
            bubble.textContent = text;
            
            msgDiv.appendChild(bubble);
            chatWindow.appendChild(msgDiv);
            
            // Автоматично скролване до най-новото съобщение
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }

        /**
         * Изпраща съобщението до нашата сървърна функция във Vercel
         */
        async function getClaudeResponse(userMessage) {
            // Създаваме индикатор за зареждане ("...")
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('message', 'bot-message');
            loadingDiv.innerHTML = '<div class="bot-bubble">...</div>'; 
            loadingDiv.id = 'loading-bubble';
            chatWindow.appendChild(loadingDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;

            try {
                // Извикваме нашия собствен API маршрут /api/chat
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: userMessage })
                });

                const data = await response.json();

                // Премахваме индикатора за зареждане
                const loadingBubble = document.getElementById('loading-bubble');
                if(loadingBubble) loadingBubble.remove();

                // Проверка за грешки в отговора от сървъра
                if (data.error) {
                    console.error('Сървърна грешка:', data.error);
                    addMsg("Грешка: " + (data.error.message || "Неуспешна комуникация с AI"), 'bot');
                } else if (data.content && data.content.length > 0) {
                    // Показваме отговора от Claude
                    addMsg(data.content[0].text, 'bot');
                } else {
                    addMsg("Ботът не върна съдържание. Проверете логовете във Vercel.", 'bot');
                }

            } catch (error) {
                // Махаме индикатора при грешка в мрежата
                const loadingBubble = document.getElementById('loading-bubble');
                if(loadingBubble) loadingBubble.remove();
                
                console.error('Грешка при fetch:', error);
                addMsg("Възникна грешка при връзката със сървъра. Уверете се, че сайтът е качен във Vercel.", 'bot');
            }
        }

        /**
         * Слушател за клик върху бутона за изпращане
         */
        sendBtn.addEventListener('click', () => {
            const text = chatInput.value.trim();
            
            if (text) {
                addMsg(text, 'user');
                chatInput.value = ''; // Изчистване на полето за въвеждане
                getClaudeResponse(text);
            }
        });

        /**
         * Слушател за натискане на клавиша Enter
         */
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });
    }
    
    // --- 3. Контактна форма ---
    const form = document.querySelector('form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Благодарим ви! Вашето съобщение беше изпратено успешно.");
            form.reset();
        });
    }
});
