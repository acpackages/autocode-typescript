import { Plugin } from 'vite';
import { ComponentCompiler } from '../../ac-runtime-compiler/src/index';
import * as fs from 'fs';
import * as path from 'path';

export function acRuntimePlugin(): Plugin {
    const compiler = new ComponentCompiler();
    let projectRoot: string = process.cwd();
    
    const doTransform = async (code: string, id: string) => {
        if (id.endsWith('.ts') && !id.endsWith('.compiled.ts') && !id.includes('node_modules')) {
            if (code.includes('@AcElement')) {
                console.log(`[AC Compiler] Compiling ${path.basename(id)}...`);
                try {
                    const results = compiler.compile(code, id);
                    
                    if (results.length > 0) {
                        const compiledCode = results[0].code;
                        
                        // Save to central cache directory in project root
                        const cacheDir = path.join(projectRoot, '.ac-runtime-cache');
                        if (!fs.existsSync(cacheDir)) {
                            fs.mkdirSync(cacheDir, { recursive: true });
                        }
                        
                        // Create a flat file name based on the relative path to avoid collisions
                        const relativePath = path.relative(projectRoot, id);
                        const fileName = relativePath.replace(/[\\/]/g, '_').replace('.ts', '.compiled.ts');
                        const cachePath = path.join(cacheDir, fileName);
                        
                        fs.writeFileSync(cachePath, compiledCode);

                        return {
                            code: compiledCode,
                            map: null
                        };
                    }
                } catch (err: any) {
                    console.error(`[AC Compiler] Error compiling ${id}:`, err.message);
                }
            }
        }
        return null;
    };

    return {
        name: 'ac-runtime-compiler',
        enforce: 'pre',
        
        configResolved(config) {
            projectRoot = config.root;
            
            // Pre-compile all components on startup
            const srcDir = path.join(projectRoot, 'src');
            if (fs.existsSync(srcDir)) {
                console.log(`[AC Compiler] Pre-compiling components in ${srcDir}...`);
                const scan = (dir: string) => {
                    fs.readdirSync(dir).forEach(file => {
                        const fullPath = path.join(dir, file);
                        if (fs.statSync(fullPath).isDirectory()) {
                            scan(fullPath);
                        } else if (file.endsWith('.ts') && !file.endsWith('.compiled.ts')) {
                            const code = fs.readFileSync(fullPath, 'utf8');
                            if (code.includes('@AcElement')) {
                                doTransform(code, fullPath);
                            }
                        }
                    });
                };
                scan(srcDir);
            }
        },

        configureServer(server) {
            server.watcher.add(path.join(projectRoot, 'src/**/*.ts'));
            server.watcher.on('change', async (file) => {
                if (file.endsWith('.ts') && !file.endsWith('.compiled.ts')) {
                    const code = fs.readFileSync(file, 'utf8');
                    if (code.includes('@AcElement')) {
                        console.log(`[AC Compiler] File changed, re-compiling: ${path.basename(file)}`);
                        await doTransform(code, file);
                        server.ws.send({ type: 'full-reload' });
                    }
                }
            });
        },

        async transform(code, id) {
            return doTransform(code, id);
        }
    };
}
