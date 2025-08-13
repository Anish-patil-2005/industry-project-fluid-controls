import { Router } from "express";
import { isAuth, isAdmin, isSupervisor, isOperator } from "../middlewares/isAuth.middlewares.js";
import { assignTask, createTask, deleteTask, editTask, getTask, updateStatus } from "../controllers/task.controllers.js";

const router = Router();

// Supervisor routes
router.post('/create', isAuth, isSupervisor, createTask);
router.put('/:id/assign', isAuth, isSupervisor, assignTask);
router.put('/:id/update', isAuth, isSupervisor, editTask);
router.delete('/:id/delete', isAuth, isSupervisor, deleteTask);

router.get('/:id/getMyTask',isAuth, getTask);

// Operator routes
router.put('/:id/status', isAuth, isOperator, updateStatus);

export default router;
