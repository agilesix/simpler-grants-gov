"""The generated SF-424's XML mapping against SF424_4_0-V4.0.xsd.

Written against the schema rather than transcribed from `sf424.py`, so every element the
XSD declares has a source in sequence order, every response field reaches one, and no
field permits a value its element cannot carry.

All registers are empty. The checks fail rather than pass if that stops being true.
"""

from ..harness.form_diff import FormDiff

DIFF = FormDiff(module="sf424_portable")
