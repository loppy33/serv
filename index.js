const express = require('express');
const cors = require('cors');
const multer = require('multer');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const TOKEN = '6611194889:AAEv8pRkPS_xGcvVOlX6tPJ3I22v9MKtB8c';
const userID = 5926461080
const bot = new TelegramBot(TOKEN, { polling: false });

// Настройка multer для обработки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); // Папка, куда сохранять файлы
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

app.post('/wheel/send', upload.array('images', 3), async (req, res) => {
    const email = req.body.email;
    const prize = req.body.prize;
    const images = req.files;

    try {
        // Создаем массив для хранения идентификаторов загруженных фотографий
        const photoIds = [];

        // Отправляем каждую фотографию отдельным сообщением
        images.forEach(async (image) => {
            const imageFilePath = `./uploads/${image.filename}`;
            photoIds.push({ type: 'photo', media: imageFilePath }); // Сохраняем идентификаторы отправленных фотографий
        });

        // Отправляем сообщение с информацией о призе, email и альбомом фотографий
        await bot.sendMessage(userID, `Prize: ${prize}\nEmail: ${email}`);
        await bot.sendMediaGroup(userID, photoIds, { caption: `Prize: ${prize}\nEmail: ${email}` });
    } catch (error) {
        console.error('Error sending Telegram message:', error);
    }

    // Ответ на запрос
    res.status(200).send('Success');
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log('Server started: http://localhost:' + PORT);
});