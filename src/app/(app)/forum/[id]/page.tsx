"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { QOCScorePanel } from "@/components/forum/QOCScorePanel";
import { TranslateButton } from "@/components/forum/TranslateButton";
import { useForumAgenda, useForumComments, useQocResult } from "@/hooks/useForumAgenda";
import { createComment } from "@/lib/forum-client";
import { formatDate, formatAddress } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function ForumAgendaDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const { address } = useAccount();

  const { data: agenda, isLoading } = useForumAgenda(id);
  const { data: comments, refetch: refetchComments } = useForumComments(id);
  const { data: qocResult } = useQocResult(id);

  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);

  const handleComment = async () => {
    if (!commentText.trim() || !address) return;
    setIsSubmitting(true);
    try {
      await createComment(id, { author: address, content: commentText });
      setCommentText("");
      refetchComments();
    } catch {
      // silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !agenda) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[var(--bg-secondary)] rounded animate-pulse-soft" />
        <div className="h-64 bg-[var(--bg-secondary)] rounded-[var(--card-radius)] animate-pulse-soft" />
      </div>
    );
  }

  const sections = [
    { title: "Abstract", content: agenda.abstract },
    { title: "Motivation", content: agenda.motivation },
    { title: "Specification", content: agenda.specification },
    { title: "Rationale", content: agenda.rationale },
    { title: "Security Considerations", content: agenda.securityConsiderations },
    { title: "Expected Outcomes", content: agenda.expectedOutcomes },
  ].filter((s) => s.content);

  return (
    <div className="space-y-[var(--space-6)]">
      <Link href="/forum" className="text-sm text-[var(--text-brand)] hover:underline">
        &larr; Back to forum
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-[var(--text-tertiary)]">{agenda.tipNumber}</span>
          <Badge variant="primary">{agenda.status}</Badge>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{agenda.title}</h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-[var(--text-tertiary)]">
          <span>by {formatAddress(agenda.author)}</span>
          <span>{formatDate(new Date(agenda.createdAt).getTime())}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <TranslateButton
              text={sections.map((s) => `## ${s.title}\n${s.content}`).join("\n\n")}
              onTranslated={setTranslatedContent}
            />
            {translatedContent && (
              <Button variant="ghost" size="sm" onClick={() => setTranslatedContent(null)}>
                Show Original
              </Button>
            )}
          </div>

          {translatedContent ? (
            <Card>
              <CardContent>
                <div className="proposal-prose">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{translatedContent}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          ) : (
            sections.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="proposal-prose">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments ({comments?.length ?? 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments?.map((c) => (
                  <div key={c.id} className="border-b border-[var(--border-secondary)] pb-3 last:border-b-0">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-1">
                      <span className="font-medium">{formatAddress(c.author)}</span>
                      <span>{formatDate(new Date(c.createdAt).getTime())}</span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">{c.content}</p>
                  </div>
                ))}

                {address && (
                  <div className="pt-3 border-t border-[var(--border-secondary)]">
                    <Textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        onClick={handleComment}
                        disabled={!commentText.trim()}
                        loading={isSubmitting}
                      >
                        Comment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Info */}
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Status</span>
                  <Badge variant="primary" size="sm">{agenda.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Created</span>
                  <span className="text-[var(--text-secondary)]">{formatDate(new Date(agenda.createdAt).getTime())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-tertiary)]">Updated</span>
                  <span className="text-[var(--text-secondary)]">{formatDate(new Date(agenda.updatedAt).getTime())}</span>
                </div>
                {agenda.onchainProposalId && (
                  <div className="flex justify-between">
                    <span className="text-[var(--text-tertiary)]">Proposal</span>
                    <Link href={`/proposals/${agenda.onchainProposalId}`} className="text-[var(--text-brand)]">
                      #{agenda.onchainProposalId}
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* QOC */}
          {qocResult && <QOCScorePanel result={qocResult} />}
        </div>
      </div>
    </div>
  );
}
