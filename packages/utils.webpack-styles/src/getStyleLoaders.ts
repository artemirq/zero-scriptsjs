import { WebpackConfigOptions } from '@zero-scripts/config.webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

export const getStyleLoaders = (cssOptions: any, preprocessor?: string) => ({
  isDev,
  sourceMap
}: WebpackConfigOptions): Array<any> => {
  const loaders = [
    isDev
      ? require.resolve('style-loader')
      : {
          loader: MiniCssExtractPlugin.loader
        },
    {
      loader: require.resolve('css-loader'),
      options: cssOptions
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        ident: 'postcss',
        plugins: () => [
          require('postcss-flexbugs-fixes'),
          require('postcss-preset-env')({
            autoprefixer: {
              flexbox: 'no-2009'
            },
            stage: 3
          })
        ],
        sourceMap: !isDev && sourceMap
      }
    }
  ];

  if (preprocessor) {
    loaders.push({
      loader: require.resolve(preprocessor),
      options: {
        sourceMap: !isDev && sourceMap
      }
    });
  }

  return loaders;
};