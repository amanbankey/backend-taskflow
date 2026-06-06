import Task from "../models/Task.js";

export const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id };

    if (status && ["pending", "completed"].includes(status)) query.status = status;
    if (priority && ["low", "medium", "high"].includes(priority)) query.priority = priority;
    if (search) query.title = { $regex: search, $options: "i" };

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      tasks,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Task title is required" });
    }

    const task = await Task.create({ title, description, priority, userId: req.user._id });
    res.status(201).json({ success: true, message: "Task created", task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const { title, description, status, priority } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;

    await task.save();
    res.json({ success: true, message: "Task updated", task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

export const toggleTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    task.status = task.status === "pending" ? "completed" : "pending";
    await task.save();
    res.json({ success: true, message: `Task marked as ${task.status}`, task });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [total, completed, pending, high, medium, low] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: "completed" }),
      Task.countDocuments({ userId, status: "pending" }),
      Task.countDocuments({ userId, priority: "high" }),
      Task.countDocuments({ userId, priority: "medium" }),
      Task.countDocuments({ userId, priority: "low" }),
    ]);
    res.json({ success: true, stats: { total, completed, pending, high, medium, low } });
  } catch (error) {
    next(error);
  }
};
