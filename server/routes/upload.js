import express from 'express';
import { upload } from '../config/cloudinary.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload multiple images to Cloudinary
// @access  Private
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    // Extract image URLs from uploaded files
    const imageUrls = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: imageUrls
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading images', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/upload/:publicId
// @desc    Delete image from Cloudinary
// @access  Private
router.delete('/:publicId', authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const { deleteImage } = await import('../config/cloudinary.js');
    const result = await deleteImage(publicId);

    res.status(200).json({
      message: 'Image deleted successfully',
      result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      message: 'Error deleting image', 
      error: error.message 
    });
  }
});

export default router;
