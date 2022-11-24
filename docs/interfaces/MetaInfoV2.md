[torrefy](../README.md) / [Exports](../modules.md) / MetaInfoV2

# Interface: MetaInfoV2

v2 meta info

## Hierarchy

- [`MetaInfoBase`](MetaInfoBase.md)

  ↳ **`MetaInfoV2`**

## Table of contents

### Properties

- [announce](MetaInfoV2.md#announce)
- [announce-list](MetaInfoV2.md#announce-list)
- [comment](MetaInfoV2.md#comment)
- [created by](MetaInfoV2.md#created by)
- [creation date](MetaInfoV2.md#creation date)
- [info](MetaInfoV2.md#info)
- [piece layers](MetaInfoV2.md#piece layers)

## Properties

### announce

• `Optional` **announce**: `string`

The URL of the tracker

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=the%20following%20keys%3A-,announce,-The%20URL%20of)
|
[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=the%20following%20keys%3A-,announce,-The%20URL%20of)

#### Inherited from

[MetaInfoBase](MetaInfoBase.md).[announce](MetaInfoBase.md#announce)

#### Defined in

[src/create.ts:338](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L338)

___

### announce-list

• `Optional` **announce-list**: `string`[][]

This key will refer to a list of lists of URLs,
and will contain a list of tiers of announces

[BEP 12](http://bittorrent.org/beps/bep_0012.html#:~:text=This%20key%20will%20refer%20to%20a%20list%20of%20lists%20of%20URLs%2C%20and%20will%20contain%20a%20list%20of%20tiers%20of%20announces)

#### Inherited from

[MetaInfoBase](MetaInfoBase.md).[announce-list](MetaInfoBase.md#announce-list)

#### Defined in

[src/create.ts:345](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L345)

___

### comment

• `Optional` **comment**: `string`

Free-form textual comments of the author

[BitTorrent Specification](https://courses.edsa-project.eu/pluginfile.php/1514/mod_resource/content/0/bitTorrent_part2.htm#:~:text=00%3A00%20UTC%29-,comment,-%3A%20%28optional%29%20free%2Dform)

#### Inherited from

[MetaInfoBase](MetaInfoBase.md).[comment](MetaInfoBase.md#comment)

#### Defined in

[src/create.ts:351](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L351)

___

### created by

• `Optional` **created by**: `string`

Name and version of the program used to create the .torrent

[BitTorrent Specification](https://courses.edsa-project.eu/pluginfile.php/1514/mod_resource/content/0/bitTorrent_part2.htm#:~:text=the%20author%20%28string%29-,created%20by,-%3A%20%28optional%29%20name%20and)

#### Inherited from

[MetaInfoBase](MetaInfoBase.md).[created by](MetaInfoBase.md#created by)

#### Defined in

[src/create.ts:357](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L357)

___

### creation date

• `Optional` **creation date**: `number`

The creation time of the torrent,
in standard UNIX epoch format

[BitTorrent Specification](https://courses.edsa-project.eu/pluginfile.php/1514/mod_resource/content/0/bitTorrent_part2.htm#:~:text=is%20here.-,creation%20date,-%3A%20%28optional%29%20the%20creation)

#### Inherited from

[MetaInfoBase](MetaInfoBase.md).[creation date](MetaInfoBase.md#creation date)

#### Defined in

[src/create.ts:364](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L364)

___

### info

• **info**: [`InfoV2`](InfoV2.md)

#### Defined in

[src/create.ts:378](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L378)

___

### piece layers

• `Optional` **piece layers**: [`PieceLayers`](../modules.md#piecelayers)

#### Defined in

[src/create.ts:379](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L379)
