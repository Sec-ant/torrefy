[torrefy](../README.md) / [Exports](../modules.md) / FilePropsV2

# Interface: FilePropsV2

v2 file props

## Hierarchy

- `FilePropsBase`

  ↳ **`FilePropsV2`**

## Table of contents

### Properties

- [attr](FilePropsV2.md#attr)
- [length](FilePropsV2.md#length)
- [pieces root](FilePropsV2.md#pieces root)

## Properties

### attr

• `Optional` **attr**: [`FileAttrs`](../modules.md#fileattrs)

A variable-length string. When present,
the characters each represent a file attribute:
```
l = symlink
x = executable
h = hidden
p = padding file
```
[BEP 47](https://www.bittorrent.org/beps/bep_0047.html#:~:text=20%20bytes%3E%2C%0A%20%20%20%20...%0A%20%20%7D%2C%0A%20%20...%0A%7D-,attr,-A%20variable%2Dlength)

#### Inherited from

FilePropsBase.attr

#### Defined in

[src/utils/fileTree.ts:75](https://github.com/Sec-ant/bepjs/blob/9d6a68a/src/utils/fileTree.ts#L75)

___

### length

• **length**: `number`

Length of the file in bytes

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=the%20following%20keys%3A-,length,-%2D%20The%20length%20of)
|
[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=pieces%20root32%3Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaeeeeeee-,length,-Length%20of%20the)

#### Inherited from

FilePropsBase.length

#### Defined in

[src/utils/fileTree.ts:63](https://github.com/Sec-ant/bepjs/blob/9d6a68a/src/utils/fileTree.ts#L63)

___

### pieces root

• `Optional` **pieces root**: `ArrayBuffer`

For **non-empty** files this is the the root hash
of a merkle tree with a branching factor of 2,
constructed from 16KiB blocks of the file

[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=any%20sibling%20entries.-,pieces%20root,-For%20non%2Dempty)

#### Defined in

[src/utils/fileTree.ts:102](https://github.com/Sec-ant/bepjs/blob/9d6a68a/src/utils/fileTree.ts#L102)
