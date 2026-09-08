"""The generated SF-424's XML mapping against SF424_4_0-V4.0.xsd.

Written to the schema rather than transcribed from the form it mirrors, which is the
difference from `sf424.py`: every element the XSD declares has a source, in sequence order,
every response field reaches one, and no field permits a value its element cannot carry.

No recorded gaps. The registers are empty because there is nothing to explain, which is
the whole claim -- and the checks fail rather than pass if that stops being true.
"""

from ..mapping import WireMapping

MAPPING = WireMapping(module="sf424_portable")
