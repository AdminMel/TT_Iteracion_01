"use client";

import React from "react";

type ShowcaseSectionProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
};

const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  return (
    <section className={className ?? "space-y-4"}>
      {title && <h2 className="text-xl font-semibold">{title}</h2>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div>{children}</div>
    </section>
  );
};

export default ShowcaseSection;
export { ShowcaseSection }; // ← así funcionan los imports con y sin llaves
