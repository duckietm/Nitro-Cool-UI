import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const nitroPackages = [
    'api',
    'assets',
    'avatar',
    'camera',
    'communication',
    'configuration',
    'events',
    'localization',
    'room',
    'session',
    'sound',
    'utils'
];

const aliases = nitroPackages.reduce((acc, packageName) => {
    acc[`@nitrots/${packageName}`] = `/node_modules/@nitrots/nitro-renderer/packages/${packageName}`;
    return acc;
}, {});

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '~': resolve(__dirname, 'node_modules'),
			submodules: resolve(__dirname, "submodules"),
            ...aliases
        }
    },
    build: {
        assetsInlineLimit: 102400,
        rollupOptions: {
            output: {
                assetFileNames: 'src/assets/[name].[ext]',
                manualChunks: id => {					
                    if (id.includes("submodules")) {
                        return "nitro-renderer";
                    }
					if (id.includes("node_modules")) {
						return "vendor";
					}
                }
            }
        }
    }
})
