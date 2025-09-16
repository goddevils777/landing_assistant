// Система уведомлений
function showNotification(message, type = 'error') {
    const container = document.getElementById('notificationsContainer');

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    container.appendChild(notification);

    // Автоматическое удаление через 4 секунды
    setTimeout(() => {
        removeNotification(notification);
    }, 4000);
}

function removeNotification(notification) {
    notification.classList.add('removing');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Защита от XSS
function sanitizeInput(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Плавное появление заголовка
function fadeInText() {
    const typingElement = document.getElementById('typingText');
    const textParts = [
        { text: "💎 ТОПовий підбір", class: "", delay: 100 },
        { text: "АСИСТЕНТІВ", class: "accent", delay: 1200 },
        { text: " в Україні 🇺🇦", class: "", delay: 2400 }
    ];
    
    typingElement.innerHTML = '';
    
    // Создаем полный HTML сразу, но с невидимыми элементами
    let fullHTML = '';
    textParts.forEach((part, index) => {
        if (index === 1) fullHTML += '<br>';
        if (part.class) {
            fullHTML += `<span class="${part.class}" style="opacity: 0; transform: translateY(30px); transition: all 1.2s ease-out;">${part.text}</span>`;
        } else {
            fullHTML += `<span style="opacity: 0; transform: translateY(30px); transition: all 1.2s ease-out;">${part.text}</span>`;
        }
    });
    
    typingElement.innerHTML = fullHTML;
    
    // Анимируем появление каждой части
    const spans = typingElement.querySelectorAll('span');
    spans.forEach((span, index) => {
        setTimeout(() => {
            span.style.opacity = '1';
            span.style.transform = 'translateY(0)';
        }, textParts[index].delay);
    });
    
    // Повторяем анимацию через 15 секунд
    setTimeout(() => {
        fadeInText();
    }, 15000);
}

// Простая форма контактов
let contactData = {};

// Получение элементов
const startBtn = document.getElementById('startBtn');
const quizSection = document.getElementById('quizSection');
const contactForm = document.getElementById('contactForm');

// Инициализация формы
function initContactForm() {
    startBtn.addEventListener('click', showContactForm);
    contactForm.addEventListener('submit', submitContactForm);
}

// Показ формы контактов
function showContactForm() {
    startBtn.style.display = 'none';
    quizSection.style.display = 'block';
}

// Отправка формы контактов
async function submitContactForm(e) {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const contacts = {
        telegram: formData.get('telegram')?.trim() || '',
        phone: formData.get('phone')?.trim() || '',
        email: formData.get('email')?.trim() || ''
    };
    
    // Проверяем что хотя бы одно поле заполнено
    const hasContact = contacts.telegram || contacts.phone || contacts.email;
    
    if (!hasContact) {
        showNotification('Будь ласка, заповніть хоча б один контакт для зв\'язку', 'warning');
        return;
    }
    
    // Валидация email если заполнен
    if (contacts.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacts.email)) {
        showNotification('Будь ласка, введіть коректний email', 'error');
        return;
    }
    
    // Валидация телефона если заполнен
    if (contacts.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(contacts.phone)) {
        showNotification('Будь ласка, введіть коректний номер телефону', 'error');
        return;
    }
    
    // Показываем загрузку
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Відправляємо...';
    submitBtn.disabled = true;
    
    // Формируем данные для отправки
    const contactAnswers = {};
    if (contacts.telegram) contactAnswers['Telegram'] = contacts.telegram;
    if (contacts.phone) contactAnswers['Телефон'] = contacts.phone;
    if (contacts.email) contactAnswers['Email'] = contacts.email;
    
    // Отправляем
    const success = await sendToTelegram(contactAnswers, 'landing2');
    
    if (success) {
        showNotification('Заявка успішно відправлена!', 'success');
        showSuccessMessage();
    } else {
        showNotification('Помилка відправки. Спробуйте ще раз', 'error');
        submitBtn.innerHTML = 'Відправити заявку';
        submitBtn.disabled = false;
    }
}

function showSuccessMessage() {
    quizSection.innerHTML = `
        <div class="quiz-container">
            <div class="success-message">
                <div class="success-icon">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#00ff88" stroke-width="2" fill="rgba(0,255,136,0.1)"/>
                        <path d="m9 12 2 2 4-4" stroke="#00ff88" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3>Дякуємо за заявку!</h3>
                <p>Ми зв'яжемось з Вами найближчим часом для підбору ідеального асистента.</p>
            </div>
        </div>
    `;
}

// Отправка данных в Telegram через API
async function sendToTelegram(answers, landingSource) {
    try {
        const response = await fetch('/api/send-telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answers, landingSource })
        });
        
        if (!response.ok) {
            throw new Error('Server error');
        }
        
        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('Send error:', error);
        return false;
    }
}

// Автоматическая анимация плашек
function startAutoHover() {
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length === 0) return;
    
    let currentIndex = 0;
    
    function animateCard() {
        // Убираем активный класс со всех карт
        featureCards.forEach(card => card.classList.remove('auto-hover'));
        
        // Добавляем активный класс к текущей карте
        featureCards[currentIndex].classList.add('auto-hover');
        
        // Переходим к следующей карте
        currentIndex = (currentIndex + 1) % featureCards.length;
    }
    
    // Запускаем первую анимацию сразу
    animateCard();
    
    // Повторяем каждые 5 секунд
    setInterval(animateCard, 5000);
}

// Функция остановки автоанимации при реальном наведении
function stopAutoHover() {
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.classList.remove('auto-hover');
        });
    });
}

// Функция плавной прокрутки к анкете
function scrollToForm() {
    const surveyIntro = document.querySelector('.survey-intro');
    if (surveyIntro) {
        surveyIntro.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Инициализация стрелки прокрутки
function initScrollArrow() {
    const scrollArrow = document.getElementById('scrollArrow');
    if (scrollArrow) {
        scrollArrow.addEventListener('click', scrollToForm);
    }
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        fadeInText();
    }, 100);
    initContactForm();
    initScrollArrow();
    
    // Запускаем автоанимацию плашек после появления текста
    setTimeout(() => {
        startAutoHover();
        stopAutoHover();
    }, 3000);
});