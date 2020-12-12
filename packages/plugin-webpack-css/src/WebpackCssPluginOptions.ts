import { AbstractOptionsContainer, Option } from '@zero-scripts/core';

export class WebpackCssPluginOptions extends AbstractOptionsContainer<WebpackCssPluginOptions> {
  @Option<WebpackCssPluginOptions, 'styleLoaders'>(
    ({ externalValue, defaultValue }) => [
      ...(externalValue ? externalValue : []),
      ...(defaultValue ? defaultValue : [])
    ]
  )
  public styleLoaders: Array<{
    test: string;
    loader:
      | string
      | {
          loader?: string;
          options?: Record<string, unknown>;
        };
    exclude?: string;
    preprocessor?:
      | string
      | {
          loader: string;
          options: Record<string, unknown>;
        };
  }> = [];
}