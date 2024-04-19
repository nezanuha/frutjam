import { defineConfig } from 'tsup';

export default defineConfig({
    format: ['cjs', 'esm'],
    entry: {
        index: './src/index.ts',
        notification: './src/plugins/notification/index.ts',
        telephoneInput: './src/plugins/telephoneInput/index.ts',
    },
    dts: true,
    shims: true,
    skipNodeModulesBundle: true,
    clean: true, // Clean the dist directory before each build
    minify: true, // Minification added
    splitting: true, // Code splitting added
    treeshake: true, // Tree shaking added
    // Exclude node_modules explicitly
    external: ['node_modules']
});
