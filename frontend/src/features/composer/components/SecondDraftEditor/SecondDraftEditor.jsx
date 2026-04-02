import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  FileText,
  Linkedin,
  BookOpen,
  Lightbulb,
  RotateCcw,
  Copy,
  Check,
  Loader2,
  ChevronRight,
  Minus,
  Plus,
  Wand2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { usePrefetchSourcesMutation } from "../../../../modules/composer/hooks/usePrefetchSourcesMutation";
import { useSynthesizeMutation } from "../../../../modules/composer/hooks/useSynthesizeMutation";
import { composerKeys } from "../../../../modules/composer/keys/composer.keys";
import { useAddItem } from "../../../../modules/items/hooks/useItemMutation";
import { useSourcesQuery } from "../../../../modules/composer/hooks/useSourcesQuery";
import {
  Book,
  Link as LinkIcon,
  FileText as FileIcon,
  Info,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import "./SecondDraftEditor.css";

const FORMAT_TABS = [
  { id: "Notes", label: "Notes", icon: FileText },
  { id: "LinkedIn", label: "Social", icon: Linkedin },
  { id: "Blog", label: "Blog", icon: BookOpen },
  { id: "Ideas", label: "Ideas", icon: Lightbulb },
];

const STEPS = ["Analyze", "Generate", "Refine"];

const SecondDraftEditor = ({
  prompt,
  setPrompt,
  lastAnalyzedPrompt,
  setLastAnalyzedPrompt,
  activeSourceId,
  setActiveSourceId,
  selectedSourceIds = [],
  setSelectedSourceIds,
  onSourceClick, // Added for mobile card interaction
}) => {
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState("Notes");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const promptRef = useRef(null);
  const queryClient = useQueryClient();

  // Modular Composer Hooks
  const preFetchMutation = usePrefetchSourcesMutation();
  const synthesizeMutation = useSynthesizeMutation();
  const saveMutation = useAddItem();
  const { data: sources = [], isLoading: isSourcesLoading } = useSourcesQuery(
    lastAnalyzedPrompt || prompt,
  );

  const toggleSource = (id) => {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  // On Success handlers for UI logic
  useEffect(() => {
    if (preFetchMutation.isSuccess) {
      const { data } = preFetchMutation;
      if (data.sources.length === 0) {
        alert(
          "No relevant memories found for this prompt. Try a different topic!",
        );
      } else {
        setStep(2);
        setSelectedSourceIds(data.sources.map((s) => s.itemId));
        setIsSourcesExpanded(true); // Auto-expand when sources found
        // Sync the stable key for the sidebar
        if (preFetchMutation.variables) {
          setLastAnalyzedPrompt(preFetchMutation.variables);
        }
      }
    }
  }, [
    preFetchMutation.isSuccess,
    preFetchMutation.data,
    preFetchMutation.variables,
    setStep,
    setSelectedSourceIds,
    setLastAnalyzedPrompt,
    setIsSourcesExpanded,
  ]);

  useEffect(() => {
    if (synthesizeMutation.isSuccess) {
      const data = synthesizeMutation.data;
      if (data.content) {
        setContent(data.content);
        setRefineText("");
        // Synchronize analysis result
        if (synthesizeMutation.variables?.prompt) {
          setLastAnalyzedPrompt(synthesizeMutation.variables.prompt);
        }
      } else if (data.error) {
        alert(`Generation failed: ${data.error}`);
      }
    }
  }, [
    synthesizeMutation.isSuccess,
    synthesizeMutation.data,
    synthesizeMutation.variables,
    setContent,
    setLastAnalyzedPrompt,
  ]);

  // Compute loading state locally
  const isGenerating =
    preFetchMutation.isPending ||
    synthesizeMutation.isPending ||
    saveMutation.isPending;

  // Auto-resize prompt textarea
  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = "auto";
      promptRef.current.style.height = promptRef.current.scrollHeight + "px";
    }
  }, [prompt]);

  /* ── Handlers ── */
  const handlePreFetch = () => {
    if (!prompt.trim() || isGenerating) return;
    preFetchMutation.mutate(prompt);
  };

  const handleSynthesize = () => {
    if (isGenerating) return;
    setContent("");
    setStep(3);
    synthesizeMutation.mutate({
      prompt,
      format,
      selectedIds: selectedSourceIds,
    });
  };

  const handleRefine = (instructions) => {
    if (!instructions?.trim() || isGenerating) return;
    synthesizeMutation.mutate({
      prompt,
      format,
      selectedIds: selectedSourceIds,
      previousContent: content,
      instructions,
    });
  };

  const handleSave = () => {
    if (!content || isGenerating) return;
    saveMutation.mutate(
      {
        title: `${format} Draft: ${prompt.slice(0, 30)}...`,
        content: content,
        type: "note",
        tags: ["SecondDraft", format],
      },
      {
        onSuccess: () => {
          alert("Saved successfully to your Galaxy!");
        },
        onError: (err) => {
          console.error("Save error:", err);
          alert("Failed to save to Galaxy.");
        },
      },
    );
  };

  const stripHtml = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleCopy = () => {
    const cleanText = stripHtml(content);
    navigator.clipboard.writeText(cleanText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setStep(1);
    setPrompt("");
    setLastAnalyzedPrompt("");
    setContent("");
    setRefineText("");
    queryClient.setQueryData(composerKeys.sources(""), []);
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      step === 1 ? handlePreFetch() : handleSynthesize();
    }
  };

  /* ── Render content with citation badges ── */
  const renderContent = (raw) => {
    if (!raw) return "";
    return raw
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[(\d+)\]/g, '<span class="sde-cite">$1</span>')
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div className={`sde-shell sde-fmt-${format.toLowerCase()}`}>
      {/* ── Step Indicator ── */}
      <div className="sde-steps">
        {STEPS.map((label, i) => {
          const num = i + 1;
          const isDone = step > num;
          const isActive = step === num;
          return (
            <React.Fragment key={label}>
              <button
                className={`sde-step ${isActive ? "is-active" : ""} ${isDone ? "is-done" : ""}`}
                onClick={() => isDone && setStep(num)}
                disabled={!isDone}
              >
                <span className="sde-step-num">{isDone ? "✓" : num}</span>
                <span className="sde-step-label">{label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <span
                  className={`sde-step-divider ${isDone ? "is-done" : ""}`}
                />
              )}
            </React.Fragment>
          );
        })}

        <div className="sde-steps-end">
          {content && (
            <button className="sde-ghost-btn" onClick={handleCopy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          )}
          <button className="sde-ghost-btn" onClick={handleReset}>
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ── Format Tabs ── */}
      <div className="sde-format-bar">
        {FORMAT_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`sde-fmt-tab ${format === tab.id ? "is-active" : ""}`}
            onClick={() => setFormat(tab.id)}
          >
            <tab.icon size={11} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Canvas ── */}
      <div className="sde-canvas">
        {/* Empty state */}
        {!content && !isGenerating && (
          <div className="sde-empty">
            <div className="sde-empty-icon">
              <Sparkles size={20} />
            </div>
            <p className="sde-empty-title">Your memory is waiting.</p>
            <p className="sde-empty-sub">
              Type a topic below to see what you've learned.
            </p>
          </div>
        )}

        {/* Step 2 Guidance */}
        {step === 2 && !isGenerating && (
          <div className="sde-guide fade-in">
            <div className="sde-guide-content">
              <p>
                <strong>Memories Analyzed!</strong>
              </p>
              <p>
                Select relevant memories from the sidebar, then click{" "}
                <strong>Generate</strong> below.
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        {content && (
          <div
            className="sde-content"
            contentEditable={true}
            suppressContentEditableWarning={true}
            onBlur={(e) => setContent(e.currentTarget.innerHTML)}
            dangerouslySetInnerHTML={{ __html: renderContent(content) }}
          />
        )}
      </div>

      {/* ── Refine Bar (step 3 only) ── */}
      {step === 3 && (
        <div className="sde-refine-bar">
          <input
            className="sde-refine-input"
            placeholder="Refine: make shorter, change tone, add examples…"
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRefine(refineText)}
          />
          <button
            className="sde-refine-send"
            onClick={() => handleRefine(refineText)}
            disabled={isGenerating || !refineText.trim()}
          >
            {isGenerating ? (
              <Loader2 size={12} className="sde-spin" />
            ) : (
              <ChevronRight size={12} />
            )}
          </button>
        </div>
      )}

      {/* ── Mobile Sources Toolbar (only visible on small screens) ── */}
      {sources.length > 0 && (
        <div
          className={`sde-mobile-sources fade-in ${isSourcesExpanded ? "is-expanded" : "is-collapsed"}`}
        >
          <button
            className="sde-ms-toggle"
            onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
          >
            <div className="sde-ms-toggle-left">
              <span className="sde-ms-title">Sources ({sources.length})</span>
            </div>
            {isSourcesExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronUp size={14} />
            )}
          </button>

          {isSourcesExpanded && (
            <div className="sde-ms-list slide-up">
              {sources.map((source) => {
                const isSelected = selectedSourceIds.includes(source.itemId);

                return (
                  <div
                    key={source.id}
                    className={`sde-ms-card glass ${isSelected ? "is-selected" : ""}`}
                  >
                    <div
                      className="sde-ms-selection-overlay"
                      onClick={() => toggleSource(source.itemId)}
                    >
                      {isSelected ? (
                        <CheckSquare
                          size={14}
                          className="sde-ms-check selected"
                        />
                      ) : (
                        <Square size={14} className="sde-ms-check" />
                      )}
                    </div>

                    <div className="sde-ms-badge">[{source.id}]</div>
                    <div
                      className="sde-ms-body"
                      onClick={() =>
                        onSourceClick({
                          _id: source.itemId,
                          title: source.title,
                          content: source.text,
                          type: source.source,
                        })
                      }
                    >
                      <div className="sde-ms-type">
                        {source.source === "saved docs" ? (
                          <Book size={10} />
                        ) : source.source === "blog post" ? (
                          <LinkIcon size={10} />
                        ) : (
                          <FileIcon size={10} />
                        )}
                        <span>{source.source}</span>
                      </div>
                      <h4 className="sde-ms-card-title">{source.title}</h4>
                      <p className="sde-ms-preview">{source.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="sde-action-bar">
        <div className="sde-actions-left">
          <button
            className="sde-action-btn"
            onClick={() =>
              handleRefine("Expand this with more detail and examples.")
            }
            disabled={!content || isGenerating}
          >
            {isGenerating && refineText === "" ? (
              <Loader2 size={11} className="sde-spin" />
            ) : (
              <Plus size={11} />
            )}
            Expand
          </button>
          <button
            className="sde-action-btn"
            onClick={() => handleRefine("Shorten this. Be more concise.")}
            disabled={!content || isGenerating}
          >
            {isGenerating && refineText === "" ? (
              <Loader2 size={11} className="sde-spin" />
            ) : (
              <Minus size={11} />
            )}
            Shorten
          </button>
          <button
            className="sde-action-btn"
            onClick={() =>
              handleRefine("Improve the structure and clarity of this draft.")
            }
            disabled={!content || isGenerating}
          >
            {isGenerating && refineText === "" ? (
              <Loader2 size={11} className="sde-spin" />
            ) : (
              <Wand2 size={11} />
            )}
            Improve
          </button>
        </div>

        <button
          className="sde-save-btn"
          disabled={!content || isGenerating}
          onClick={handleSave}
        >
          {isGenerating ? (
            <Loader2 size={12} className="sde-spin" />
          ) : (
            <Check size={12} />
          )}
          Save
        </button>
      </div>

      {/* ── Prompt Input ── */}
      <div className="sde-input-bar">
        <span className="sde-target-badge">TARGET</span>
        <textarea
          ref={promptRef}
          className="sde-prompt-input"
          placeholder="What are we creating?"
          value={prompt}
          rows={1}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleEnter}
        />
        <button
          className={`sde-gen-btn ${step === 2 ? "is-ready" : ""}`}
          onClick={step === 1 ? handlePreFetch : handleSynthesize}
          disabled={isGenerating || !prompt.trim()}
          title={step === 1 ? "Analyze Memories" : "Generate Draft"}
        >
          {isGenerating ? (
            <Loader2 size={14} className="sde-spin" />
          ) : step === 1 ? (
            <>
              <Wand2 size={14} /> <span>Analyze</span>
            </>
          ) : (
            <>
              <Sparkles size={14} /> <span>Generate</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SecondDraftEditor;
