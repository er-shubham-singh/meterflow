import express from 'express';
import { employeeController } from '../controllers/employeeController.js';

const router = express.Router();

router.get('/', employeeController.listEmployees);
router.post('/', employeeController.createEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;
