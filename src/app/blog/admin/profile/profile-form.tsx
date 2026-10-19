"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminFieldCls } from "../field-styles";
import { ImageField } from "../image-field";
import { updateProfile } from "../actions";

/** Author name, photo and bio — shown on every post this person writes. */
export function ProfileForm(props: { name: string; bio: string; avatarUrl: string; email: string }) {
  const { toast } = useToast();
  const router = useRouter();
  const [name, setName] = React.useState(props.name);
  const [bio, setBio] = React.useState(props.bio);
  const [avatarUrl, setAvatarUrl] = React.useState(props.avatarUrl);
  const [saving, setSaving] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await updateProfile({ name, bio, avatarUrl });
    setSaving(false);
    if (res.ok) {
      toast({ title: "Profile saved" });
      router.refresh();
    } else toast({ title: "Couldn't save", description: res.error, variant: "destructive" });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-2xl space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6"
    >
      <div>
        <h2 className="text-lg font-medium text-white">Author profile</h2>
        <p className="mt-1 text-sm text-white/50">Shown on your posts. Signed in as {props.email}.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-[160px_1fr]">
        <ImageField label="Photo" value={avatarUrl} onChange={setAvatarUrl} aspect="aspect-square" />
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-medium text-white/80">Name</p>
            <Input value={name} onChange={(e) => setName(e.target.value)} required className={adminFieldCls} />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-white/80">Short bio</p>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={400}
              rows={4}
              placeholder="e.g. UI designer at Nebulark, writing about design systems and accessibility."
              className={`${adminFieldCls} resize-y`}
            />
            <p className="mt-1 text-xs text-white/40">{bio.length}/400</p>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-full bg-[#0dcaf0] px-5 py-2 text-sm font-semibold text-black hover:bg-[#0dcaf0]/90 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save profile
      </button>
    </form>
  );
}
