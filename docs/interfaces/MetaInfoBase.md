[torrefy](../README.md) / [Exports](../modules.md) / MetaInfoBase

# Interface: MetaInfoBase

base meta info

## Hierarchy

- [`BObject`](../modules.md#bobject)<``false``\>

  ↳ **`MetaInfoBase`**

  ↳↳ [`MetaInfoV1`](MetaInfoV1.md)

  ↳↳ [`MetaInfoV2`](MetaInfoV2.md)

  ↳↳ [`MetaInfoHybrid`](MetaInfoHybrid.md)

## Table of contents

### Properties

- [announce](MetaInfoBase.md#announce)
- [announce-list](MetaInfoBase.md#announce-list)
- [comment](MetaInfoBase.md#comment)
- [created by](MetaInfoBase.md#created by)
- [creation date](MetaInfoBase.md#creation date)

## Properties

### announce

• `Optional` **announce**: `string`

The URL of the tracker

[BEP 3](https://www.bittorrent.org/beps/bep_0003.html#:~:text=the%20following%20keys%3A-,announce,-The%20URL%20of)
|
[BEP 52](https://www.bittorrent.org/beps/bep_0052.html#:~:text=the%20following%20keys%3A-,announce,-The%20URL%20of)

#### Defined in

[src/create.ts:338](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L338)

___

### announce-list

• `Optional` **announce-list**: `string`[][]

This key will refer to a list of lists of URLs,
and will contain a list of tiers of announces

[BEP 12](http://bittorrent.org/beps/bep_0012.html#:~:text=This%20key%20will%20refer%20to%20a%20list%20of%20lists%20of%20URLs%2C%20and%20will%20contain%20a%20list%20of%20tiers%20of%20announces)

#### Defined in

[src/create.ts:345](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L345)

___

### comment

• `Optional` **comment**: `string`

Free-form textual comments of the author

[BitTorrent Specification](https://courses.edsa-project.eu/pluginfile.php/1514/mod_resource/content/0/bitTorrent_part2.htm#:~:text=00%3A00%20UTC%29-,comment,-%3A%20%28optional%29%20free%2Dform)

#### Defined in

[src/create.ts:351](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L351)

___

### created by

• `Optional` **created by**: `string`

Name and version of the program used to create the .torrent

[BitTorrent Specification](https://courses.edsa-project.eu/pluginfile.php/1514/mod_resource/content/0/bitTorrent_part2.htm#:~:text=the%20author%20%28string%29-,created%20by,-%3A%20%28optional%29%20name%20and)

#### Defined in

[src/create.ts:357](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L357)

___

### creation date

• `Optional` **creation date**: `number`

The creation time of the torrent,
in standard UNIX epoch format

[BitTorrent Specification](https://courses.edsa-project.eu/pluginfile.php/1514/mod_resource/content/0/bitTorrent_part2.htm#:~:text=is%20here.-,creation%20date,-%3A%20%28optional%29%20the%20creation)

#### Defined in

[src/create.ts:364](https://github.com/Sec-ant/bepjs/blob/f9eb2df/src/create.ts#L364)
