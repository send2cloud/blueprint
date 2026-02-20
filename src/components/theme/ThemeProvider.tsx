import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ComponentProps } from 'react';

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
      // Use a Blueprint-specific key so we don't fight with the host app's
      // own next-themes instance over the shared "theme" localStorage key.
      storageKey="blueprint-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
