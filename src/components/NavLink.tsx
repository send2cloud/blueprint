import { NavLink as RouterNavLink, NavLinkProps, useParams } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from '../lib/utils';
import { useBasePath } from '../lib/basePath';

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    const basePath = useBasePath();
    const { projectId: projectSlug } = useParams();

    // Prefix absolute paths with the Blueprint base path + project slug.
    let resolvedTo = to;
    if (typeof to === 'string' && to.startsWith('/')) {
      const prefix = projectSlug ? `${basePath}/${projectSlug}` : basePath;
      resolvedTo = prefix + to;
    }

    return (
      <RouterNavLink
        ref={ref}
        to={resolvedTo}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
