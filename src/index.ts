import { readFileSync, readdirSync } from "fs";
import { ImportNameAlias, ImportsMap, PresetName } from "unplugin-auto-import/types";
// import { Plugin } from "vite";

export interface dirImportOpts {
  alias?: string, // 导入的路径别名
  target: string; // 导入的路径
  prefix?: string; // 导入文件的前缀过滤
  suffix?: string; // 导入文件的后缀过滤
  include?: string[]; // 导入的文件
  exclude?: string[]; // 不导入的文件
}

const paths: string[] = [];

export const imports = (...options: (dirImportOpts | PresetName)[]): (ImportsMap | PresetName)[] => {

  const importMap: ImportsMap = {};
  const presetNames: PresetName[] = [];

  for (const opt of options) {

    if (typeof opt == "string") {
      presetNames.push(opt);
      continue;
    }


    const { target, alias = "@", include = [], exclude = [], prefix = "", suffix = "" } = opt;

    // 添加 过滤 要导入的文件至include
    include.push(...readdirSync(`src/${target}`).filter(
      item => !exclude.includes(item)
        && item.startsWith(prefix)
        && item.endsWith(suffix + ".ts"))
    );

    // 解析所有文件的所有默认导出和普通导出
    for (const item of include) {
      const path = `src/${target}/${item}`;
      paths.push(path);
      const file = readFileSync(path);
      const content = new TextDecoder().decode(file);
      // const regExp = /^export\s+(\w+)\s+([\w\{\}\,\s]+)?\(?/gmsi;
      const regExp = /^export\s+(\w*)\s*(\{?[\w,\d\s]*\}?)[\s(]/gmsi;
      const matches = content.matchAll(regExp);
      const result: (string | ImportNameAlias)[] = [];
      for (const [, key, name] of matches) {
        if (key == "default") {
          const pathSplit = `${target}/${item}`.replace(".ts", "").split("/").reverse();
          const defaultName = pathSplit[0] == "index" ? pathSplit[1] : pathSplit[0];
          result.push(["default", defaultName]);
        }
        else if (["const", "let", "function", ""].includes(key)) {
          name.startsWith("{")
            ? result.push(...name.replaceAll(/[,{}]|(default|[\w\d]+) as /g, "").trim().split(/[\s]/))
            : result.push(name.trim());
        }
        else {
          
          console.log(key, name, "🐔");
        }
      }

      importMap[`${alias}/${target}/${item}`.replace(".ts", "")] = result;
    }
  }

  return [importMap, ...presetNames];
};


// 如果修改了需要自动导出的文件，重启服务器（auto-import.d.ts才会更新）
export default () => {
  return {
    name: "plugin-vue:importsListen",
    enforce: "post",
    handleHotUpdate({ file, server }) {
      for (const path of paths) file.endsWith(path) && server.restart();
    },
  };

};

