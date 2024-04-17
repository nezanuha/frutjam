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
    clean: true,
    minify: true, // Minification added
    splitting: true, // Code splitting added
    treeshake: true, // Tree shaking added
});
