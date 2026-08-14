const Lead = require("../models/Lead");

// @route POST /api/leads
// @desc  Create a new lead (this is the endpoint a public contact form would call)
// @access Public
const createLead = async (req, res) => {
  try {
    const { name, email, phone, source, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const lead = await Lead.create({ name, email, phone, source, message });
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/leads
// @desc  Get all leads, with optional search/filter/sort
//        ?status=new&source=Website&search=john&sortBy=createdAt&order=desc
// @access Private (admin)
const getLeads = async (req, res) => {
  try {
    const { status, source, search, sortBy = "createdAt", order = "desc" } = req.query;

    const query = {};
    if (status) query.status = status;
    if (source) query.source = source;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(query).sort({ [sortBy]: order === "asc" ? 1 : -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/leads/analytics
// @desc  Basic analytics: total leads + counts per status
// @access Private (admin)
const getAnalytics = async (req, res) => {
  try {
    const total = await Lead.countDocuments();
    const statusCounts = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts = { new: 0, contacted: 0, converted: 0, lost: 0 };
    statusCounts.forEach((s) => {
      counts[s._id] = s.count;
    });

    const conversionRate = total > 0 ? ((counts.converted / total) * 100).toFixed(1) : "0.0";

    res.json({ total, ...counts, conversionRate });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/leads/:id
// @access Private (admin)
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PUT /api/leads/:id
// @desc  Update lead details / status
// @access Private (admin)
const updateLead = async (req, res) => {
  try {
    const { name, email, phone, source, message, status } = req.body;

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (name !== undefined) lead.name = name;
    if (email !== undefined) lead.email = email;
    if (phone !== undefined) lead.phone = phone;
    if (source !== undefined) lead.source = source;
    if (message !== undefined) lead.message = message;
    if (status !== undefined) lead.status = status;

    const updated = await lead.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route DELETE /api/leads/:id
// @access Private (admin)
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    await lead.deleteOne();
    res.json({ message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/leads/:id/notes
// @desc  Add a follow-up note to a lead
// @access Private (admin)
const addNote = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Note text is required" });

    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.notes.push({ text });
    await lead.save();

    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route DELETE /api/leads/:id/notes/:noteId
// @access Private (admin)
const deleteNote = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.notes = lead.notes.filter((n) => n._id.toString() !== req.params.noteId);
    await lead.save();

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createLead,
  getLeads,
  getAnalytics,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
  deleteNote,
};
