var cheerio = require('cheerio');

var lan = {
    bangladesh : 'urdu',
    russia : 'russian',
    pakistan : '',
    egypt : ''
}

var match = {
    bangladesh : 'i-bd',
    russia : 'i-ru',
    pakistan : 'i-pk',
    egypt : 'i-eg'
}

function configFn(body, options) {
    
    var tagStr = match[body.country];
    tagStr = tagStr + '-news';
    var newDetailSelectors = {
        "title": body.titleS,
        "date": body.dateS, 
        "content": body.contentS,
        "coverPic": body.coverS,
        "keywords" : body.keywordsS,
        "summary" : "",
        "catFetched" : "",
        "videoPage" : ""                
    }
    
    var configFn = {
        // 基本信息，list.js和detail.js共用
        "userAgent" : body.agent,
        "author" : "administrator",
        "newsTag" : tagStr,
        "seed" : options.seed,
        "language" : body.lan,
        "country" : body.country,
        "domain" : options.domain, // 域名
        "timeDiff" : body.diff, // 爬取地区和服务器的时差，如埃及比中国早6小时则为－6。此处默认服务器为北京时间
        "route" : "", // 路由信息，传到route.js
        "cat" : "", // 若该站用统一一级分类，直接在此处填写
        "tag" : "", // 若该站用统一标签，直接在此处填写
        // 详情页爬取信息，传到detail.js
        "detail" : {
            "detailSelectors" : newDetailSelectors, // 详情页爬取位置
            "addPic" : 1, //是否往内容最上添加图片（爬回的封面图）
            "remove" : ['script'], 
            //需要去除的能直接定位的多余文案。其它对内容的自定义处理放在‘contentFn’中
            "contentFn" : [], // 自定义内容处理函数，参数为用cheerio加载完data.content后的$ 
            "dateFn" : '', // 处理日期的函数，若此处为空字符串则按默认方法生成日期，参数为页面抓到的日期
            "catFromPage" : "",// catFromPage为从页面中获取的一级分类，若有的话
            "catFromUrl": "",// catFromUrl为从url获取的一级分类，若有的话，此处应传入正则
            "getCatMethod" : 0 // 0:不需要特殊获取一级分类, 1:catFromPage, 2:catFromUrl               
        }     
    }
    return configFn;
}

var configJson = {
    // 基本信息，list.js和detail.js共用
    "userAgent" : "",
    "author" : "administrator",
    "newsTag" : "i-pk-news",
	"seed" : "abbtakk",
    "language" : "urdu",
    "country" : "pakistan",
	"domain" : "http://urdu.abbtakk.tv", // 域名
	"timeDiff" : -3, // 爬取地区和服务器的时差，如埃及比中国早6小时则为－6。此处默认服务器为北京时间
	"route" : [ 
		[/category/, 'list'], 
		[/.+/, 'detail'] 
	], // 路由信息，传到route.js
	"cat" : '', // 若该站用统一一级分类，直接在此处填写
	"tag" : '', // 若该站用统一标签，直接在此处填写
    // 详情页爬取信息，传到detail.js
	"detail" : {
		"detailSelectors" : {
		    "title": ".name.post-title.entry-title/text()",
		    "date": "", 
		    "content": ".post-inner/html()",
		    "coverPic[]": ".single-post-thumb img@src",
		    "keywords" : 'meta[name="keywords"]@content',
		    "summary" : "",
		    "catFetched" : "",
		    "videoPage" : ""
		}, // 详情页爬取位置
		"addPic" : 1, //是否往内容最上添加图片（爬回的封面图）
		"remove" : ['script'], 
		//需要去除的能直接定位的多余文案。其它对内容的自定义处理放在‘contentFn’中
		"contentFn" : [], // 自定义内容处理函数，参数为用cheerio加载完data.content后的$ 
		"dateFn" : '', // 处理日期的函数，若此处为空字符串则按默认方法生成日期，参数为页面抓到的日期
		"catFromPage" : "",// catFromPage为从页面中获取的一级分类，若有的话
		"catFromUrl": "",// catFromUrl为从url获取的一级分类，若有的话，此处应传入正则
		"getCatMethod" : 0 // 0:不需要特殊获取一级分类, 1:catFromPage, 2:catFromUrl
	}	
}

module.exports = {
    match : match,
    configFn : configFn
}

