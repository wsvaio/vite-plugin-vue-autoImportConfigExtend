# vite-plugin-vue-autoimportconfigextend
1. 安装🤨
```
npm i unplugin-auto-import vite-plugin-vue-autoimportconfigextend
```

2. 配置😮

```typescript
// viteConfig.ts
...
import AutoImport from 'unplugin-auto-import/vite';
import importsListen, { imports } from "vite-plugin-vue-autoimportconfigextend"
...
{
  ...
  plugins: [
    ...
    // api 自动引入
    AutoImport({
      dts: true,
      imports: imports(
        "vue", "vue-router", "pinia", "@vueuse/core", "vitest",
        // src 下 apis 文件夹中 以 index.ts 开头的文件内 所有export自动引入
        { target: "apis", prefix: "index.ts" },
        // src 下 utils 文件夹中 所有直接子ts文件内 所有export自动引入
        { target: "utils" },
      ),
      resolvers: [

      ]
    }),
    // 监听imports配置的路径文件变化，触发服务重启（重新生成声明文件）
    importsListen(),
    ...
  ]

  ...
}

// imports config
export interface dirImportOpts {
  alias?: string, // 导入的路径别名
  target: string; // 导入的路径 只能是src目录下的
  prefix?: string; // 导入文件的前缀过滤
  suffix?: string; // 导入文件的后缀过滤
  include?: string[]; // 导入的文件
  exclude?: string[]; // 不导入的文件
}


```

3. 使用🙃

```typescript
// utils/xxx.ts
export const hello = () => console.log("Hello World");
```

```html
<!-- xxx.vue -->
<script lang="ts" setup>

function handlerClick() {
  hello(); // 无需引入直接调用；并且有全局提示
}
</script>

<template>
  <button @click="handlerClick"></button>
</tempalte>

<style>
/* ... */
</style>

```

## 注意😱
1. 不支持文件内导出的其它文件的导出😵；比如：
```typescript
// 不支持
export * from "xxx"
export { default as xxx } from "xxx"
// 支持
export const xxx = "xxx"/()=>{};
export let xxx = "xxx"/()=>{};
export function xxx() {};
export default "xxx"/()=>{}; // default的导出会分配该文件名为导出名
```
2. ❗❗❗❗如果有重复的导出名会报错