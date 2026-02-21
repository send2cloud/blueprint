import { createContext, useContext } from 'react';
import { useNavigate, useParams, NavigateOptions } from 'react-router-dom';

/**
 * Holds the mount path Blueprint is embedded at (e.g. "/blueprint").
 * Empty string when running standalone.
 */
const BasePathContext = createContext<string>('');

export const BasePathProvider = BasePathContext.Provider;

export function useBasePath(): string {
    return useContext(BasePathContext);
}

/**
 * Drop-in replacement for useNavigate() that automatically prefixes absolute
 * paths with the Blueprint base path AND the current project slug so
 * navigation works correctly in multi-project mode.
 *
 * Usage: const navigate = useBlueprintNavigate();
 *        navigate('/canvas');  // goes to /romeo/canvas when in project "romeo"
 */
export function useBlueprintNavigate() {
    const navigate = useNavigate();
    const basePath = useBasePath();
    const { projectId: projectSlug } = useParams();

    return (to: string | number, options?: NavigateOptions) => {
        if (typeof to === 'string' && to.startsWith('/')) {
            // If we're in a project context (slug in URL), prefix the path
            const prefix = projectSlug ? `${basePath}/${projectSlug}` : basePath;
            return navigate(prefix + to, options);
        }
        return navigate(to as never, options);
    };
}

/**
 * Resolves a Blueprint-internal absolute path to the correct href,
 * respecting the base path and current project slug.
 * Use this for <Link to={bp('/canvas')}> etc.
 */
export function useBlueprintPath() {
    const basePath = useBasePath();
    const { projectId: projectSlug } = useParams();
    return (path: string) => {
        const prefix = projectSlug ? `${basePath}/${projectSlug}` : basePath;
        return prefix + path;
    };
}
