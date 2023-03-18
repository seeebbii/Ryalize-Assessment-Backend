import express from 'express'
const todoController = require('../controllers/todo/todo.controller');
import Token from "../service/token";

const router = express.Router();

router.get('/', Token.verifyToken, todoController.getAll);
router.get('/:id', Token.verifyToken, todoController.getById);
router.post('/create', Token.verifyToken, todoController.create);
router.post('/update/:id', Token.verifyToken, todoController.update);
router.post('/delete/:id', Token.verifyToken, todoController.delete);

export default router;