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
        { text: "👨‍💻Професійна підготовка", class: "", delay: 100 },
        { text: "АСИСТЕНТІВ", class: "accent", delay: 1200 },
        { text: " від Дарії Клименко", class: "", delay: 2400 }
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

// Данные вопросов
const questions = [
    {
        main: "Чи маєте Ви досвід роботи асистентом?",
        subtitle: "Якщо так - опишіть будь ласка, якщо ні - який проф досвід маєте"
    },
    {
        main: "Чи працюєте Ви зараз?",
        subtitle: ""
    },
    {
        main: "На який дохід хотіли би вийти опанувавши професію асистента",
        subtitle: ""
    },
    {
        main: "Ваше ім'я та вік",
        subtitle: ""
    },
    {
        main: "Email адреса",
        subtitle: ""
    },
    {
        main: "Ваш Telegram",
        subtitle: ""
    },
    {
        main: "Номер телефону",
        subtitle: ""
    }
];

const formFields = ['experience', 'currently_working', 'desired_income', 'name_age', 'email', 'telegram', 'phone'];

let currentQuestionIndex = 0;
let userAnswers = {};

// Получение элементов
const startBtn = document.getElementById('startBtn');
const quizSection = document.getElementById('quizSection');
const quizContent = document.getElementById('quizContent');
const formData = document.getElementById('formData');
const currentStepSpan = document.getElementById('currentStep');
const totalStepsSpan = document.getElementById('totalSteps');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const quizForm = document.getElementById('quizForm');

// Инициализация
function initQuiz() {
    totalStepsSpan.textContent = questions.length;
    startBtn.addEventListener('click', startQuiz);
    nextBtn.addEventListener('click', nextQuestion);
    prevBtn.addEventListener('click', prevQuestion);
    quizForm.addEventListener('submit', submitForm);
}

// Старт квиза
function startQuiz() {
    startBtn.style.display = 'none';
    quizSection.style.display = 'block';
    formData.classList.add('show-field');
    showQuestion(0);
}

// Показ вопроса
function showQuestion(index) {
    currentQuestionIndex = index;
    currentStepSpan.textContent = index + 1;
    
    // Показать вопрос
    const question = questions[index];
    let questionHTML = `<h3>${question.main}</h3>`;
    if (question.subtitle) {
        questionHTML += `<p class="question-subtitle">${question.subtitle}</p>`;
    }
    quizContent.innerHTML = questionHTML;
    
    // Скрыть все поля и отключить required для скрытых
    const allFields = formData.querySelectorAll('input, textarea');
    allFields.forEach(field => {
        field.classList.remove('active');
        field.disabled = true;
        field.removeEventListener('keypress', handleKeyPress);
    });
    
    // Показать текущее поле и включить его
    const currentField = formData.querySelector(`[name="${formFields[index]}"]`);
    if (currentField) {
        currentField.classList.add('active');
        currentField.disabled = false;
        currentField.addEventListener('keypress', handleKeyPress);
        currentField.focus();
    }
    
    // Управление кнопками
    prevBtn.style.display = index > 0 ? 'block' : 'none';
    nextBtn.style.display = index < questions.length - 1 ? 'block' : 'none';
    submitBtn.style.display = index === questions.length - 1 ? 'block' : 'none';
}

// Следующий вопрос
function nextQuestion() {
    const currentField = formData.querySelector(`[name="${formFields[currentQuestionIndex]}"]`);
    
    // Валидация
    if (!currentField.value.trim()) {
        showNotification('Будь ласка, заповніть це поле', 'warning');
        currentField.focus();
        return;
    }
    
    // Дополнительная валидация email
    if (formFields[currentQuestionIndex] === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(currentField.value)) {
            showNotification('Будь ласка, введіть коректний email', 'error');
            currentField.focus();
            return;
        }
    }
    
    // Валидация телефона
    if (formFields[currentQuestionIndex] === 'phone') {
        const phoneValue = currentField.value.trim();
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phoneValue)) {
            showNotification('Будь ласка, введіть коректний номер телефону', 'error');
            currentField.focus();
            return;
        }
    }
    
    // Сохраняем ответ
    const questionText = questions[currentQuestionIndex].main;
    userAnswers[questionText] = sanitizeInput(currentField.value.trim());
    
    if (currentQuestionIndex < questions.length - 1) {
        showQuestion(currentQuestionIndex + 1);
    }
}

