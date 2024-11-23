import { Citation } from "@aws-sdk/client-bedrock-agent-runtime";
import cn from "classnames";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

import {
  Assistant as AssistantIcon,
  User as UserIcon,
} from "~/components/Icons";

import { Role } from "~/types";

export interface MessageProps {
  content: string;
  citations?: Citation[];
  key?: string;
  role?: Role;
  error?: boolean;
  thinking?: boolean;
}

const renderCitations = (citations: Citation[]) => {
  return citations.map((citation, index) => (
    <RenderedCitation
      key={`citation-${index}`}
      citation={citation}
      index={index}
    />
  ));
};

const RenderedCitation = ({
  citation,
  index,
}: {
  citation: Citation;
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const content = citation.retrievedReferences?.at(0)?.content?.text || "";
  const file =
    citation.retrievedReferences?.at(0)?.location?.s3Location?.uri || "";
  return (
    <div className="mt-2" key={`citation-${index}`}>
      <div className="text-xs font-semibold">Citation {index + 1}</div>
      <div className="text-xs font-semibold">{file}</div>
      {isExpanded && <div className="text-xs">{content}</div>}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="text-xs italic text-gray-500"
      >
        {isExpanded ? "Hide content" : "Show content"}
      </button>
    </div>
  );
};

const renderContent = (content: string, citations?: Citation[]) => {
  //citations?.forEach(function (citation, i) {
  //  //const start = citation.generatedResponsePart?.textResponsePart?.span?.start;
  //  const end = citation.generatedResponsePart?.textResponsePart?.span?.end;
  //  if (end) {
  //    content = `${content.slice(0, end)} **[${i + 1}]** ${content.slice(end)}`;
  //  }
  //});
  return content;
};

/**
 * Renders a message
 */
export default function Message({
  content,
  citations,
  error,
  role = "user",
  thinking = false,
}: MessageProps) {
  const rendered = useRef<null | boolean>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const messageWrapRef = useRef<HTMLDivElement>(null);
  const [messageHeight, setMessageHeight] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTransitionEnd = () => {
    const theMessageWrap = messageWrapRef.current;
    if (!theMessageWrap) {
      return;
    }

    theMessageWrap.removeAttribute("style");
  };

  useEffect(() => {
    const theMessage = messageRef.current;

    if (rendered.current !== null || !theMessage) {
      return;
    }

    rendered.current = true;

    const contentHeight = theMessage.scrollHeight;
    const containerStyle = window.getComputedStyle(theMessage.parentElement!);
    const paddingTop = parseFloat(containerStyle.paddingTop);
    const paddingBottom = parseFloat(containerStyle.paddingBottom);
    const totalHeight = contentHeight + paddingTop + paddingBottom;

    setMessageHeight(totalHeight);
  }, []);

  useEffect(() => {
    const theMessageWrap = messageWrapRef.current;
    if (!theMessageWrap) {
      return;
    }

    theMessageWrap.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      theMessageWrap.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, []);

  return (
    <div
      className={cn(
        `message message-${role} w-full flex small-mobile:max-sm:text-sm transition-height duration-300`,
        role === "user" ? "justify-end" : "justify-start",
        error && "text-error"
      )}
      ref={messageWrapRef}
      style={{ height: `${messageHeight}px`, overflow: "hidden" }}
    >
      <div
        className={cn(
          "message-inner space-x-4 max-w-[480px] rounded-3xl p-4 transition-[opacity, transform] duration-300 delay-250 relative text-sm md:text-base",
          role === "user"
            ? "bg-black text-white rounded-br-none"
            : " rounded-tl-none bg-slate-100 text-black",
          rendered.current
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-7"
        )}
      >
        <div className="response" ref={messageRef}>
          {thinking ? (
            <div className="flex gap-[5px] min-h-[20px] sm:min-h-[24px] items-center">
              <span className="thinking-bubble animate-thinking-1" />
              <span className="thinking-bubble animate-thinking-2" />
              <span className="thinking-bubble animate-thinking-3" />
            </div>
          ) : (
            <>
              <ReactMarkdown children={renderContent(content, citations)} />
              {role !== "user" &&
                citations &&
                citations.length > 0 &&
                citations[0].retrievedReferences &&
                citations[0].retrievedReferences.length > 0 && (
                  <button
                    onClick={() => setIsExpanded((prev) => !prev)}
                    className="text-xs mt-2 italic text-gray-500"
                  >
                    {isExpanded ? "Hide citations" : "Show citations"}
                  </button>
                )}
              {role !== "user" &&
                citations &&
                isExpanded &&
                renderCitations(citations || [])}
            </>
          )}{" "}
        </div>
      </div>
    </div>
  );
}
