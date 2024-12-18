const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require("cors")
const mongoose = require("mongoose");
const File = require('./models/File');

require("dotenv").config()

const app = express();

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }))


mongoose.connect('mongodb://localhost:27017/fileUploads')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); 
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});


const upload = multer({ 
    storage ,
    limits: { fileSize: 100 * 1024 * 1024 } 
 });


app.use('/public', express.static(path.join(__dirname, 'public')));



app.post('/upload', upload.single('file'), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype;

    const newFile = new File({
        originalName: req.file.originalname,
        savedFileName: req.file.filename,
        fileUrl: fileUrl,
        fileType: fileType
    });

    await newFile.save();

    res.json(newFile)

});



app.get('/files', async (req, res) => {
    try {
        const files = await File.find().sort({ uploadedAt: -1 }); 
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve files' });
    }
});



app.get('/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'public/uploads', req.params.filename)
    res.sendFile(filePath);
});




const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
