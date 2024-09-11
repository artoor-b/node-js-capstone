import express from "express";
import { getOne, createOne, createExercise, getLogs } from "../controllers/users.controller.js";

const router = express.Router();

router.get(['/users', '/users/:id'], getOne);
router.post('/users', createOne);
router.post('/users/:_id/exercises', createExercise);
router.get('/users/:_id/logs', getLogs);

export default router;