// Блокировка Enter для преждевременной отправки
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        
        // Если это последний вопрос, можно отправить
        if (currentQuestionIndex === questions.length - 1) {
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn.style.display !== 'none') {
                submitForm(event);
            }
        } else {
            // Иначе переходим к следующему вопросу
            nextQuestion();
        }
    }
}

// Предыдущий вопрос
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        showQuestion(currentQuestionIndex - 1);
    }
}

// Отправка формы
async function submitForm(e) {
    e.preventDefault();
    
    const currentField = formData.querySelector(`[name="${formFields[currentQuestionIndex]}"]`);
    if (!currentField.value.trim()) {
        showNotification('Будь ласка, заповніть це поле', 'warning');
        currentField.focus();
        return;
    }
    
    // Финальная валидация последнего поля
    if (formFields[currentQuestionIndex] === 'phone') {
        const phoneValue = currentField.value.trim();
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phoneValue)) {
            showNotification('Будь ласка, введіть коректний номер телефону', 'error');
            currentField.focus();
            return;
        }
    }
    
    // Сохраняем последний ответ
    const questionText = questions[currentQuestionIndex].main;
    userAnswers[questionText] = sanitizeInput(currentField.value.trim());
    
    // Определяем источник по URL
    const landingSource = window.location.pathname.includes('landing1') ? 'landing1' : 'landing2';
    
    // Показываем загрузку
    quizContent.innerHTML = `
        <div style="text-align: center; padding: 30px 20px;">
            <div class="loading-spinner"></div>
            <p style="margin-top: 15px; color: white;">Відправляємо вашу заявку...</p>
        </div>
    `;
    
    formData.style.display = 'none';
    document.querySelector('.quiz-buttons').style.display = 'none';
    
    // Отправляем в Telegram с указанием источника
    const success = await sendToTelegram(userAnswers, landingSource);
    
    if (success) {
        showNotification('Заявка успішно відправлена!', 'success');
        showSuccessMessage();
    } else {
        showNotification('Помилка відправки. Спробуйте ще раз', 'error');
        // Возвращаем форму
        formData.style.display = 'block';
        document.querySelector('.quiz-buttons').style.display = 'flex';
        showQuestion(currentQuestionIndex);
    }
    
    console.log('All user answers:', userAnswers);
}

function showSuccessMessage() {
    quizContent.innerHTML = `
        <div class="success-message">
            <div class="success-icon">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#00ff88" stroke-width="2" fill="rgba(0,255,136,0.1)"/>
                    <path d="m9 12 2 2 4-4" stroke="#00ff88" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
            <h3>Дякуємо за заявку!</h3>
                        <a href="https://t.me/proassistant_course_bot" target="_blank" class="bot-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.09-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="currentColor"/>
                </svg>
                Пройти перший урок прямо зараз
            </a>
            <p>Ваша анкета успішно відправлена.<br>Ми зв'яжемось з Вами протягом 24 годин для обговорення деталей навчання.</p>
            <div class="success-note">
                <strong>Що далі?</strong><br>
                Дарія особисто розгляне Вашу заявку та запропонує індивідуальний план навчання
            </div>
        </div>
    `;

    document.querySelector('.progress-bar').style.display = 'none';
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
    initQuiz();
    initScrollArrow();
    
    // Запускаем автоанимацию плашек после появления текста
    setTimeout(() => {
        startAutoHover();
        stopAutoHover();
    }, 3000);
});