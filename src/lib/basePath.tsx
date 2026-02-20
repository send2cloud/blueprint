import { createContext, useContext } from 'react';
import { useNavigate, NavigateOptions } from 'react-router-dom';

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
 * paths with the Blueprint base path so navigation works correctly whether
 * Blueprint is standalone or embedded at a sub-route like /blueprint.
 *
 * Usage: const navigate = useBlueprintNavigate();
 *        navigate('/canvas');  // goes to /blueprint/canvas when embedded
 */
export function useBlueprintNavigate() {
    const navigate = useNavigate();
    const basePath = useBasePath();

    return (to: string | number, options?: NavigateOptions) => {
        if (typeof to === 'string' && to.startsWith('/')) {
            return navigate(basePath + to, options);
        }
        return navigate(to as never, options);
    };
}

/**
 * Resolves a Blueprint-internal absolute path to the correct href,
 * respecting the base path. Use this for <Link to={bp('/canvas')}> etc.
 */
export function useBlueprintPath() {
    const basePath = useBasePath();
    return (path: string) => basePath + path;
}
