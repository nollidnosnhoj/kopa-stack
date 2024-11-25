import { execSync } from "node:child_process";
import type { PlopTypes } from "@turbo/gen";

interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("init", {
    description: "Generate a new package for the Kopa Monorepo",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "What is the name of the package? (You can skip the `@kopa/` prefix)",
      },
      {
        type: "input",
        name: "deps",
        message:
          "Enter a space separated list of dependencies you would like to install",
      },
      {
        type: "input",
        name: "devdeps",
        message:
          "Enter a space separated list of dev dependencies you would like to install",
      },
    ],
    actions: [
      (answers) => {
        if ("name" in answers && typeof answers.name === "string") {
          if (answers.name.startsWith("@kopa/")) {
            answers.name = answers.name.replace("@kopa/", "");
          }
        }
        return "Config sanitized";
      },
      {
        type: "add",
        path: "packages/{{ name }}/package.json",
        templateFile: "templates/package.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/tsconfig.json",
        templateFile: "templates/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ name }}/src/index.ts",
        template: "// insert your code here",
      },
      {
        type: "modify",
        path: "packages/{{ name }}/package.json",
        async transform(content, answers) {
          if (
            (!("deps" in answers) || typeof answers.deps !== "string") &&
            (!("devdeps" in answers) || typeof answers.devdeps !== "string")
          ) {
            return content;
          }

          if (!validateAnswers(answers)) {
            return content;
          }

          const pkg = JSON.parse(content) as PackageJson;

          if ("deps" in answers && typeof answers.deps === "string") {
            for (const dep of answers.deps.split(" ").filter(Boolean)) {
              await addDependency(dep, "dependencies", pkg);
            }
          }

          if ("devdeps" in answers && typeof answers.devdeps === "string") {
            for (const dep of answers.devdeps.split(" ").filter(Boolean)) {
              await addDependency(dep, "devDependencies", pkg);
            }
          }

          sortDependencies(pkg);

          return JSON.stringify(pkg, null, 2);
        },
      },
      async (answers) => {
        /**
         * Install deps and format everything
         */
        if ("name" in answers && typeof answers.name === "string") {
          // execSync("pnpm dlx sherif@latest --fix", {
          //   stdio: "inherit",
          // });
          execSync("pnpm i", { stdio: "inherit" });
          execSync(`pnpm biome format --write packages/${answers.name}/**`);
          return "Package formated";
        }
        return "Package not formated";
      },
    ],
  });
}

function validateAnswers(answers: Record<string, any>) {
  if ("deps" in answers && typeof answers.deps === "string") {
    return true;
  }
  if ("devdeps" in answers && typeof answers.devdeps === "string") {
    return true;
  }
  return false;
}

async function addDependency(
  dep: string,
  type: Extract<keyof PackageJson, "dependencies" | "devDependencies">,
  pkg: PackageJson
) {
  const version = await fetch(
    `https://registry.npmjs.org/-/package/${dep}/dist-tags`
  )
    .then((res) => res.json())
    .then((json) => json.latest);

  if (!pkg[type]) pkg[type] = {};
  pkg[type][dep] = `^${version}`;
}

function sortDependencies(pkg: PackageJson) {
  if (pkg.dependencies) {
    pkg.dependencies = Object.fromEntries(
      Object.entries(pkg.dependencies).sort((a, b) => a[0].localeCompare(b[0]))
    );
  }
  if (pkg.devDependencies) {
    pkg.devDependencies = Object.fromEntries(
      Object.entries(pkg.devDependencies).sort((a, b) =>
        a[0].localeCompare(b[0])
      )
    );
  }
}
