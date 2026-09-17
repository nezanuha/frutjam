/**
 * Lets doc pages write <Snippet> code as ordinary fenced code blocks:
 *
 *   <Snippet>
 *
 *   ```html
 *   <div class="accordion">...</div>
 *   ```
 *
 *   ```jsx
 *   <div className="accordion">...</div>
 *   ```
 *
 *   </Snippet>
 *
 * One fence is a plain code block in that language (the `code` + `lang` props).
 * Several fences, or a `tabs` attribute, are framework tabs: the fence
 * language picks the tab. The fences become the component's string props, so
 * Snippet.astro renders exactly what it did when the code was passed inline.
 */

/** Fence language → framework tab prop. */
export const TAB_LANGS = {
  html: 'html',
  css: 'css',
  js: 'js',
  javascript: 'js',
  jsx: 'react',
  react: 'react',
  vue: 'vue',
  svelte: 'svelte',
  angular: 'angular',
};

const attr = (name, value) => ({ type: 'mdxJsxAttribute', name, value });

function convert(node, file) {
  const fences = node.children.filter((child) => child.type === 'code');
  const others = node.children.filter((child) => child.type !== 'code');
  if (!fences.length) return;
  const where = `${file.path}:${node.position?.start.line}`;
  if (others.length) throw new Error(`${where}: <Snippet> may only contain fenced code blocks`);

  const tabsIndex = node.attributes.findIndex((a) => a.type === 'mdxJsxAttribute' && a.name === 'tabs');
  const tabs = fences.length > 1 || tabsIndex !== -1;
  if (tabsIndex !== -1) node.attributes.splice(tabsIndex, 1);

  if (!tabs) {
    const [fence] = fences;
    node.attributes.push(attr('code', fence.value));
    if (fence.lang && fence.lang !== 'html') node.attributes.push(attr('lang', fence.lang));
  } else {
    for (const fence of fences) {
      const prop = TAB_LANGS[fence.lang ?? ''];
      if (!prop) {
        throw new Error(`${where}: unknown snippet tab \`${fence.lang ?? ''}\` (use ${Object.keys(TAB_LANGS).join(', ')})`);
      }
      node.attributes.push(attr(prop, fence.value));
    }
  }
  node.children = [];
}

export default function remarkSnippetFences() {
  return (tree, file) => {
    const walk = (node) => {
      if (node.type === 'mdxJsxFlowElement' && node.name === 'Snippet') convert(node, file);
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
