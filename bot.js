const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Хранилище пользователей и состояний
const users = new Map();

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Приветственное сообщение с выбором
    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: '📚 Безкоштовний урок',
                        callback_data: 'free_lesson'
                    }
                ],
                [
                    {
                        text: '👋 Про мене та підбір асистента',
                        callback_data: 'about_me'
                    }
                ]
            ]
        }
    };

    bot.sendMessage(chatId, `Привіт! 👋 
    
Ласкаво просимо на курс "Асистент Керівника" від Дарії Клименко!

Оберіть що вас цікавить:`, keyboard);

    users.set(userId, { chatId: chatId, state: 'start' });
});

// Обработка нажатий кнопок
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;

    bot.answerCallbackQuery(query.id);

    if (data === 'free_lesson') {
        startFreeLessonScenario(chatId, userId);
    } else if (data === 'about_me') {
        startAboutMeScenario(chatId, userId);
    } else if (data === 'ready_assistant') {
        sendPaymentOffer(chatId, userId);
    }
});

// Сценарий бесплатного урока
function startFreeLessonScenario(chatId, userId) {
    users.set(userId, { chatId: chatId, state: 'lesson' });

    // 1. Заголовок урока
    setTimeout(() => {
        bot.sendMessage(chatId, '📚 *Урок 1: Роль асистента в бізнесі*', { parse_mode: 'Markdown' });
    }, 1000);

    // 2. Содержание урока
    setTimeout(() => {
        const lessonContent = `🔹 *Управляє часом* — планує зустрічі, контролює дедлайни
🔹 *Фільтрує інформацію* — визначає пріоритети, готує резюме  
🔹 *Представляє компанію* — веде переговори від імені керівника
🔹 *Вирішує проблеми* — знаходить рішення до того, як вони стануть критичними

💡 *Практичне завдання:*
Складіть ідеальний розклад дня для керівника IT-компанії, враховуючи:
- 3 важливі зустрічі  
- Час на електронну пошту
- Обідню перерву
- Час для стратегічного планування`;

        bot.sendMessage(chatId, lessonContent, { parse_mode: 'Markdown' });
    }, 2000);

    // 3. Сообщение о видео
    setTimeout(() => {
        bot.sendMessage(chatId, '📹 *Відправляємо відео урок*', { parse_mode: 'Markdown' });
    }, 3000);

    // 4. Видео
    setTimeout(() => {
        bot.sendVideo(chatId, './video/1less.mp4', {
            caption: ''
        }).catch(error => {
            console.error('Error sending video:', error);
            bot.sendMessage(chatId, '📹 Відео урок буде доступний найближчим часом');
        });
    }, 4000);

    // 5. Кнопка "Готові стати асистентом"
    setTimeout(() => {
        const readyKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🎓 Готові стати професійним асистентом?',
                            callback_data: 'ready_assistant'
                        }
                    ]
                ]
            }
        };

        bot.sendMessage(chatId, 'Сподобався урок?', readyKeyboard);
    }, 5000);
}

// Сценарий "Про мене"
function startAboutMeScenario(chatId, userId) {
    users.set(userId, { chatId: chatId, state: 'about_me' });

    // 1. Приветствие
    bot.sendMessage(chatId, 'Вітання! 👋');

    // 2. Видео кружок
    setTimeout(() => {
        bot.sendVideoNote(chatId, './video/hello.mp4').catch(error => {
            console.error('Error sending video note:', error);
            bot.sendMessage(chatId, '📹 Відео привітання буде доступне найближчим часом');
        });
    }, 1000);

    // 3. Информация обо мне
    setTimeout(() => {
        bot.sendMessage(chatId, `*Клименко Дарія* 👩‍💼

Моя команда має досвід в підборі кращих асистентів вже 5 років 🔝`, { parse_mode: 'Markdown' });
    }, 2000);

    // 4. Фото и описание
    setTimeout(() => {
        // Отправляем фото (замените на актуальный путь к фото)
        bot.sendPhoto(chatId, './images/people.png', {
            caption: '*Делегуйте свої задачі кращому асистенту та розвивайте Ваш бізнес без зайвих турбот!* 🚀',
            parse_mode: 'Markdown'
        }).catch(error => {
            console.error('Error sending photo:', error);
            bot.sendMessage(chatId, '*Делегуйте свої задачі кращому асистенту та розвивайте Ваш бізнес без зайвих турбот!* 🚀', { parse_mode: 'Markdown' });
        });
    }, 3000);

    // 5. Форма связи
    setTimeout(() => {
        bot.sendMessage(chatId, `📝 *Форма зв'язку*

Залиште свої контакти і ми зв'яжемось з Вами:

Напишіть у форматі:
👤 Ім'я:
📱 Телефон/Telegram:
💬 Як зручніше зв'язатись:`, { parse_mode: 'Markdown' });
    }, 4000);
}

