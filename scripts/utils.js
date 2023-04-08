

function choice(list) {
    return list[Math.floor(Math.random()*list.length)];
}

function takeRandom(list) {
    const element = choice(list);
    const index = list.indexOf(element);
    list.splice(index, 1); 
    return element;
}