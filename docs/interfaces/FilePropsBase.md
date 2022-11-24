[torrefy](../README.md) / [Exports](../modules.md) / FilePropsBase

# Interface: FilePropsBase

base file props

## Hierarchy

- [`BObject`](../modules.md#bobject)<``false``\>

  ↳ **`FilePropsBase`**

  ↳↳ [`FilePropsV1`](FilePropsV1.md)

  ↳↳ [`FilePropsV2`](FilePropsV2.md)

## Table of contents

### Properties

- [attr](FilePropsBase.md#attr)
- [length](FilePropsBase.md#length)

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

#### Defined in

[src/utils/fileTree.ts:76](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L76)

___

### length

• **length**: `number`

Length of the file in bytes

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=the%20following%20keys%3A-,length,-%2D%20The%20length%20of)
|
[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#upgrade-path:~:text=pieces%20root32%3Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaeeeeeee-,length,-Length%20of%20the)

#### Defined in

[src/utils/fileTree.ts:64](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/utils/fileTree.ts#L64)
