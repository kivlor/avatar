const casper = require('casper').create();
const system = require('system'); 

const username = system.env.GRAVATAR_USER || false;
const password = system.env.GRAVATAR_PASSWORD || false;

if (!username || !password) {
  console.log('username or password missing');
  casper.exit();
}

const raw = 'https://raw.githubusercontent.com/kivlor/avatar'
const avatar = raw + '/e16d614ebdade8c16f8ce187fdda729ea4780f66/10x.png';
const emails = [
  'f504dead2caa8afc3dd5160b7d697e80',
  '81118ed0c0840e121a718eab87a44b5f',
  'ef4d57830a7631832ba7a89eb2094213',
];

casper.start('https://en.gravatar.com/connect/');

// catch login redirect
casper.waitForUrl(/authorize\?client_id=/, function() {
  this.waitForSelector('form#authorize');
});

// fill out login form and submit
casper.then(function () {
  this.fill('form#authorize', {
    log: username,
    pwd: password,
  }, true);
});

// catch emails redirect
casper.waitForUrl(/en\.gravatar\.com\/emails/, function() {
  console.log('logged in...');
});

// navigate to url upload
casper.thenOpen('https://en.gravatar.com/gravatars/new/url', function() {
  this.waitForSelector('input#gravatar_url');
});

// fill out url form and submit
casper.then(function () {
  this.fill('form.standard', {
    gravatar_url: avatar,
  }, true);
});

// catch crop redirect
casper.waitForUrl(/en\.gravatar\.com\/gravatars\/crop/, function() {
  console.log('uploaded...');
  this.waitForSelector('input[value="Crop and Finish!"]');
});

// select entire image and crop
casper.then(function () {
  this.click('a#compassc', 10, 10);
  this.click('input[value="Crop and Finish!"]', 10, 10);
});

// catch rating redirect
casper.waitForUrl(/en.gravatar.com\/gravatars\/edit-rating/, function() {
  console.log('cropped...');
  this.waitForSelector('input#ratedg');
});

// click g rating input
casper.then(function () {
  this.click('input#ratedg', 10, 10);
});

// catch apply redirect
casper.waitForUrl(/en.gravatar.com\/gravatars\/apply/, function() {
  console.log('rated...');
  this.waitForSelector('input#' + emails[0]);
});

// select each email and submit
casper.then(function () {
  for (var index = 0; index <= emails.length; index += 1) {
    console.log('input#' + emails[index]);
    this.click('input#' + emails[index], 5, 5);
  }

  this.click('input#gsubmitbuttonoff', 10, 10);
});

// catch rating redirect
casper.waitForUrl(/en.gravatar.com\/emails/, function() {
  console.log('applied...');
  console.log('complete!');
});

casper.run();
