#!/usr/bin/perl
use strict;
use warnings;
use JSON::PP;

sub validate_file {
    my ($fname, $expected_count) = @_;

    open my $fh, '<:encoding(UTF-8)', $fname or die "Cannot open $fname: $!";
    local $/;
    my $content = <$fh>;
    close $fh;

    my $data = eval { JSON::PP::decode_json($content) };
    if ($@) {
        print "✗ $fname: JSON Syntax Error: $@\n";
        return 0;
    }

    if (ref($data) eq 'ARRAY' && $expected_count > 0) {
        if (scalar(@$data) == $expected_count) {
            print "✓ $fname: Valid (" . scalar(@$data) . " items)\n";
        } else {
            print "⚠ $fname: Expected $expected_count items, got " . scalar(@$data) . "\n";
        }
    } else {
        print "✓ $fname: Valid\n";
    }
    return 1;
}

chdir('C:/Users/VICTUS-2023/Desktop/Safia') or die "Cannot change directory: $!";

my $all_ok = 1;
$all_ok &= validate_file('data/dishes.json', 44);
$all_ok &= validate_file('data/drinks.json', 0);  # Just check syntax
$all_ok &= validate_file('data/standards.json', 0);

if ($all_ok) {
    print "\n✓ All JSON files are valid!\n";
} else {
    print "\n✗ Some files have errors\n";
    exit 1;
}
