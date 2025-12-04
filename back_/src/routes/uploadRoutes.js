
import express from 'express';
import upload from '../middleware/upload.js';

export const uploadRouter = express.Router();

uploadRouter.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    res.status(200).json({ url: `/uploads/${req.file.filename}` });
});
