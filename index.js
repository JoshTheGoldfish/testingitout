const request = require('request');
const cheerio = require('cheerio');
const express = require('express');

var url = 'http://matrix.recolorado.com/Matrix/Public/Portal.aspx?k=899662XFWRB&p=AE-950363-2&L=1&rk=596538772'

var app = express();

var getPropertyData = function(url, callback) {
  request(url, function(err, res, body) {
    var $ = cheerio.load(body);
    console.log("Received data (html length): " + body.length)
    
    var data = buildDataObject($);
    console.log("Parsed data (object length): " + Object.keys(data).length);

    var property = transformData(data);

    callback(property);
  });
};

var buildDataObject = function($) {
  console.log("Inside buildDataObject($)")
  var data = {};

  // Populate with data from tables
  $('div.col-xs-12.inherit.J_sect').each(function() {
    var $that = $(this);
    data[$that.find('.col-xs-5').text().trim()] = $that.find('.col-xs-7').text().trim();
  });

  if(!objectIsEmpty(data)) {
    data['Address']     = getAddress($);
    data['Description'] = getDescription($);
  }

  return data;
};

var transformData = function(data) {
  if(Object.keys(data).length != 0) {
    return {
      "property" : {
        "address" :   data['Address'],
        "listPrice" : parseInt(data['List Price'].substring(1).replace(',', ''), 10),
        "listDate" :  data['List Date'],
        "mlsNumber" : data['MLS Number'],
        "type" :      data['Type'],
        "style" :     data['Style'],
        "site" :      data['Site Description'],
        "bedrooms"    : {
          "total" :    parseInt(data['Total Bedrooms'         ], 10),
          "main" :     parseInt(data['Bedrooms Total Main'    ], 10),
          "upper" :    parseInt(data['Bedrooms Total Upper'   ], 10),
          "lower" :    parseInt(data['Bedrooms Total Lower'   ], 10),
          "basement" : parseInt(data['Bedrooms Total Basement'], 10)
        },
        "bathrooms" : {
          "total" :    parseInt(data['Total Baths'             ], 10),
          "full":      parseInt(data['Full Baths'              ], 10),
          "3/4" :      parseInt(data['3/4 Baths'               ], 10),
          "1/2" :      parseInt(data['1/2 Baths'               ], 10),
          "1/4" :      parseInt(data['1/4 Baths'               ], 10),
          "main" :     parseInt(data['Bathrooms Total Main'    ], 10),
          "upper" :    parseInt(data['Bathrooms Total Upper'   ], 10),
          "lower" :    parseInt(data['Bathrooms Total Lower'   ], 10),
          "basement" : parseInt(data['Bathrooms Total Basement'], 10)
        },
        "squareFeet" : {
          "total" :    parseInt(data['SqFt Total'   ].replace(',', ''), 10),
          "main" :     'SqFt Main'     in data ? parseInt(data['SqFt Main'    ].replace(',', ''), 10) : 0,
          "finished" : 'SqFt Finished' in data ? parseInt(data['SqFt Finished'].replace(',', ''), 10) : 0,
          "above" :    'SqFt Above'    in data ? parseInt(data['SqFt Above'   ].replace(',', ''), 10) : 0
        },
        "description" : data['Description']
      }
    };
  } else {
    return {"message":"no data received"}
  }
}

var getAddress = function($) {
  var wrapper = $('div#wrapperTable');
  var firstLine = wrapper.eq(1).text().trim();
  var secondLine = wrapper.eq(2).text().trim();

  var address = {
    'line1'   : firstLine,
    'line2'   : '',
    'city'    : secondLine.split(',')[0],
    'county'  : $('span.d-text.d-fontSize--small').eq(6).text(),
    'state'   : secondLine.split(' ')[1],
    'zipCode' : secondLine.split(' ')[2],
  };
  
  return address;
};

var getDescription = function($) {
  return $('span.d-textSoft.d-fontSize--small').first().text().trim();
};

var objectIsEmpty = function(obj) {
  return Object.keys(obj).length == 0
}

getPropertyData(url, function(result) {
  console.log(result);
})

app.get('/property', function(req, response) {
  getPropertyData(req.query.url, function(result) {
    console.log(result);
    response.json(result);
  });
});

app.listen(8081);