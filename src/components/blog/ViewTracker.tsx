"use client";

import * as React from "react";
import { recordView } from "@/app/post/actions";

/** Counts one view per post per browser session. */
export function ViewTracker({ postId }: { postId: string }) {
  React.useEffect(() => {
    const key = `nebulark-viewed-${postId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked (private mode): still count, at worst once per load.
    }
    void recordView(postId);
  }, [postId]);
  return null;
}
