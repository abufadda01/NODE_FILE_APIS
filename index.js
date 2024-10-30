const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }))


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


app.post('/upload', upload.single('file'), (req, res) => {

    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a file' });
    }


    const fileUrl = `${req.protocol}://${req.get('host')}/public/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype

    res.json({ 
        message: 'File uploaded successfully', 
        fileUrl,
        originalName: req.file.originalname, 
        savedFileName: req.file.filename ,         
        fileType
    });

});


app.get('/files/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'public/uploads', req.params.filename);
    res.sendFile(filePath);
});




const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
