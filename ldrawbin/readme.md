# JSON and Binary LDraw File Format

## Overview

This project proposes a binary file format to provide a self-contained, efficient, and standardized format for
representing the LDraw files in a binary form.

It will not replace the existing LDraw text file format, but rather provide an alternative for applications that require
faster loading and reduced file size.

The binary format will be designed to be backward compatible with the existing text format, allowing for easy conversion
between the two formats.

## Phase 01: Create Files Index

The script create a map between all files and their id (auto incrementing integer).

```shell
tsx ldrawbin/01-create-files-index.mts > ldrawdb/index.json
```

## Phase 02: Create Reverse Index

Index that map ID to file path.

```shell
tsx ldrawbin/02-create-inverse-files-index.mts > ldrawdb/rindex.json
```

## Phase 03: Create Colors Index

```shell
tsx ldrawbin/03-create-colors.mts > ldrawdb/colors.json
```

## Phase 02: Convert Existing LDraw Files to JSON

In order to facilitate the design of the binary file format, we will first convert the existing LDraw files into a
structured JSON format. This will allow us to analyze the data and identify patterns that can be optimized in the binary
format.

The JSON file will contain only the necessary information from the LDraw files, such as part definitions, geometry, and
metadata, while excluding any redundant or non-essential information.

Currently, support lines of type 1, 3, 4.

```shell
tsx tools/03-database-to-json.mts
```

## Phase 03: Binary File Format

Each JSON file will be converted into a binary file using the following structure:

- Each line starts with identifier of the line type.
- Each line type has a specific structure and data format, which will be defined in the specification.
- Each line is a series of numbers.


