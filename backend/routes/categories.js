const express = require('express');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all categories (system defaults + user custom)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [
        { isDefault: true },
        { userId: req.user._id }
      ]
    }).sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

// Create custom category
router.post('/', async (req, res) => {
  try {
    const { name, subcategories = [], keywords = [] } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      name: name.toLowerCase(),
      $or: [
        { isDefault: true },
        { userId: req.user._id }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name,
      subcategories,
      keywords,
      userId: req.user._id,
      isDefault: false
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDefault: false // Can't edit default categories
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found or cannot be edited' });
    }

    Object.assign(category, req.body);
    await category.save();

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      isDefault: false // Can't delete default categories
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found or cannot be deleted' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Failed to delete category' });
  }
});

module.exports = router;