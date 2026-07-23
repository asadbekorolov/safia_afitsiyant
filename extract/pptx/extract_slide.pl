#!/usr/bin/perl
use strict;
use warnings;

my $file = shift @ARGV or die "usage: extract_slide.pl slideN.xml\n";

local $/;
open(my $fh, '<:encoding(UTF-8)', $file) or die $!;
my $xml = <$fh>;
close($fh);

# Mark image embeds inline before stripping tags
$xml =~ s/<a:blip r:embed="(rId\d+)"[^\/]*\/>/[[IMG:$1]]/g;

# Mark paragraph boundaries (drawingml uses <a:p>)
$xml =~ s/<\/a:p>/\n/g;

# Mark line breaks (both self-closing and with child rPr)
$xml =~ s/<a:br[^>]*>.*?<\/a:br>/\n/gs;
$xml =~ s/<a:br[^>]*\/>/\n/g;

# Strip all remaining tags
$xml =~ s/<[^>]+>//g;

# Decode XML entities
$xml =~ s/&amp;/&/g;
$xml =~ s/&lt;/</g;
$xml =~ s/&gt;/>/g;
$xml =~ s/&quot;/"/g;
$xml =~ s/&apos;/'/g;

# Collapse blank lines
$xml =~ s/[ \t]+\n/\n/g;
$xml =~ s/\n{3,}/\n\n/g;

print $xml;
