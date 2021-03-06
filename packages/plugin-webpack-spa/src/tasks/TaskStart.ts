import { output } from '@artemir/friendly-errors-webpack-plugin';
import express from 'express';
import open from 'open';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import { AbstractTask } from '@zero-scripts/core';
import { WebpackConfig } from '@zero-scripts/webpack-config';

import { WebpackSpaPluginOptions } from '../WebpackSpaPluginOptions';

type StartTaskOptions = {
  port?: number;
  smokeTest?: boolean;
};

export class TaskStart extends AbstractTask<'start'> {
  constructor(
    protected readonly configBuilder: WebpackConfig,
    protected readonly pluginOptionsContainer: WebpackSpaPluginOptions
  ) {
    super('start');
  }

  public async run(args: string[], options: StartTaskOptions): Promise<void> {
    process.env.NODE_ENV = 'development';

    const configOptions = this.configBuilder.optionsContainer.build();

    const pluginOptions = this.pluginOptionsContainer.build();
    const devServerOptions = pluginOptions.devServer;

    const config = await this.configBuilder
      .setIsDev(true)
      .addEntry(require.resolve('webpack-hot-middleware/client'))
      .build();

    const compiler = webpack(config);

    const devServer = express();

    devServer.use(webpackDevMiddleware(compiler));

    devServer.use(
      webpackHotMiddleware(compiler, {
        log: false,
        path: '/__webpack_hmr',
        heartbeat: 10 * 1000
      })
    );

    // for e2e tests
    if (options.smokeTest) {
      compiler.hooks.invalid.tap('WebpackSpaPlugin.smokeTest', () => {
        process.exit(1);
      });

      devServer.get('/terminate-dev-server', () => {
        process.exit(1);
      });
    }

    const port = options.port || devServerOptions.port;

    if (pluginOptions.devServer.openInBrowser) {
      let devServerIsOpen = false;

      compiler.hooks.done.tap('WebpackSpaPlugin.openDevServer', async stats => {
        if (!devServerIsOpen && !stats.hasErrors()) {
          await open(`http://localhost:${port}`);

          devServerIsOpen = true;
        }
      });
    }

    devServer.use(express.static(configOptions.paths.public));

    output.clearConsole();
    output.title('info', 'WAIT', 'Starting the development server...');

    devServer.listen(port);
  }
}
