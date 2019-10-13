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
// let longest_word = 27;
let longest_word = 27;

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
  for (i = 0; i < acting_rectangle.length; i++) {
    acting_array = acting_rectangle[i];
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
  }

  return possible_rectangle;
}

const getStartRowIndex = (possible_rectangles) => {
  for (var l = 0; l < possible_rectangles[0].length; l++) {
    if (typeof (possible_rectangles[0][l]) === "object") {
      return l;
    }
  }

  return -1;
}

const generateWordRectangle = (possible_rectangles, x_word_array, y_word_array, possible_word_length) => {
  // what's the first row that we haven't solved for yet?
  start_row_index = getStartRowIndex(possible_rectangles)

  // if we somehow make it all the way down and every word is locked in, we have a word square!!! return it.
  if (start_row_index === -1) {
    return possible_rectangles
  }

  // make a list of possible words that will fit in this row.
  this_row_words = [...x_word_array];

  // get this row's exact testing conditions. [["a"], ["b", "c"], ["d", "e"]]
  testing_row = possible_rectangles.map(row => row[start_row_index])
  // does any word fit?
  this_row_words = this_row_words.filter(word => {
    var word_letters = [...word]

    for (k = 0; i < word_letters.length; k++) {
      var word_letter = word_letters[k];

      if (!testing_row[k].includes(word_letter)) {
        return false;
      }
    }

    return true;
  })

  // do we not have any word candidate for this row?  if not, go on to the next word.
  if (!this_row_words.length) {
    return false;
  }

  // for each word that will fit in this row...
  for (j = 0; j < this_row_words.length; j++) {
    row_candidate = this_row_words[j]

    // filter out our possible letters in the next rows based on the words remaining in each column.
    row_candidate_letters = [...row_candidate];
    var acting_possible_rectangles = [...possible_rectangles];
    acting_possible_rectangles = acting_possible_rectangles.map(_ => [..._])
    row_candidate_letters.forEach((row_candidate_letter, index) => {
      acting_possible_rectangles[index][start_row_index] = row_candidate_letter;
    })

    // generate the list of first letters [ [ 'a', [], [] ], [ 'a' ], [ 'h' ] ]
    var first_letter_list = []
    acting_possible_rectangles.forEach(row => {
      this_column = '';
      row.forEach(column => {
        if (typeof (column) === "string") {
          this_column += column
        }
      })
      if (this_column) {
        first_letter_list.push(this_column)
      }
    })


    // if we run into any square that is now an array that is the length of zero, go on to the next word.
    acting_possible_rectangles = generatePossibleRectangles(possible_word_length, first_letter_list);

    // step down if there's not a possible rectangle for this word length.
    if (!acting_possible_rectangles) {
      continue;
    }

    // if we made it this far, recursively call generateWordRectangle with our new, locked-in word.  if that fails, go on to the next word.
    return generateWordRectangle(acting_possible_rectangles, x_word_array, y_word_array, possible_word_length)
  }

  // if we've run out of words, return false so we can move on to the next possible rectangle.
  return false;
}

for (word_length = longest_word; word_length > 2; word_length--) {
  // console.log(word_length + " ACROSS")
  // create an array of our possible seed words of this current length.
  let x_word_array = wordArray.filter(word => word.length === word_length);

  // do we have more than one word of this length?
  if (x_word_array.length < 2) {
    console.log(`Seed word array length was ` + x_word_array.length + ` for size ` + word_length)
    continue;
  }
  // for every word in this list — our seed word...
  // refactor this to create a dictionary of long words
  for (y_word_length = word_length; y_word_length > 2; y_word_length--) {
    // console.log(y_word_length + " DOWN")
    // console.log(Math.pow(x_word_array.length, word_length) + ' permutations at this stage')
    x_word_array.forEach(seed_word => {
      // generate our 3d array of locked-in rectangle.
      result_rectangle = [...seed_word].map(seed_word_letter => [seed_word_letter])

      // are there words of equal length that exist which start with our first n letters?  If not, no rectangle can exist.
      // start with the largest possible equal length.
      // for (possible_word_length = longest_word; possible_word_length > 2; possible_word_length--) {
      // find any permissable letters in a grid for this length
      var possible_rectangles = generatePossibleRectangles(y_word_length, result_rectangle);

      // step down if there's not a possible rectangle for this word length.
      if (!possible_rectangles) {
        return;
      }

      // this is not great design, but we need to generate our y word array based on the length of our possible rectangle...
      // y_word_array_len = possible_rectangles[0].length;
      y_word_array = wordArray.filter(word => word.length === y_word_length)

      // now we have a single possible rectangle, it's time to see if there's a series of words that will fit in it.
      var word_rectangle = generateWordRectangle(possible_rectangles, x_word_array, y_word_array, y_word_length);

      // does a grid exist which satisfies this set of letters? if so, it's one of the longest grids.
      if (word_rectangle) {
        word_rectangle.forEach(word => {
          console.log(word.join(''))
        })
        console.log("---------")
      }
    })
  }
}
