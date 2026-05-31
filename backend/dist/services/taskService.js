"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTasks = getAllTasks;
exports.getTaskById = getTaskById;
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
const crypto_1 = require("crypto");
const database_js_1 = require("../db/database.js");
function rowToTask(row) {
    return {
        id: row.id,
        title: row.title,
        completed: row.completed === 1,
        createdAt: row.created_at,
    };
}
function getAllTasks() {
    const db = (0, database_js_1.getDb)();
    const stmt = db.prepare('SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC');
    return stmt.all().map(rowToTask);
}
function getTaskById(id) {
    const db = (0, database_js_1.getDb)();
    const stmt = db.prepare('SELECT id, title, completed, created_at FROM tasks WHERE id = ?');
    const row = stmt.get(id);
    return row ? rowToTask(row) : null;
}
function createTask(input) {
    const db = (0, database_js_1.getDb)();
    const id = (0, crypto_1.randomUUID)();
    const createdAt = new Date().toISOString();
    const trimmedTitle = input.title.trim();
    const stmt = db.prepare('INSERT INTO tasks (id, title, completed, created_at) VALUES (?, ?, ?, ?)');
    stmt.run(id, trimmedTitle, 0, createdAt);
    return {
        id,
        title: trimmedTitle,
        completed: false,
        createdAt,
    };
}
function updateTask(id, input) {
    const db = (0, database_js_1.getDb)();
    const existing = getTaskById(id);
    if (!existing) {
        return null;
    }
    const newTitle = input.title !== undefined ? input.title.trim() : existing.title;
    const newCompleted = input.completed !== undefined ? (input.completed ? 1 : 0) : (existing.completed ? 1 : 0);
    const stmt = db.prepare('UPDATE tasks SET title = ?, completed = ? WHERE id = ?');
    stmt.run(newTitle, newCompleted, id);
    return {
        id,
        title: newTitle,
        completed: newCompleted === 1,
        createdAt: existing.createdAt,
    };
}
function deleteTask(id) {
    const db = (0, database_js_1.getDb)();
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
}
//# sourceMappingURL=taskService.js.map