import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Optimize for production performance
    reactStrictMode: false, // Disable in production to avoid double renders
    poweredByHeader: false, // Remove X-Powered-By header
    compress: true, // Enable gzip compression

    // Static export requires unoptimized images
    images: {
        unoptimized: true,
    },

    webpack: (config, { isServer, webpack }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                child_process: false,
                'fs/promises': false,
                'node:fs/promises': false,
                'node:fs': false,
                readline: false,
                path: false,
                os: false,
                crypto: require.resolve('crypto-browserify'),
                stream: require.resolve('stream-browserify'),
                buffer: require.resolve('buffer/'),
                util: require.resolve('util/'),
            }

            // Handle node: protocol imports by replacing with browser polyfills
            config.plugins.push(
                new webpack.NormalModuleReplacementPlugin(
                    /^node:crypto$/,
                    require.resolve('crypto-browserify')
                ),
                new webpack.NormalModuleReplacementPlugin(
                    /^node:buffer$/,
                    require.resolve('buffer/')
                ),
                new webpack.NormalModuleReplacementPlugin(
                    /^node:stream$/,
                    require.resolve('stream-browserify')
                ),
                new webpack.NormalModuleReplacementPlugin(
                    /^node:util$/,
                    require.resolve('util/')
                ),
                new webpack.NormalModuleReplacementPlugin(
                    /^node:fs\/promises$/,
                    require.resolve('./src/lib/empty-module.js')
                ),
                new webpack.NormalModuleReplacementPlugin(
                    /^node:fs$/,
                    require.resolve('./src/lib/empty-module.js')
                ),
                new webpack.NormalModuleReplacementPlugin(
                    /^node:path$/,
                    require.resolve('./src/lib/empty-module.js')
                ),
                new webpack.NormalModuleReplacementPlugin(
                    /^node:os$/,
                    require.resolve('./src/lib/empty-module.js')
                ),
                new webpack.ProvidePlugin({
                    Buffer: ['buffer', 'Buffer'],
                    process: 'process/browser',
                })
            );
        }

        return config
    },
    transpilePackages: ['@0glabs/0g-serving-broker', '@0gfoundation/0g-ts-sdk'],
    output: 'export',
    trailingSlash: false, // Change to false for better SPA behavior

    // Optimize bundle splitting
    experimental: {
        optimizePackageImports: ['dexie', '@0glabs/0g-serving-broker', '@0gfoundation/0g-ts-sdk'],
    },
}

export default nextConfig
