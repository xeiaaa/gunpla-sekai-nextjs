"use client";

import { useState, useEffect } from "react";
import {
  getAllTimelines,
  createTimeline,
  updateTimeline,
  deleteTimeline
} from "@/lib/actions/timelines";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Timeline {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  seriesCount: number;
}

export default function TimelinesDebugPage() {
  const [timelines, setTimelines] = useState<Timeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTimeline, setEditingTimeline] = useState<Timeline | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    try {
      const data = await getAllTimelines();
      setTimelines(data);
    } catch (error) {
      console.error('Error fetching timelines:', error);
      setMessage({ type: 'error', text: 'Failed to load timelines' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "" });
    setShowCreateForm(false);
    setEditingTimeline(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }

    try {
      const result = await createTimeline({
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Timeline created successfully' });
        resetForm();
        fetchTimelines();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to create timeline' });
      }
    } catch (error) {
      console.error('Error creating timeline:', error);
      setMessage({ type: 'error', text: 'Failed to create timeline' });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeline || !formData.name.trim()) {
      setMessage({ type: 'error', text: 'Name is required' });
      return;
    }

    try {
      const result = await updateTimeline(editingTimeline.id, {
        name: formData.name.trim(),
        slug: formData.slug.trim() || undefined,
        description: formData.description.trim() || undefined,
      });

      if (result.success) {
        setMessage({ type: 'success', text: 'Timeline updated successfully' });
        resetForm();
        fetchTimelines();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update timeline' });
      }
    } catch (error) {
      console.error('Error updating timeline:', error);
      setMessage({ type: 'error', text: 'Failed to update timeline' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the timeline "${name}"?`)) {
      return;
    }

    try {
      const result = await deleteTimeline(id);

      if (result.success) {
        setMessage({ type: 'success', text: 'Timeline deleted successfully' });
        fetchTimelines();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete timeline' });
      }
    } catch (error) {
      console.error('Error deleting timeline:', error);
      setMessage({ type: 'error', text: 'Failed to delete timeline' });
    }
  };

  const startEdit = (timeline: Timeline) => {
    setEditingTimeline(timeline);
    setFormData({
      name: timeline.name,
      slug: timeline.slug || "",
      description: timeline.description || "",
    });
    setShowCreateForm(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/\s+/g, '-'),
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Timeline Management</h1>
          <p className="text-muted-foreground mt-2">
            Create, edit, and delete timelines
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={showCreateForm}
        >
          Create New Timeline
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTimeline ? 'Edit Timeline' : 'Create New Timeline'}
            </CardTitle>
            <CardDescription>
              {editingTimeline ? 'Update timeline information' : 'Add a new timeline to the system'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={editingTimeline ? handleUpdate : handleCreate} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., Universal Century"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium mb-2">
                  Slug
                </label>
                <input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="e.g., universal-century"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL-friendly version of the name. Auto-generated if left empty.
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Brief description of this timeline..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingTimeline ? 'Update Timeline' : 'Create Timeline'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Timelines List */}
      <div className="grid gap-4">
        {timelines.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No timelines found.</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="mt-4"
              >
                Create Your First Timeline
              </Button>
            </CardContent>
          </Card>
        ) : (
          timelines.map((timeline) => (
            <Card key={timeline.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{timeline.name}</h3>
                    {timeline.slug && (
                      <p className="text-sm text-muted-foreground">
                        Slug: {timeline.slug}
                      </p>
                    )}
                    {timeline.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {timeline.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {timeline.seriesCount} series
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(timeline)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(timeline.id, timeline.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
