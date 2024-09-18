# TheWayOfTheDodo
A Js13KGames 2024 entry


## The Song of the Dodo

Brief notes on how the procedurally generated music is done.

- All the music code is in "src/js/music.js"
- All music is stored in simple arrays with the note numbers: 0 is C, 1 is C#, etc.
- A value of "undefined" is a pause.  Here written as a lowercase p.
- All notes are 1/8 and can only be played on beat or off-beat.  No triples or other fancy stuff.
- All songs are 8 bars long.

### The melody

All melody notes are taken from the major pentatonic scale: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]

All melodies consists of 4 parts:
- Main theme
- Main theme mutated
- Reversed "Main theme mutated" 
- "Main theme mutated" mutated once more

Each part is 2 bars.

Each bar of the main theme has the exact same rhythm.

The main theme always starts on the middle root note, index 5 (note 12).

The note index is repeatedly modified by a random entry from this list: [-2, -1, -1, 0, 0, 0, 0, 1, 1, 2]

So there is a 40% chance of the index staying on the same note, 40% it jumps one up or down and 20% it jumps two notes.

Example:

The one bar rhythm could be: 

	[0, 0, p, p, 0, p, 0, p].

And the two bar main melody could become: 

	[12, 12, p, p, 16, p, 16, p,

	19, 19, p, p, 16, p, 21, p ]

### Mutating music

The mutate function does two things.

- Modify the rhythm by swapping a number of notes with the next.  Either can be a pause.  So, eg. the short melody [4, p, 2] could become either [p, 4, 2] or [4, 2, p] from a single swap.

- Modify the tones by mutating a number of notes.  A mutated tone is either the tone above or below in the scale.

When mutating the parts of the melody I do 5 swaps and 3 mutations.  

This I found made the mutated melodies interestingly different but still recognizable.

### Bass and chords
All chord progressions always start on the scale root (0).

From there on the chords are randomly the root, the 4'th or the 5'th of the minor pentatonic.  In practice these notes: [0, 5, 7]

Each chord is repeated for two bars.


Each bar has the same random bass rhythm.
The bass plays power chords (chord root note + chord root note + 7).

Eg. a rather good/lucky chord progression could be [0, 0, 0, 0, 5, 5, 7, 7].

### Misc stuff

A random number generator is seeded with the level number, so each level has it's own music.

The parameters for the instruments (bass, bass drum, snare, lead and crash) are also randomly mutated (+/- 50%).

On the win screen you can (on desktop) select music with page up and down.  
