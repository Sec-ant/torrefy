export type FileDirLike = FileSystemHandle | FileSystemEntry | File;

export type FileDirLikes = Iterable<FileDirLike> | AsyncIterable<FileDirLike>;

export function isFile(fileDirLike: FileDirLike): fileDirLike is File {
  return fileDirLike instanceof File;
}

export function isFileSystemDirectoryEntry(
  fileDirLike: FileDirLike
): fileDirLike is FileSystemDirectoryEntry {
  return (
    !isFileSystemDirectoryHandle(fileDirLike) &&
    !isFile(fileDirLike) &&
    fileDirLike.isDirectory
  );
}

export function isFileSystemFileEntry(
  fileDirLike: FileDirLike
): fileDirLike is FileSystemFileEntry {
  return (
    !isFileSystemDirectoryHandle(fileDirLike) &&
    !isFile(fileDirLike) &&
    fileDirLike.isFile
  );
}

export function isFileSystemDirectoryHandle(
  fileDirLike: FileDirLike
): fileDirLike is FileSystemDirectoryHandle {
  try {
    if (
      fileDirLike instanceof FileSystemHandle &&
      fileDirLike.kind === "directory"
    ) {
      return true;
    }
  } catch {
    /* empty */
  }
  return false;
}

export function isFileSystemFileHandle(
  fileDirLike: FileDirLike
): fileDirLike is FileSystemFileHandle {
  try {
    if (
      fileDirLike instanceof FileSystemHandle &&
      fileDirLike.kind === "file"
    ) {
      return true;
    }
  } catch {
    /* empty */
  }
  return false;
}

function readBatchOfEntries(
  dirReader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => {
    dirReader.readEntries(resolve, reject);
  });
}

export async function* getEntriesOfDirEntry(
  dirEntry: FileSystemDirectoryEntry
) {
  const dirReader = dirEntry.createReader();
  let batchesOfEntries: FileSystemEntry[] = [];
  do {
    batchesOfEntries = await readBatchOfEntries(dirReader);
    for (const entry of batchesOfEntries) {
      yield entry;
    }
  } while (batchesOfEntries.length > 0);
}

export function getFileOfFileEntry(
  fileSystemFileEntry: FileSystemFileEntry
): Promise<File> {
  return new Promise((resolve, reject) => {
    fileSystemFileEntry.file(resolve, reject);
  });
}
