import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
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
    // Prefix absolute paths with the Blueprint base path when embedded.
    const resolvedTo = typeof to === 'string' && to.startsWith('/')
      ? basePath + to
      : to;

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

