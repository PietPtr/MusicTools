
// Randomness
function randint(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function choice(list) {
    return list[Math.floor(Math.random()*list.length)];
}

function takeRandom(list) {
    const element = choice(list);
    const index = list.indexOf(element);
    list.splice(index, 1); 
    return element;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); 
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Array helpers
const rotateArray = (arr, n) => [...arr.slice(n), ...arr.slice(0, n)];

function scanl(fn, initial, list) {
    const result = [initial];
    
    for (let i = 0; i < list.length; i++) {
      const accumulator = fn(result[i], list[i]);
      result.push(accumulator);
    }
    
    return result;
}
  
const plus = (a, b) => a + b;