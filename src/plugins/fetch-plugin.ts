import * as esbuild from 'esbuild-wasm';
import localForage from 'localforage';
import axios from 'axios';
const fileCache = localForage.createInstance({ name: 'filecache' });
export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      build.onLoad({ filter: /.*/ }, async (args: any) => {
        console.log('onLoad', args);

        if (args.path === 'index.js') {
          return {
            loader: 'jsx',
            contents: inputCode,
          };
        }

        // const item = await fileCache.getItem<esbuild.OnLoadResult>(args.path);
        // if (item) {
        //   return item;
        // }
        const { data, request } = await axios.get(args.path);
        const fileType = args.path.match(/.css$/) ? 'css' : 'jsx';
        const escaped = data
          .replace(/\n/g, '')
          .replace(/"/g, '\\"')
          .replace(/'/g, "\\'");
        const contents =
          fileType === 'css'
            ? `
        const style = document.createElement('style');
        style.innerText = '${escapedGetIv.}';
        document.head.appendChild(style);
        `
            : data;
        const result: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents,
          resolveDir: new URL('./', request.responseURL).pathname,
        };
        await fileCache.setItem(args.path, result);
        return result;
      });
    },
  };
};