// Предложение об оплате
const paymentOffer = `🎓 *Готові стати професійним асистентом?*

Оберіть найкращий варіант для себе:

📚 *КУРС "АСИСТЕНТ КЕРІВНИКА"* - 250$
- 7 модулів професійної підготовки
- Сертифікат про проходження
- Персональні консультації з Дарією
- Підтримка протягом 3 місяців

🎯 *ПІДБІР АСИСТЕНТА З ГАРАНТІЄЮ* - 350$
- Індивідуальний відбір кандидатів
- Перевірка досвіду та рекомендацій
- Гарантія заміни протягом місяця
- Супровід на перші тижні роботи

💼 *КАР'ЄРНА КОНСУЛЬТАЦІЯ* - 50$
- Аналіз вашого резюме
- Поради щодо розвитку кар'єри
- Планування професійного зростання
- Індивідуальна стратегія пошуку роботи

💰 *Усі ціни фіксовані, без прихованих платежів*`;

function sendPaymentOffer(chatId, userId) {
    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: '📚 Курс - 250$',
                    url: 'https://revolut.me/dariiapcx7/usd250/курс-асистент-керівника'
                }
            ],
            [
                {
                    text: '🎯 Підбір асистента з гарантією - 350$',
                    url: 'https://revolut.me/dariiapcx7/usd350/підбір-асистента-гарантія'
                }
            ],
            [
                {
                    text: '💼 Кар\'єрна консультація - 50$',
                    url: 'https://revolut.me/dariiapcx7/usd50/карєрна-консультація'
                }
            ],
            [
                {
                    text: '📞 Зв\'язатись з Дарією',
                    url: 'https://t.me/klymenkodariia'
                }
            ]
        ]
    };

    bot.sendMessage(chatId, paymentOffer, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

// Обработка сообщений
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Пропускаем команды
    if (msg.text && msg.text.startsWith('/')) return;

    const user = users.get(userId);

    if (user && user.state === 'lesson') {
        // Ответ на выполненное задание из урока
        if (msg.text && msg.text.length > 50) {
            bot.sendMessage(chatId, `Дякую за виконання завдання! 👏

Ваш підхід до планування показує розуміння основ роботи асистента.

Щоб отримати детальний розбір вашого завдання та продовжити навчання, переходьте до повного курсу! 🚀`);
        }
    } else if (user && user.state === 'about_me') {
        // Обработка формы связи
        if (msg.text && msg.text.length > 10) {
            bot.sendMessage(chatId, `Дякую за контакти! 📝

Ми зв'яжемось з Вами найближчим часом для обговорення підбору ідеального асистента для Вашого бізнесу.

Очікуйте дзвінок протягом 24 годин! 📞`);

            // Отправляем заявку админу
            const adminMessage = `🔔 НОВА ЗАЯВКА: ПІДБІР АСИСТЕНТА

👤 Користувач: @${msg.from.username || 'невідомо'}
🆔 ID: ${msg.from.id}
📝 Контакти:
${msg.text}

🕒 ${new Date().toLocaleString('uk-UA')}`;

            bot.sendMessage(process.env.TELEGRAM_CHAT_ID, adminMessage).catch(error => {
                console.error('Error sending to admin:', error);
            });

            console.log('Новая заявка на подбор ассистента отправлена админу');
        }
    }
});

// Установка постоянного меню
bot.setMyCommands([
    { command: 'start', description: '🏠 Головне меню' },
    { command: 'lesson', description: '📚 Безкоштовний урок' },
    { command: 'about', description: '👋 Про мене та підбір' }
]);

// Обработка дополнительных команд
bot.onText(/\/lesson/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    startFreeLessonScenario(chatId, userId);
});

bot.onText(/\/about/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    startAboutMeScenario(chatId, userId);
});

console.log('🤖 Telegram bot started');