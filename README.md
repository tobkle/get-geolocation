# get-geolocation

Get Geolocation with Address String from Google Maps

You need a Google API key with access to the Google Maps Geolocation API.
## Installation
```bash
npm install get-geolocation
```

## Example
```js
import fs from 'fs'
import path from 'path'
// for parsing a tab separated text file
import { tsvParse } from 'd3-dsv'

import geo from 'get-geolocation'
const GoogleApiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'

const filenameIn = path.resolve('public/source.txt')
const filenameOut = path.resolve('public/target.txt')
const content = fs.readFileSync(filenameIn, { encoding: 'utf8' })
const parsedContent = tsvParse(content)
/*
parsedContent = [
  {
    "key": "Google-HQ",
    "address_string": "1600 Amphitheatre Parkway Mountain View CA 94043 USA"
  }
]
 */

  const addGeolocation = new geo({
      GoogleApiKey: GoogleApiKey,
      keyField: 'key',
      sourceField: 'address_string',
      targetField: 'geo'
  }).add(parsedContent, result => {
      const output = JSON.stringify(result, null, 2)
      fs.writeFileSync(filenameOut, output, { encoding: 'utf8' })
  })

  /*
     filename: "public/target.txt":
     [
      {
        "key": "Google-HQ",
        "address_string": "1600 Amphitheatre Parkway Mountain View CA 94043 USA"
        "geo": {
          "lat": 37.422782,
          "lng": -122.085099,
          "country": {
            "short_name": "USA",
            "long_name": "United States of America"
          }
        }
      },
     ]
  */
```