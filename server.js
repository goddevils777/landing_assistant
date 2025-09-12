const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Дебаг информация
console.log('📂 Текущая директория:', __dirname);
console.log('🔧 Проверка конфигурации:');
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Есть' : '❌ Нет');
console.log('TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? '✅ Есть' : '❌ Нет');

// Middleware
app.use(cors());
app.use(express.json());

// Статические файлы для корневой директории (main.css, favicon.svg, images)
app.use('/main.css', express.static(path.join(__dirname, 'main.css')));
app.use('/favicon.svg', express.static(path.join(__dirname, 'favicon.svg')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Статические файлы для landing1
app.use('/landing1', express.static(path.join(__dirname, 'landing1')));

// Статические файлы для landing2
app.use('/landing2', express.static(path.join(__dirname, 'landing2')));

// Функция отправки сообщения в Telegram
async function sendTelegramMessage(chatId, message, parseMode = 'Markdown') {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    console.log('📤 Отправляем в Telegram:', chatId);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: parseMode
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('❌ Telegram API error:', result);
            
            // Если ошибка с Markdown, попробуем без форматирования
            if (result.error_code === 400 && parseMode !== 'HTML') {
                console.log('🔄 Повторная попытка без Markdown...');
                return await sendTelegramMessage(chatId, message.replace(/[*_`\[\]()~>#+=|{}.!-]/g, ''), null);
            }
            return false;
        }
        
        console.log('✅ Сообщение отправлено успешно');
        return true;
    } catch (error) {
        console.error('❌ Network error:', error);
        return false;
    }
}

// API endpoint для отправки в Telegram
app.post('/api/send-telegram', async (req, res) => {
    console.log('📨 Получена заявка:', req.body);
    
    try {
        const { answers, landingSource } = req.body;
        
        if (!answers) {
            console.error('❌ Нет данных answers');
            return res.status(400).json({ error: 'Нет данных заявки' });
        }
        
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            console.error('❌ Нет TELEGRAM_BOT_TOKEN');
            return res.status(500).json({ error: 'Не настроен токен бота' });
        }
        
        if (!process.env.TELEGRAM_CHAT_ID) {
            console.error('❌ Нет TELEGRAM_CHAT_ID');
            return res.status(500).json({ error: 'Не настроен chat ID' });
        }

        // Определяем источник заявки
        const sourceText = landingSource === 'landing1' ? 'ПОШУК АСИСТЕНТА' : 
                          landingSource === 'landing2' ? 'ПІДБІР АСИСТЕНТІВ' : 'НЕВІДОМО';
        
        // Формируем сообщение в зависимости от типа лендинга
        let adminMessage = '';
        
        if (landingSource === 'landing1') {
            // Полная анкета для landing1
            adminMessage = `🔔 НОВА ЗАЯВКА: ${sourceText}

👤 ${answers['Ваше ім\'я та вік'] || 'Не вказано'}
📧 ${answers['Email адреса'] || 'Не вказано'}
📱 @${answers['Ваш Telegram']?.replace('@', '') || 'Не вказано'}
📞 ${answers['Номер телефону'] || 'Не вказано'}

💼 Досвід асистента:
${answers['Чи маєте Ви досвід роботи асистентом?'] || 'Не вказано'}

🏢 Зараз працює:
${answers['Чи працюєте Ви зараз?'] || 'Не вказано'}

💰 Бажана зарплата:
${answers['На який дохід хотіли би вийти опанувавши професію асистента'] || 'Не вказано'}

🕒 ${new Date().toLocaleString('uk-UA')}`;
        } else {
            // Простые контакты для landing2
            const contacts = [];
            if (answers['Telegram']) contacts.push(`📱 @${answers['Telegram'].replace('@', '')}`);
            if (answers['Телефон']) contacts.push(`📞 ${answers['Телефон']}`);
            if (answers['Email']) contacts.push(`📧 ${answers['Email']}`);
            
            adminMessage = `🔔 НОВА ЗАЯВКА: ${sourceText}

${contacts.join('\n')}

💼 Потребує підбір асистента для бізнесу

🕒 ${new Date().toLocaleString('uk-UA')}`;
        }

        console.log('📝 Источник заявки:', sourceText);
        console.log('📝 Формуем сообщение длиной:', adminMessage.length);
        
        // Отправляем админу
        const sent = await sendTelegramMessage(process.env.TELEGRAM_CHAT_ID, adminMessage);
        
        if (sent) {
            console.log('✅ Сообщение успешно отправлено');
            res.json({ success: true, message: 'Заявка успішно відправлена!' });
        } else {
            console.log('❌ Не удалось отправить сообщение');
            res.status(500).json({ error: 'Помилка відправки повідомлення' });
        }
        
    } catch (error) {
        console.error('❌ Критическая ошибка:', error);
        res.status(500).json({ error: 'Внутрішня помилка сервера: ' + error.message });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        telegram_configured: !!process.env.TELEGRAM_BOT_TOKEN,
        chat_id_configured: !!process.env.TELEGRAM_CHAT_ID
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📄 Main page: http://localhost:${PORT}`);
    console.log(`📄 Landing 1: http://localhost:${PORT}/landing1/`);
    console.log(`📄 Landing 2: http://localhost:${PORT}/landing2/`);
    
    // Проверяем доступность Telegram API
    if (process.env.TELEGRAM_BOT_TOKEN) {
        fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`)
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    console.log(`🤖 Бот подключен: ${data.result.first_name}`);
                } else {
                    console.error('❌ Проблема с ботом:', data);
                }
            })
            .catch(err => console.error('❌ Не удалось проверить бота:', err.message));
    }
});