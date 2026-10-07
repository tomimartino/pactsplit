import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
const directory = new URL(
  "../contracts/artifacts/build-info/",
  import.meta.url,
);
const files = (await readdir(directory)).filter(
  (name) => name.endsWith(".json") && !name.endsWith(".output.json"),
);
let build;
for (const file of files) {
  const candidate = JSON.parse(
    await readFile(new URL(file, directory), "utf8"),
  );
  if (candidate.input?.sources?.["project/contracts/PactSplit.sol"])
    build = candidate;
}
if (!build)
  throw new Error("Compile the contract first with npm run contracts:compile.");
await mkdir(new URL("../work/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../work/verification-standard-input.json", import.meta.url),
  JSON.stringify(build.input, null, 2),
);
console.log(
  `Verification JSON: work/verification-standard-input.json\nCompiler: ${build.solcLongVersion}\nContract: project/contracts/PactSplit.sol:PactSplit\nConstructor arguments: none`,
);
