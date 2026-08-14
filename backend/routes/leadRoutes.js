const express = require("express");
const router = express.Router();
const {
  createLead,
  getLeads,
  getAnalytics,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
  deleteNote,
} = require("../controllers/leadController");
const { protect } = require("../middleware/authMiddleware");

// Public: this is the endpoint a website's contact form would POST to
router.post("/", createLead);

// Everything below is admin-only
router.get("/", protect, getLeads);
router.get("/analytics", protect, getAnalytics);
router.get("/:id", protect, getLeadById);
router.put("/:id", protect, updateLead);
router.delete("/:id", protect, deleteLead);
router.post("/:id/notes", protect, addNote);
router.delete("/:id/notes/:noteId", protect, deleteNote);

module.exports = router;
