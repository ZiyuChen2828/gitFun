var express = require('express');
var router = express.Router();

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var bodyParser = require('body-parser');
var mkdirp = require('mkdirp');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var util = require('./components/serverHelper');
var Honey = require('./components/honey');
var tools = require('./components/beeTools');

var seedG,
    newsTag;
var info;
var htmlFetched;
var bid = {};
var honey = {};
var extend = {};

var honeycontent;

var SVAEPATH = './i-fetch/config',
    OUTPATH = './i-fetch/honey-output/',
    DOMAINRegExp = /http\:\/\/[^\/]+\.(\w+\.\w+)\/.+/,
    TIMEOUT = 8000;
    
function saveConfig(body, options, savePath){
    // if it's a new site never been scraped, save it's configuration
    var config = util.configFn(body, options);
    //Serialize as JSON and Write it to a file
    fs.writeFileSync(savePath, JSON.stringify(config));
}

function outputHoney(honeyOut, outPath){
    if (!fs.existsSync(outPath)){
        fs.writeFileSync(outPath, JSON.stringify({}));
    }
     // add to file
    var honeys = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    var id = honeyOut.bid;
    honeys[id] = honeyOut;
    fs.writeFileSync(outPath, JSON.stringify(honeys));
}

// get the configuration data from config.js
function getConfig(req, res, next){
    
    var domain = DOMAINRegExp.exec(req.body.url)[1];
    var seed = domain.split('.')[0];
    seedG = seed;
    TIMEOUT = req.body.timeout;
    
    // 如果从interface有输入选择器，保存配置到i-fetch
    if (req.body.contentS){
        
        console.log('new site detected...');
        
        var opt = {};
        opt.domain = domain;
        opt.seed = seed;
        opt.timediff = req.body.diff;
        var savePath = path.resolve(__dirname, SVAEPATH, opt.seed + '.json');
        
        console.log('saving file...');
        saveConfig(req.body, opt, savePath); 
        
        tools.ini('detail', req.body.url, savePath);
        info = tools.info;
        newsTag = info.newsTag;
        console.log('printing info...');
        console.log(info);
        next();
    }
    
    // 否则从bee文件夹里读取已有配置
    else{
        console.log('getting config...');
        var country = req.body.country;

        var dirname = path.resolve(__dirname, '../../bee', util.match[country], domain, 'tools.js');

        tools = require(dirname);
        tools.ini('detail', req.body.url);
        info = tools.info;

        console.log('printing info...');
        console.log(info);        
        next();        
    }
}

// request the target webpage 
function doReq(req, res, next){
    
  console.log('doing request...');
  
  var opt = {};
  opt.title = info.detail.title;
  opt.content = info.detail.content;
  opt.cover = info.detail.coverPic;
  opt.keywords = info.detail.keywords;
  opt.date = info.detail.date;
  opt.url = req.body.url;

  request(opt.url, function(error, res, html){
      if(!error){
        htmlFetched = html;
      }
  });
  setTimeout(function(){
      console.log('constructing honey...');
      Honey.options = Honey.grab(htmlFetched, opt);
      Honey.honey = Honey.set(Honey.options, info);
      honey = Honey.honey;
      honeycontent = honey.pages[0].content;
      console.log(honey);
      next();
  }, TIMEOUT);
};

//router.set('view engine', 'ejs');

var middleware = [urlencodedParser, getConfig, doReq];
router.use('/result$', middleware);

router.get('/', function(req, res){
    res.render(__dirname + '/views/index.ejs', {title: '', cover: '', img: '', date: '', cat: '', content: '', hasFetched: 0, hasData: 0});
});

router.post('/', function(req, res){
    res.render(__dirname + '/views/index.ejs', {title: '', cover: '', img: '', date: '', cat: '', content: '', hasFetched: 0, hasData: 0});
});

router.post('/result', function(req, res){
    
    console.log('getting result...');
    taskurl = req.body.url;
    console.log(honey);
    res.render(__dirname + '/views/index.ejs', {title: honey.title, cover: honey.coverPic, img: honey.coverPic, date: honey.sourcePublishLabel, cat: '', content: honeycontent, hasFetched: 1, hasData: 1});
    
});

router.post('/result/confirmed', urlencodedParser, function(req, res){
    console.log('confirming data...'); 

    console.log(req.body);
    // fix honey
    honey = Honey.fix(honey, req.body);
    extend = Honey.Extend(req.body);
    
    honeycontent = req.body.content;
    res.render(__dirname + '/views/index.ejs', {title: honey.title, cover: honey.coverPic, img: honey.coverPic, date: honey.sourcePublishLabel, cat: honey.categoryFirst, content: honeycontent, hasFetched: 1, hasData: 1}); 
    
    console.log('done...');
    console.log(honey);
    console.log(extend);
    var ranID = Math.floor((Math.random() * 1000000) + 1);
    honeyOut = {
        bid : ranID,
        tag : newsTag,
        honey : honey,
        extend : extend
    }
    console.log(honeyOut);
    outputHoney(honeyOut, path.resolve(__dirname, OUTPATH, seedG + '.json'));

});

module.exports = router;
