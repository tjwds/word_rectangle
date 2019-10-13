/**
 * Word Rectangle
 * Write a program to find the largest possible rectangle of letters such that every row forms a word (reading left to right) and every column forms a word (reading top to bottom). Words should appear in this dictionary: WORD.LST (1.66MB). Heuristic solutions that may not always produce a provably optimal rectangle will be accepted: seek a reasonable tradeoff of efficiency and optimality.
 */

// import word list

const fs = require('fs');

// Returns the path to the word list which is separated by `\n`
const wordListPath = require('word-list');

let wordArray = fs.readFileSync(wordListPath, 'utf8').split('\n');
wordArray = wordArray.sort();

// pre-optimize:  longest set of more than one words is at length of 27.
let longest_word = 27;
// wordArray.forEach(word => {
//   if (word.length > longest_word) {
//     longest_word = word.length;
//   }
// })

// console.log(longest_word)

const conditionalAccessAndAppend = (input_array, x, y, target) => {
  // our 3d-ness might not be 3d enough yet, too. 
  if (typeof (input_array[x]) === "undefined") {
    // this stack overflow seems to be … very wrong.  I don't understand this yet.
    return true;
  }

  // check to see if x, y is a string.  If so, return and don't do anything.
  if (typeof (input_array[x][y]) === "string") {
    return true;
  }
  // check to see if x, y exists in input array.  If not, add empty array there.
  if (typeof (input_array[x][y]) === "undefined") {
    input_array[x][y] = []
  }

  // add our item if it's not already in the array.
  if (!input_array[x][y].includes(target)) {
    input_array[x][y].push(target)
  }

  // we don't actually have to do anything with this var since we're pointing to memory in the array.
  return true;
}


const generatePossibleRectangles = (possible_word_length, result_rectangle) => {
  // this is a doubly nested array, so we need to make sure we're not transacting on it.
  var acting_rectangle = [...result_rectangle];
  var possible_rectangle = [...result_rectangle];
  acting_rectangle = acting_rectangle.map(_ => [..._])
  possible_rectangle = possible_rectangle.map(_ => [..._])

  possible_words = wordArray.filter(word => word.length === possible_word_length)

  // find a possible word for the acting rectangle.  add the word's letters to our acting rectangle.  if no word exists, return false.
  acting_rectangle.forEach(acting_array => {
    // create a vertical testing word.
    vert_test_word = acting_array.join('');
    // does a word exist which starts with that vertical testing word?
    possible_vert_words = possible_words.filter(word => word.startsWith(vert_test_word))
    // if not, return false
    if (!possible_vert_words.length) {
      return false;
    }
    // we now have a list of specific words which _could_ fit in our rectangle with possible_vert_words. pad out our 3d array with letter candidates from these words.
    // add each word's letters to our possible rectangle (if letter does not aleady exist)
    possible_vert_words.forEach((possible_vert_word, x) => {
      possible_vert_word_array = [...possible_vert_word]
      possible_vert_word_array.forEach((possible_vert_letter, y) => {
        conditionalAccessAndAppend(possible_rectangle, x, y, possible_vert_letter)
      })
    })
  })
  return possible_rectangle;
}

for (word_length = longest_word; word_length > 1; word_length--) {
  // create an array of our possible seed words of this current length.
  let seed_word_array = wordArray.filter(word => word.length === word_length);

  // do we have more than one word of this length? 
  if (seed_word_array.length < 2) {
    console.log(`Seed word array length was ` + seed_word_array.length + ` for size ` + word_length)
    continue;
  }
  // for every word in this list — our seed word...
  seed_word_array.forEach(seed_word => {
    // generate our 3d array of locked-in rectangle.
    result_rectangle = [...seed_word].map(seed_word_letter => [seed_word_letter])

    // are there words of equal length that exist which start with our first n letters?  If not, no rectangle can exist.
    // start with the largest possible equal length.
    for (possible_word_length = longest_word; possible_word_length > 1; possible_word_length--) {
      // find any permissable letters in a grid for this length
      var possible_rectangles = generatePossibleRectangles(possible_word_length, result_rectangle);

      // step down if there's not a possible rectangle for this word length.
      if (!possible_rectangles) {
        continue;
      }

      // now we have a single possible rectangle, it's time to see if there's a series of words that will fit in it. 
      // TODO: does a grid exist which satisfies this set of letters? if so, it's one of the longest grids.  If not, step down.
    }
  })

}
