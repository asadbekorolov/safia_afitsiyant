#!/usr/bin/perl
use strict;
use warnings;

local $/;
open(my $fh, '<:encoding(UTF-8)', 'word/document.xml') or die $!;
my $xml = <$fh>;
close($fh);

# Mark image embeds inline before stripping tags
$xml =~ s/<a:blip r:embed="(rId\d+)"[^\/]*\/>/[[IMG:$1]]/g;

# Mark paragraph boundaries
$xml =~ s/<\/w:p>/\n/g;

# Mark tabs and line breaks within runs
$xml =~ s/<w:tab\/>/\t/g;
$xml =~ s/<w:br\s*\/>/\n/g;

# Strip all remaining tags
$xml =~ s/<[^>]+>//g;

# Decode XML entities
$xml =~ s/&amp;/&/g;
$xml =~ s/&lt;/</g;
$xml =~ s/&gt;/>/g;
$xml =~ s/&quot;/"/g;
$xml =~ s/&apos;/'/g;

# Collapse multiple blank lines
$xml =~ s/[ \t]+\n/\n/g;
$xml =~ s/\n{3,}/\n\n/g;

open(my $out, '>:encoding(UTF-8)', 'document.txt') or die $!;
print $out $xml;
close($out);

print "Done. Length: " . length($xml) . "\n";
