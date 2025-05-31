"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { Activity, PlusCircle } from "lucide-react";

export default function CaseActivitiesPage() {
  const params = useParams();
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, [params.id]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/coordinator/cases/${params.id}/activities`);
      const data = await res.json();
      if (data.success) setActivities(data.data);
      else toast.error(data.error || "Failed to fetch activities");
    } catch (e) {
      toast.error("Failed to fetch activities");
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !type.trim()) {
      toast.error("All fields are required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/coordinator/cases/${params.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, type }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Activity added");
        setTitle("");
        setDescription("");
        setType("");
        fetchActivities();
      } else {
        toast.error(data.error || "Failed to add activity");
      }
    } catch (e) {
      toast.error("Failed to add activity");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Case Activities</CardTitle>
          <CardDescription>All activities and updates for this case</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddActivity} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <Input placeholder="Type (e.g. Note, Update)" value={type} onChange={e => setType(e.target.value)} />
            <Textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="md:col-span-1" />
            <Button type="submit" disabled={submitting} className="md:col-span-1">
              <PlusCircle className="w-4 h-4 mr-2" /> Add Activity
            </Button>
          </form>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="w-0.5 h-full bg-border" />
                </div>
                <div>
                  <div className="font-medium">{activity.title} <span className="ml-2 text-xs text-muted-foreground">[{activity.type}]</span></div>
                  <div className="text-sm text-muted-foreground">{activity.description}</div>
                  <div className="text-sm text-muted-foreground">
                    {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : "-"} by {activity.user?.fullName || "-"}
                  </div>
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-sm text-muted-foreground">No activities recorded yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 