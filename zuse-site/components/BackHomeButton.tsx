"use client";

import type { MouseEvent } from "react";
import { Button } from "@/components/ui";

export default function BackHomeButton() {
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    window.location.assign("/");
  };

  return (
    <Button
      href="/"
      className="zuse-not-found-link"
      font="sans"
      leftIcon={<span aria-hidden="true">←</span>}
      onClick={handleClick}
    >
      Back to home
    </Button>
  );
}
