# TheWayOfTheDodo
A Js13KGames 2024 entry

## Game origins

I first explored the idea of a one button platformer some 15 years ago in a GameMaker8.1 demo.

I've often though about remaking it in a more contemporary and polished version.

The flapping mechanic was inspired by the old arcade game BombJack.

Originally I thought about making the game as MAGA-man and have a pixelated Trump jump around ... with his red hat he is such a Mario-like character ... but luckily I changed my mind :)

And, yes, the "fear of 13"-theme is rather forced into it.  I'm all about game play.


## The Song of the Dodo

Brief notes on how the procedurally generated music is done.

- All the music code is in "src/js/music.js"
- All music is stored in simple arrays with either:
  - The half note number: 0 is C, 1 is C#, 2 is D, etc.  And 12 is C an octave above.
  - Or "undefined" denoting a pause.  Here written as a lowercase p.
- All notes are 1/8 long and can only be played on beat or off-beat.  No triples or other fancy stuff.
- All songs are 8 bars long.

### The melody

All melody notes are taken from a set of two octaves of the major pentatonic scale: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24]

(0 is C0, 12 i C1 and 24 is C2)

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

- Mutating a number of notes.  A mutated note is either the note above or below in the scale.

When mutating the parts of the melody I do 5 swaps and 3 mutations.  

This I found made the mutated melodies interestingly different but still recognizable.

### Bass and chords
All chord progressions always start on the scale root (0).

From there on the chords are randomly the root, the 4'th or the 5'th of the minor pentatonic.  In practice these notes: [0, 5, 7]

Each chord is repeated for two bars.

(Eg. a rather good/lucky chord progression could be [0, 0, 0, 0, 5, 5, 7, 7].)

The bass plays power chords (chord root & chord root + 7).

All bass bars has the same random two bar rhythm.


### Misc music stuff

- A random number generator is seeded with the level number, so each level has it's own "random" music.

- The parameters for the instruments (bass, bass drum, snare, lead and crash) are also randomly mutated (+/- 50%).

- On the win screen you can (on desktop) select music with page up and down.  

- A crash is played when each of the four part starts (first is loud).

- Playing (major) pentatonic notes over these simple power chords is very much how blues music works.  I could also have used the minor pentatonic scale, but for this game I preferred the more happy sound of the major scale.

## Old fart jokes and references

- The design of the dodo was inspired by the dodo from the wonderful classic dutch comic book "Douwe Dabbert" ("Gammelpot" in danish)

- "The Way of the Dodo": A mix of "Going the way of the dodo" aka going extinct and "The Way of the Exploding Fist" an old karate game from the 80s.  I love the idea of a martial arts style based on dodos :D

- "Enter the Dodo Dojo": A mix of "Enter the dragon" (the Bruce Lee movie) and "Mojo Dojo" (the main villain from "The Power Puff Girls") ... also it just sounds fun :)

- "13 Chambers of Fowl Play": A mix of Wu Tang Clans debut album subtitle "36 chambers" ... and of cause ye ole fowl/foul word play.  

- Fun side note: in danish we have the exact same word play with "fugl" and "ful" ... they sound the same and they mean bird/fowl and foul.  

- The death scene: Inspired by the Monty Python foot of death - which was also used in the death scene of the old ZX Spectrum platformer game "Jet Set Willy".

- "Be Free Bird !": A ref to the song "Free Bird" by the classic rock band "Lynyrd Skynyrd"


