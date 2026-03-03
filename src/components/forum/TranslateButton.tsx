"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { translateText } from "@/lib/forum-client";

export function TranslateButton({ text, onTranslated }: { text: string; onTranslated: (translated: string) => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    setIsLoading(true);
    try {
      const result = await translateText(text, "ko");
      onTranslated(result.translated);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleTranslate} loading={isLoading}>
      EN → KO
    </Button>
  );
}
