import express from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  getStats,
} from "../controllers/taskController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/stats", getStats);
router.route("/").get(getTasks).post(createTask);
router.route("/:id").put(updateTask).delete(deleteTask);
router.patch("/:id/toggle", toggleTask);

export default router;
