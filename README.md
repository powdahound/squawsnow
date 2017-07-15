# @SquawSnow Tweeter

A small project to tweet new snowfalls at Squaw Valley ski area via [@SquawSnow](https://twitter.com/squawsnow). Note that this project isn't officially affiliated with or maintained by Squaw.

It scrapes their [snowfalls page](http://squawalpine.com/skiing-riding/weather-conditions-webcams/squaw-valley-snowfall-tracker) and sends out a tweet whenever a new entry is detected.

A hacked together PHP script running on an old webhost powered these updates from 2010-2014 until I decided to rebuild it in node.js and run it on Heroku. As my first "real" node project I'm sure there are some odd coding practices at work here. :)

## Running locally

1. Check out the repo
2. Install the [Heroku toolbelt](https://devcenter.heroku.com/articles/heroku-cli)
3. Install node modules with `npm install` or `yarn` (assuming you already have node >=8.x)
4. Override necessary environment variables in `.env`
5. `heroku local`
6. `curl -X POST http://localhost:3000/update?key=override-me`

## Running on Heroku
1. Check out the repo
2. `heroku create`
3. `git push heroku master`
4. Set up environment vars using `heroku config` (they're documented in `.env`)
5. Set up a [scheduler](https://devcenter.heroku.com/articles/scheduler) to `curl -X POST http://squawsnow.herokuapp.com/update?key=your-key` every hour.