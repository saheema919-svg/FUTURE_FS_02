import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";

const emptyLead = { name: "", email: "", phone: "", source: "Website", message: "" };

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newLead, setNewLead] = useState(emptyLead);
  const [saving, setSaving] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (sourceFilter) params.source = sourceFilter;

      const [leadsRes, analyticsRes] = await Promise.all([
        api.get("/leads", { params }),
        api.get("/leads/analytics"),
      ]);
      setLeads(leadsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchLeads, 300); // debounce search
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/leads/${id}`, { status });
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead? This cannot be undone.")) return;
    try {
      await api.delete(`/leads/${id}`);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete lead");
    }
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/leads", newLead);
      setNewLead(emptyLead);
      setShowAddForm(false);
      fetchLeads();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add lead");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Lead Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowAddForm((s) => !s)}>
          {showAddForm ? "Cancel" : "+ Add Lead"}
        </button>
      </div>

      {analytics && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{analytics.total}</span>
            <span className="stat-label">Total Leads</span>
          </div>
          <div className="stat-card stat-new">
            <span className="stat-value">{analytics.new}</span>
            <span className="stat-label">New</span>
          </div>
          <div className="stat-card stat-contacted">
            <span className="stat-value">{analytics.contacted}</span>
            <span className="stat-label">Contacted</span>
          </div>
          <div className="stat-card stat-converted">
            <span className="stat-value">{analytics.converted}</span>
            <span className="stat-label">Converted</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{analytics.conversionRate}%</span>
            <span className="stat-label">Conversion Rate</span>
          </div>
        </div>
      )}

      {showAddForm && (
        <form className="card add-lead-form" onSubmit={handleAddLead}>
          <h3>Add New Lead</h3>
          <div className="form-grid">
            <input
              placeholder="Name *"
              required
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            />
            <input
              placeholder="Email *"
              type="email"
              required
              value={newLead.email}
              onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
            />
            <input
              placeholder="Phone"
              value={newLead.phone}
              onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
            />
            <select
              value={newLead.source}
              onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
            >
              <option>Website</option>
              <option>Referral</option>
              <option>Social Media</option>
              <option>Ad Campaign</option>
              <option>Other</option>
            </select>
          </div>
          <textarea
            placeholder="Message / inquiry details"
            value={newLead.message}
            onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
          />
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Lead"}
          </button>
        </form>
      )}

      <div className="filter-bar">
        <input
          className="search-input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </select>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="">All Sources</option>
          <option>Website</option>
          <option>Referral</option>
          <option>Social Media</option>
          <option>Ad Campaign</option>
          <option>Other</option>
        </select>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p className="muted">Loading leads...</p>
      ) : leads.length === 0 ? (
        <p className="muted">No leads found.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Source</th>
                <th>Status</th>
                <th>Received</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead._id}>
                  <td>
                    <Link to={`/leads/${lead._id}`} className="lead-link">
                      {lead.name}
                    </Link>
                  </td>
                  <td>{lead.email}</td>
                  <td>{lead.source}</td>
                  <td>
                    <select
                      className="status-select"
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                    <StatusBadge status={lead.status} />
                  </td>
                  <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/leads/${lead._id}`} className="btn btn-small">
                      View
                    </Link>
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(lead._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
