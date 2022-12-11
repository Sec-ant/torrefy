import { populateFileTree } from "./src/index.js";

const testFile = new File(
  ["Hello world. This is a test file"],
  "test-file.txt",
  {}
);

const { fileTree, traverseTree, totalFileSize, totalFileCount } =
  await populateFileTree([testFile, testFile]);

const nodes = traverseTree(fileTree);

for (const node of nodes) {
  console.log(node);
}
