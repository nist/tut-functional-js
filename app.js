var beerData = JSON.parse(document.getElementById('beerData').textContent)
var allBeers = beerData.beers
var beerTemplate = document.getElementById('tmpl-beer-groups').textContent
var beerList = document.getElementById('beerList')
var averageAbv = document.getElementById('averageAbv')
var filters = document.getElementById('filters')
var filterLinks = filters.querySelectorAll('a')

var fp = {}

function makeFilter (collection, property) {
  return function (value) {
    return _.filter(collection, function (item) {
      return item[property] === value
    })
  }
}

fp.map = function (collection, callback) {
  var mapped = []
  for (var i = 0; i < collection.length; i++) {
    mapped.push(callback(collection[i]))
  }
  return mapped
}

fp.reduce = function (collection, callback, initial) {
  var last = initial
  for (var i = 0; i < collection.length; i++) {
    last = callback(last, collection[i])
  }
  return last
}

fp.add = function (a, b) {
  return a + b
}

fp.groupBy = function (collection, callback) {
  var grouped = {}
  var groupName
  for (var i = 0; i < collection.length; i++) {
    groupName = callback(collection[i])
    if (!grouped[groupName]) {
      grouped[groupName] = []
    }
    grouped[groupName].push(collection[i])
  }
  return grouped
}

fp.pluck = function (collection, property) {
  return fp.map(collection, function (item) {
    return item[property]
  })
}

fp.mean = function (collection, property) {
  if (property) {
    collection = fp.pluck(collection, property)
  }
  return fp.reduce(collection, fp.add, 0) / collection.length
}

function loadBeers (beers) {
  var beerGroups = fp.groupBy(beers, function (beer) {
    return beer.locale
  })
  beerList.innerHTML = _.template(beerTemplate)({ beers: beerGroups })
  averageAbv.innerHTML = 'Average ABV ' + getAverageAbv(beers) + ' %'
}

function setActiveFilter (active) {
  for (var i = 0; i < filterLinks.length; i++) {
    filterLinks[i].classList.remove('btn-active')
  }

  active.classList.add('btn-active')
}

function roundDecimal (number, places) {
  var factor = Math.pow(10, places)
  return Math.round(number * factor) / factor
}

function getAverageAbv (beers) {
  var mean = fp.mean(beers, 'abv')

  return roundDecimal(mean, 1)
}

var filterByType = makeFilter(allBeers, 'type')

loadBeers(allBeers)

filters.addEventListener('click', function (e) {
  e.preventDefault()
  var clicked = e.target
  var filterName = clicked.dataset.filter
  var filteredBeers = []

  setActiveFilter(clicked)

  switch (filterName) {
    case 'all':
      filteredBeers = allBeers
      break
    case 'ale':
      filteredBeers = _.filter(allBeers, function (beer) {
        return beer.type === 'ipa' || beer.type === 'ale'
      })
      break
    case 'lager':
      filteredBeers = filterByType('lager')
      break
    case 'stout':
      filteredBeers = filterByType('stout')
      break
    case 'surprise':
      filteredBeers = [_.sample(allBeers)]
      break
  }

  loadBeers(filteredBeers)
})
