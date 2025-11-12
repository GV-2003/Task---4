// controllers/taskController.js
import { Task } from '../models/Task.js';
import mongoose from 'mongoose';

/**
 * GET /api/tasks
 * Supports query: ?filter=active|completed|all&page=1&limit=20&ownerId=...
 */
export const getTasks = async (req, res, next) => {
  try {
    const { filter = 'all', page = 1, limit = 50, ownerId } = req.query;
    const q = {};
    if (filter === 'active') q.completed = false;
    else if (filter === 'completed') q.completed = true;
    if (ownerId) q.ownerId = ownerId;

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const tasks = await Task.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(100, Number(limit))) // limit maximum page size
      .lean()
      .exec();
    const total = await Task.countDocuments(q);
    res.status(200).json({ total, page: Number(page), limit: Number(limit), tasks });
  } catch (err) {
    next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const task = await Task.findById(id).lean().exec();
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { text, ownerId } = req.body;
    const task = new Task({ text, ownerId });
    const saved = await task.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = {};
    if (typeof req.body.text !== 'undefined') updates.text = req.body.text;
    if (typeof req.body.completed !== 'undefined') updates.completed = !!req.body.completed;

    const updated = await Task.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).exec();

    if (!updated) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await Task.findByIdAndDelete(id).exec();
    if (!deleted) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json({ message: 'Task deleted', id: deleted._id });
  } catch (err) {
    next(err);
  }
};

/**
 * clearCompleted - example of transaction usage if multiple collections involved.
 * For single-collection deleteMany, transactions may not be necessary, but shown for demonstration.
 */
export const clearCompleted = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await Task.deleteMany({ completed: true }, { session });
    // in future, if you had archival collection, you could move docs inside the same transaction
    await session.commitTransaction();
    res.status(200).json({ removed: result.deletedCount });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};
