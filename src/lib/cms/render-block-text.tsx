import React from "react";

export function renderBlockText(value: unknown) {
  if (typeof value !== "string") return null;

  return value.split(/\n{2,}/).map((paragraph, index) => {
    const lines = paragraph.split("\n");

    return (
      <p key={index}>
        {lines.map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {line}
            {lineIndex < lines.length - 1 ? <br /> : null}
          </React.Fragment>
        ))}
      </p>
    );
  });
}
