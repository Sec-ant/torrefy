import { populateFileTree } from "./src/index.js";

const singleFileInput =
  document.querySelector<HTMLInputElement>("#single-file-input");
if (singleFileInput) {
  singleFileInput.onchange = onFileInputChange;
}

const mutiFileInput =
  document.querySelector<HTMLInputElement>("#multi-file-input");
if (mutiFileInput) {
  mutiFileInput.onchange = onFileInputChange;
}

const webkitDirectoryFileInput = document.querySelector<HTMLInputElement>(
  "#webkitdirectory-file-input"
);
if (webkitDirectoryFileInput) {
  webkitDirectoryFileInput.onchange = onFileInputChange;
}

async function onFileInputChange(event: Event) {
  const inputElement = event.currentTarget as HTMLInputElement;
  const { files } = inputElement;
  if (!files || files.length === 0) {
    return;
  }
  const { fileTree, traverseTree, totalFileSize, totalFileCount } =
    await populateFileTree(files);
  console.log(inputElement.id);
  console.log({
    fileTree,
    traversal: [...traverseTree(fileTree)],
    totalFileSize,
    totalFileCount,
  });
}
