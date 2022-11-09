/**
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information regarding copyright
 * ownership.
 *
 * Camunda licenses this file to you under the MIT; you may not use this file
 * except in compliance with the MIT License.
 */

'use strict';

const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';
const SENTRY_DSN = process.env.SENTRY_DSN || null;
const ET_ENDPOINT = process.env.ET_ENDPOINT || null;
const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN || null;
const MIXPANEL_STAGE = process.env.MIXPANEL_STAGE || null;

const DEV = NODE_ENV === 'development';
const LICENSE_CHECK = process.env.LICENSE_CHECK;

const UPDATES_SERVER_PRODUCT_NAME = process.env.UPDATES_SERVER_PRODUCT_NAME || 'Camunda Modeler';

const pkg = require('./package.json');

const {
  DefinePlugin
} = require('webpack');

const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const SentryWebpackPlugin = require('@sentry/webpack-plugin');

const { LicenseWebpackPlugin } = require('license-webpack-plugin');

const resourcePath = path.resolve(__dirname + '/resources');


const copyPattern = {
  from: './public'
};

if (DEV) {
  copyPattern.transform = applyDevCSP;
}

module.exports = {
  mode: DEV ? 'development' : (LICENSE_CHECK ? 'none' : 'production'),
  target: 'web',
  entry: {
    bundle: [ './src/index.js' ]
  },
  output: {
    path: __dirname + '/build',
    assetModuleFilename: 'static/media/[name].[hash:8][ext]'
  },
  resolve: {
    mainFields: DEV ? [ 'browser', 'dev:module', 'module', 'main' ] : [ 'browser', 'module', 'main' ],
    modules: [
      'node_modules',
      resourcePath
    ]
  },
  module: {
    rules: [
      {
        test: /\.bpmnlintrc$/i,
        use: 'bpmnlint-loader',
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },

      // apply loaders, falling back to file-loader, if non matches
      {
        oneOf: [
          {
            test: /[/\\][A-Z][^/\\]+\.svg$/,
            use: 'react-svg-loader'
          },
          {
            test: /\.(bpmn|cmmn|dmn|form)$/,
            type: 'asset/source'
          },
          {
            test: /\.css$/,
            use: [
              'style-loader',
              cssLoader()
            ]
          },
          {
            test: /\.less$/,
            use: [
              'style-loader',
              cssLoader(),
              'less-loader'
            ]
          },
          {

            // exclude files served otherwise
            exclude: [ /\.(js|jsx|mjs|bpmnlintrc)$/, /\.html$/, /\.json$/ ],
            type: 'asset/resource'
          }
        ]
      }
    ]
  },
  plugins: [
    new CaseSensitivePathsPlugin(),
    new DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
      'process.env.SENTRY_DSN': JSON.stringify(SENTRY_DSN),
      'process.env.ET_ENDPOINT': JSON.stringify(ET_ENDPOINT),
      'process.env.UPDATES_SERVER_PRODUCT_NAME': JSON.stringify(UPDATES_SERVER_PRODUCT_NAME),
      'process.env.MIXPANEL_TOKEN': JSON.stringify(MIXPANEL_TOKEN),
      'process.env.MIXPANEL_STAGE': JSON.stringify(MIXPANEL_STAGE),
    }),
    new CopyWebpackPlugin({
      patterns: [ copyPattern ]
    }),
    ...sentryIntegration(),
    ...extractDependencies()
  ],

  // don't bundle shims for node globals
  node: false,
  devServer: {
    writeToDisk: true
  },
  devtool: DEV ? 'cheap-module-source-map' : 'source-map'
};



// helpers //////////////////////

function sentryIntegration() {
  if (!SENTRY_DSN) {
    return [];
  }

  const { version } = pkg;

  // necessary SENTRY_AUTH_TOKEN, SENTRY_ORG and SENTRY_PROJECT environment
  // variables are injected via CI when building.
  return [
    new SentryWebpackPlugin({
      release: NODE_ENV === 'production' ? version : 'dev',
      include: '.',
      ignore: [ 'node_modules', 'webpack.config.js', '*Spec.js' ],
    })
  ];
}

function cssLoader() {

  if (DEV) {
    return {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[path][name]__[local]--[hash:base64:5]',
          mode: 'global'
        }
      }
    };
  } else {
    return {
      loader: 'css-loader',
      options: {
        modules: 'global'
      }
    };
  }
}


function extractDependencies() {

  if (!LICENSE_CHECK) {
    return [];
  }

  return [
    new LicenseWebpackPlugin({
      outputFilename: 'dependencies.json',
      perChunkOutput: false,
      renderLicenses: (modules) => {

        const usedModules = modules.reduce((result, m) => {

          const {
            name,
            version
          } = m.packageJson;

          const id = `${name}@${version}`;

          return {
            ...result,
            [id]: true
          };
        }, {});

        return JSON.stringify(usedModules);
      }
    })
  ];
}

/**
 * Patch index.html CSP directive to make sure we can use
 * unsafe-eval in development mode. It is the fastest way
 * to get per module source maps.
 */
function applyDevCSP(content, path) {
  if (/index\.html$/.test(path)) {
    const html = content.toString('utf8');

    return (
      html.replace(
        '<meta http-equiv="Content-Security-Policy" content="script-src \'self\'" />',
        ''
      )
    );
  }

  return content;
}
