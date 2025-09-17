'use client';
import React from 'react';

type Props = React.PropsWithChildren<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}>;

/**
 * Shim de ShowcaseSection para satisfacer importaciones del template.
 * Si ya tienes un componente real en otra ruta, puedes re-exportarlo aquí.
 */
// Si existiera la versión real en otra ruta, descomenta y ajusta:
// export { ShowcaseSection as default, ShowcaseSection } from '../layouts/showcase-section';

export function ShowcaseSection({ title, subtitle, description, className, children }: Props) {
  return (
    <section className={className}>
      {(title || subtitle || description) && (
        <header className="mb-6 space-y-1">
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          {title && <h2 className="text-xl font-semibold">{title}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
export default ShowcaseSection;
