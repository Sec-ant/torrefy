[torrefy](../README.md) / [Exports](../modules.md) / FilePropsV1

# Interface: FilePropsV1

v1 file props

## Hierarchy

- [`FilePropsBase`](FilePropsBase.md)

  ↳ **`FilePropsV1`**

## Table of contents

### Properties

- [attr](FilePropsV1.md#attr)
- [length](FilePropsV1.md#length)
- [path](FilePropsV1.md#path)

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

[FilePropsBase](FilePropsBase.md).[attr](FilePropsBase.md#attr)

#### Defined in

[src/utils/fileTree.ts:76](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L76)

___

### length

• **length**: `number`

Length of the file in bytes

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=the%20following%20keys%3A-,length,-%2D%20The%20length%20of)
|
[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=pieces%20root32%3Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaeeeeeee-,length,-Length%20of%20the)

#### Inherited from

[FilePropsBase](FilePropsBase.md).[length](FilePropsBase.md#length)

#### Defined in

[src/utils/fileTree.ts:64](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L64)

___

### path

• **path**: `string`[]

A list of UTF-8 encoded strings
corresponding to **subdirectory** names

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=file%2C%20in%20bytes.-,path,-%2D%20A%20list%20of)

#### Defined in

[src/utils/fileTree.ts:89](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L89)
