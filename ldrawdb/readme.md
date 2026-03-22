# LDraw Database in JSON Format

A JSON version of the LDraw parts library, generated from the official LDraw parts list. This file is intended for use
in applications that require a structured representation of the LDraw parts, such as inventory management systems, part
search tools, or educational resources.

The JSON format is designed for view only. All metadata removed from the original LDraw files, and only the necessary
information for part identification and geometry is retained. To keep the files containing only arrays of numbers, the
filename converted into a number and an index file is provided to map the filename to the corresponding number.