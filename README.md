# @SquawSnow Tweeter

A small project to tweet new snowfalls at Squaw Valley ski area via @SquawSnow. Note that this project isn't officially affiliated with or maintained by Squaw.

It scrapes their [snowfalls page](http://squawalpine.com/skiing-riding/weather-conditions-webcams/squaw-valley-snowfall-tracker) and sends out a tweet whenever a new entry is detected.

A hacked together PHP script running on an old webhost powered these updates from 2010-2014 until I decided to rebuild it in node.js and run it on Heroku. As my first "real" node project I'm sure there are some odd coding practices at work here. :)

## Running locally

1. Check out the repo
2. Have the heroku toolkit installed
3. `npm install` (assuming you already have node >=0.11.x, npm, etc)
4. Override necessary environment variables in `.env`
5. `foreman start`

## Running on Heroku
1. Check out the repo
2. `heroku create`
3. `git push heroku master`
4. Set up environment vars using `heroku config` (they're documented in `.env`)
5. Set up a [scheduler](https://devcenter.heroku.com/articles/scheduler) to `node --harmony main.js` every hour.
