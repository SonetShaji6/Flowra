const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User');
const { sendResponse } = require('../utils/response');

const router = express.Router();

// Configure Multer to use in-memory storage (50MB max)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Helper function to stream buffer to Cloudinary
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
};

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Protected
router.post('/image', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, 'Please upload a file');
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'flowra/images',
      resource_type: 'auto',
    });

    return sendResponse(res, 200, true, 'Image uploaded successfully', {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    return next(error);
  }
});

// @route   POST /api/upload/avatar
// @desc    Upload profile avatar to Cloudinary & update current user
// @access  Protected
router.post('/avatar', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, 'Please select an image file for avatar');
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'flowra/avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: result.secure_url },
      { new: true }
    ).select('-password');

    return sendResponse(res, 200, true, 'Avatar updated successfully', {
      url: result.secure_url,
      publicId: result.public_id,
      user,
    });
  } catch (error) {
    return next(error);
  }
});

// @route   POST /api/upload/attachment
// @desc    Upload task / project attachment (documents, designs, screenshots)
// @access  Protected
router.post('/attachment', protect, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return sendResponse(res, 400, false, 'Please upload an attachment');
    }

    const originalName = req.file.originalname || 'attachment';
    const result = await uploadBufferToCloudinary(req.file.buffer, {
      folder: 'flowra/attachments',
      resource_type: 'auto',
    });

    return sendResponse(res, 200, true, 'Attachment uploaded successfully', {
      name: originalName,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format || originalName.split('.').pop(),
      size: result.bytes,
      uploadedAt: new Date(),
    });
  } catch (error) {
    return next(error);
  }
});

// @route   DELETE /api/upload/:publicId
// @desc    Remove file from Cloudinary
// @access  Protected
router.delete('/:publicId', protect, async (req, res, next) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return sendResponse(res, 400, false, 'Public ID is required');
    }

    const decodedId = decodeURIComponent(publicId);
    const result = await cloudinary.uploader.destroy(decodedId);

    return sendResponse(res, 200, true, 'File removed successfully', result);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
