import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Reply, Trash2, Loader2 } from "lucide-react";
import { createComment, deleteComment } from "../../services/workItemService";

const CommentItem = ({ comment, onReply, onDelete, depth = 0 }) => {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await createComment({
        work_item: comment.work_item,
        body: replyText,
        parent: comment.id,
      });
      setReplyText("");
      setShowReply(false);
      onReply?.();
    } catch (err) {
      console.error("Reply failed:", err);
    } finally {
      setReplying(false);
    }
  };

  const authorInitial = comment.author_details
    ? (comment.author_details.first_name?.[0] || comment.author_details.email?.[0] || "?").toUpperCase()
    : "?";

  return (
    <div className={cn("space-y-2", depth > 0 && "ml-8 pl-4 border-l border-zinc-800")}>
      <div className="p-3 rounded-lg bg-zinc-900/40 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white">
              {authorInitial}
            </div>
            <span className="text-xs font-medium text-white/80">
              {comment.author_details
                ? `${comment.author_details.first_name} ${comment.author_details.last_name}`.trim() || comment.author_details.email
                : "Anonymous"}
            </span>
            <span className="text-[10px] text-white/30">
              {new Date(comment.created_at).toLocaleString("en-IN", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowReply(!showReply)}
              className="p-1 rounded hover:bg-zinc-800 text-white/30 hover:text-white/60 transition-colors"
              title="Reply"
            >
              <Reply size={12} />
            </button>
            <button
              onClick={() => onDelete?.(comment.id)}
              className="p-1 rounded hover:bg-zinc-800 text-white/30 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
        <p className="text-sm text-white/70 whitespace-pre-wrap">{comment.body}</p>
      </div>

      {showReply && (
        <div className="ml-8 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmitReply(); } }}
          />
          <button
            onClick={handleSubmitReply}
            disabled={replying || !replyText.trim()}
            className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-all text-xs font-semibold"
          >
            {replying ? <Loader2 size={14} className="animate-spin" /> : "Reply"}
          </button>
        </div>
      )}
    </div>
  );
};

const CommentThread = ({ workItemId, comments, onRefresh }) => {
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await createComment({ work_item: workItemId, body: newComment });
      setNewComment("");
      onRefresh?.();
    } catch (err) {
      console.error("Comment posting failed:", err);
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteComment(id);
      onRefresh?.();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const topLevel = comments?.filter((c) => !c.parent) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
        <MessageSquare size={16} />
        Comments ({comments?.length || 0})
      </div>

      <div className="flex gap-2">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePost(); } }}
        />
        <button
          onClick={handlePost}
          disabled={posting || !newComment.trim()}
          className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50 transition-all text-xs font-semibold"
        >
          {posting ? <Loader2 size={14} className="animate-spin" /> : "Post"}
        </button>
      </div>

      <div className="space-y-3">
        {topLevel.map((comment) => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              onReply={onRefresh}
              onDelete={handleDelete}
            />
            {comment.reply_count > 0 && (
              <div className="space-y-2 mt-2">
                {comments
                  .filter((c) => c.parent === comment.id)
                  .map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      depth={1}
                      onReply={onRefresh}
                      onDelete={handleDelete}
                    />
                  ))}
              </div>
            )}
          </div>
        ))}
        {(!comments || comments.length === 0) && (
          <p className="text-sm text-white/30 text-center py-4">No comments yet</p>
        )}
      </div>
    </div>
  );
};

export default CommentThread;
