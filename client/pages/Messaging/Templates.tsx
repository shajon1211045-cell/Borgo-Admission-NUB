import React, { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MessagingTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    channel: "email",
    subject: "",
    body: "",
  });

  const load = async () => {
    setLoading(true);
    const res: any = await apiClient.getTemplates();
    if (res && res.success) {
      const data = res.data;
      if (Array.isArray(data)) {
        setTemplates(data);
      } else if (data && Array.isArray((data as any).templates)) {
        setTemplates((data as any).templates);
      } else {
        setTemplates([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", channel: "email", subject: "", body: "" });
    setOpen(true);
  };

  const save = async () => {
    if (editing) {
      await apiClient.updateTemplate(editing.id, form);
    } else {
      await apiClient.createTemplate(form);
    }
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete template?")) return;
    await apiClient.deleteTemplate(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Messaging Templates</h1>
        <div className="flex items-center gap-2">
          <Button onClick={openCreate} className="bg-deep-plum text-white">
            New Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {t.name}{" "}
                  <small className="text-xs text-gray-500 ml-2">
                    {t.channel}
                  </small>
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(t);
                      setForm({
                        name: t.name,
                        channel: t.channel,
                        subject: t.subject || "",
                        body: t.body || "",
                      });
                      setOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(t.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-700 mb-2">{t.subject}</div>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {t.body}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {/* Hidden trigger handled by New Template button */}
          <div style={{ display: "none" }} />
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Template" : "New Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e: any) =>
                  setForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Channel</label>
              <select
                className="w-full border rounded-md p-2"
                value={form.channel}
                onChange={(e: any) =>
                  setForm((prev) => ({ ...prev, channel: e.target.value }))
                }
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
            {form.channel === "email" && (
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={form.subject}
                  onChange={(e: any) =>
                    setForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                />
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Body</label>
              <textarea
                className="w-full border rounded-md p-2 h-40"
                value={form.body}
                onChange={(e: any) =>
                  setForm((prev) => ({ ...prev, body: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={save} className="bg-deep-plum text-white">
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
