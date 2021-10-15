import { Configuration } from 'webpack';
import {resolve} from 'path';

const config: Configuration = {
    mode: 'production',
    entry: './src/index.ts',
    output: {
        filename: 'index.js',
        path: resolve(__dirname,'dist')
    },
    plugins: [],
    target: 'node',
    module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js'],
      },
}

export default config;