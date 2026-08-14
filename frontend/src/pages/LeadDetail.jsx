import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/leads/${id}`);
      setLead(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load lead");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStatusChange = async (status) => {
    try {
      const { data } = await api.put(`/leads/${id}`, { status });
      setLead(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const { data } = await api.post(`/leads/${id}/notes`, { text: noteText });
      setLead(data);
      setNoteText("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add note");
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const { data } = await api.delete(`/leads/${id}/notes/${noteId}`);
      setLead(data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete note");
    }
  };

  const handleDeleteLead = async () => {
    if (!window.confirm("Delete this lead permanently?")) return;
    try {
      await api.delete(`/leads/${id}`);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete lead");
    }
  };

  if (loading) return <p className="muted page">Loading...</p>;
  if (error) return <p className="alert page">{error}</p>;
  if (!lead) return null;

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← Back to Dashboard
      </Link>

      <div className="card detail-card">
        <div className="detail-header">
          <div>
            <h1>{lead.name}</h1>
            <p className="muted">{lead.email}</p>
          </div>
          <StatusBadge status={lead.status} />
        </div>

        <div className="detail-grid">
          <div>
            <strong>Phone</strong>
            <p>{lead.phone || "—"}</p>
          </div>
          <div>
            <strong>Source</strong>
            <p>{lead.source}</p>
          </div>
          <div>
            <strong>Received</strong>
            <p>{new Date(lead.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <strong>Last Updated</strong>
            <p>{new Date(lead.updatedAt).toLocaleString()}</p>
          </div>
        </div>

        {lead.message && (
          <div className="message-block">
            <strong>Original Message</strong>
            <p>{lead.message}</p>
          </div>
        )}

        <div className="status-updater">
          <strong>Update Status</strong>
          <div className="status-buttons">
            {["new", "contacted", "converted", "lost"].map((s) => (
              <button
                key={s}
                className={`btn btn-small ${lead.status === s ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleStatusChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-danger" onClick={handleDeleteLead}>
          Delete Lead
        </button>
      </div>

      <div className="card">
        <h2>Follow-up Notes</h2>
        <form className="note-form" onSubmit={handleAddNote}>
          <textarea
            placeholder="Add a follow-up note (e.g. 'Called on Aug 14, interested in demo')"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button className="btn btn-primary" type="submit" disabled={addingNote}>
            {addingNote ? "Adding..." : "Add Note"}
          </button>
        </form>

        {lead.notes.length === 0 ? (
          <p className="muted">No follow-up notes yet.</p>
        ) : (
          <ul className="notes-list">
            {[...lead.notes].reverse().map((note) => (
              <li key={note._id} className="note-item">
                <div>
                  <p>{note.text}</p>
                  <span className="note-date">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                <button className="btn btn-small btn-danger" onClick={() => handleDeleteNote(note._id)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LeadDetail;
