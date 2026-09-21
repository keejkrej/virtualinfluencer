"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { Image } from "@/components/ai-elements/image";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_IMAGE_MODEL, DEFAULT_TEXT_MODEL } from "@/lib/constants";

const aspectItems = [
  { label: "1:1", value: "1:1" },
  { label: "4:5", value: "4:5" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
];

const suggestions = [
  "Generate a still of her testing glazes in north-window light",
  "Draft a caption from the next planned life event",
  "Keep bangs, rust clip, and oat/rust palette — market morning",
];

export function GenerateStudio({
  entityId,
  entityName,
  openRouterConfigured,
  defaultTextModel,
  defaultImageModel,
  assets,
}: {
  entityId: string;
  entityName: string;
  openRouterConfigured: boolean;
  defaultTextModel: string;
  defaultImageModel: string;
  assets: { id: string; filename: string; canonical: boolean }[];
}) {
  const [textModel, setTextModel] = useState(defaultTextModel || DEFAULT_TEXT_MODEL);
  const [imageModel, setImageModel] = useState(
    defaultImageModel || DEFAULT_IMAGE_MODEL,
  );
  const [scene, setScene] = useState("");
  const [pendingImage, setPendingImage] = useState(false);
  const [lastStill, setLastStill] = useState<{
    base64: string;
    mediaType: string;
  } | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { entityId, model: textModel },
      }),
    [entityId, textModel],
  );

  const { messages, sendMessage, status } = useChat({ transport });

  async function onPromptSubmit(message: PromptInputMessage) {
    if (!message.text.trim()) return;
    await sendMessage({ text: message.text });
  }

  async function generateDirect() {
    if (!scene.trim()) {
      toast.error("Describe a scene first.");
      return;
    }
    setPendingImage(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityId,
          scene,
          model: imageModel,
          referenceIds: assets.filter((asset) => asset.canonical).map((asset) => asset.id),
        }),
      });
      const json = (await res.json()) as {
        error?: string;
        base64?: string;
        mediaType?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Generation failed");
      if (json.base64) {
        setLastStill({
          base64: json.base64,
          mediaType: json.mediaType ?? "image/png",
        });
      }
      toast.success("Still saved to the asset library.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Generation failed");
    } finally {
      setPendingImage(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="flex min-h-[32rem] flex-col border">
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                title={`Talk with ${entityName}'s consistency profile`}
                description="Ask for a still, a caption, or a scene. Tools save assets and drafts automatically."
              />
            ) : (
              messages.map((message) => (
                <Message key={message.id} from={message.role}>
                  <MessageContent>
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <MessageResponse key={`${message.id}-${index}`}>
                            {part.text}
                          </MessageResponse>
                        );
                      }
                      if (part.type.startsWith("tool-")) {
                        const toolPart = part as {
                          type: string;
                          state?: "input-streaming" | "input-available" | "output-available" | "output-error" | "output-denied" | "approval-requested";
                          input?: unknown;
                          output?: unknown;
                          errorText?: string;
                        };
                        return (
                          <Tool key={`${message.id}-${index}`} defaultOpen>
                            <ToolHeader
                              title={part.type.replace("tool-", "")}
                              type={part.type as `tool-${string}`}
                              state={toolPart.state ?? "output-available"}
                            />
                            <ToolContent>
                              <ToolInput input={toolPart.input} />
                              <ToolOutput
                                output={toolPart.output}
                                errorText={toolPart.errorText}
                              />
                            </ToolContent>
                          </Tool>
                        );
                      }
                      return null;
                    })}
                  </MessageContent>
                </Message>
              ))
            )}
            {status === "submitted" || status === "streaming" ? (
              <Shimmer>Grounding in the style bible…</Shimmer>
            ) : null}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <div className="border-t p-3">
          <Suggestions>
            {suggestions.map((item) => (
              <Suggestion
                key={item}
                suggestion={item}
                onClick={(value) => sendMessage({ text: value })}
              />
            ))}
          </Suggestions>
          <PromptInput
            className="mt-2"
            onSubmit={onPromptSubmit}
          >
            <PromptInputHeader />
            <PromptInputBody>
              <PromptInputTextarea placeholder="Describe a life beat or ask for a still…" />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputButton disabled>
                  {textModel}
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit status={status} />
            </PromptInputFooter>
          </PromptInput>
          {!openRouterConfigured ? (
            <p className="text-muted-foreground mt-2 text-xs">
              Set OPENROUTER_API_KEY to enable generation.
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>Text model override</Label>
          <Input value={textModel} onChange={(event) => setTextModel(event.target.value)} />
          <Label>Image model override</Label>
          <Input value={imageModel} onChange={(event) => setImageModel(event.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="scene">Direct still</Label>
          <Input
            id="scene"
            value={scene}
            onChange={(event) => setScene(event.target.value)}
            placeholder="North-window studio, oat sweater, rust clip…"
          />
          <Select defaultValue="1:1" items={aspectItems}>
            <SelectTrigger>
              <SelectValue placeholder="Aspect" />
            </SelectTrigger>
            <SelectContent>
              {aspectItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={generateDirect} disabled={pendingImage || !openRouterConfigured}>
            {pendingImage ? "Generating…" : "Generate still"}
          </Button>
          <p className="text-muted-foreground text-xs">
            Canonical refs used: {assets.filter((asset) => asset.canonical).length}
          </p>
        </div>
        {lastStill ? (
          <Image
            base64={lastStill.base64}
            mediaType={lastStill.mediaType}
            uint8Array={new Uint8Array()}
            alt={`Generated still of ${entityName}`}
          />
        ) : null}
      </div>
    </div>
  );
}
