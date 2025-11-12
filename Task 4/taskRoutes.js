// routes/taskRoutes.js
import express from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  clearCompleted
} from '../controllers/taskController.js';

const router = express.Router();

const validateTaskPayload = [
  body('text')
    .optional({ nullable: false })
    .isString().withMessage('text must be a string')
    .trim()
    .notEmpty().withMessage('text cannot be empty')
    .isLength({ max: 140 }).withMessage('max length 140 chars')
];

// CRUD
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', validateTaskPayload, createTask);
router.put('/:id', validateTaskPayload, updateTask);
router.delete('/:id', deleteTask);

// Extra
router.delete('/', clearCompleted); // delete completed tasks endpoint (careful: protected in prod)

export default router;
