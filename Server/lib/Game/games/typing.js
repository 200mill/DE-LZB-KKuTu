/**
 * Rule the words! KKuTu Online
 * Copyright (C) 2017 JJoriping(op@jjo.kr)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

var Const = require('../../const');
var TYL = require('./typing_const');
var Lizard = require('../../sub/lizard');
var DB;
var DIC;

var LONGWORD_MIN_LENGTH = 6;
var LONGWORD_MAX_LENGTH = 12;
var WORD_MIN_LENGTH = 2;
var WORD_MAX_LENGTH = 5;
var LIST_LENGTH = 200;
var DOUBLE_VOWELS = [ 9, 10, 11, 14, 15, 16, 19 ];
var DOUBLE_TAILS = [ 3, 5, 6, 9, 10, 11, 12, 13, 14, 15, 18 ];

function traverse(func){
	var my = this;
	var i, o;
	
	for(i in my.game.seq){
		if(!(o = DIC[my.game.seq[i]])) continue;
		if(!o.game) continue;
		func(o);
	}
}
exports.init = function(_DB, _DIC){
	DB = _DB;
	DIC = _DIC;
};
exports.getTitle = function(){
	var R = new Lizard.Tail();
	var my = this;
	var i, j;
	// LZB - Added longword option, 코딩초보이슈, 이상한 로직이 있을 수 있음
	
	// if (my.opts.proverb && my.opts.longword) { // 둘다 누르면 안된다... 하지만 랜덤으로 나오게 수정 <- 코딩초보이슈 가능은 하지만 긴 단어때 속담처럼 나오는 이슈
	// 	// if (Math.random() < 0.5){ // 속담
	// 	if (false) { // for testing
	// 		pick(TYL.PROVERBS[my.rule.lang]);
	// 	} else { // 긴 단어
	// 		DB.kkutu[my.rule.lang].find([ '_id', new RegExp(`^.{${LONGWORD_MIN_LENGTH},${LONGWORD_MAX_LENGTH}}$`) ], [ 'hit', { $gte: 1 } ]).limit(416).on(function($res){
	// 			pick($res.map(function(item){ return item._id; }));
	// 		});

	// 	}
	// }

	if(my.opts.proverb) pick(TYL.PROVERBS[my.rule.lang]); // 속담

	else if (my.opts.longword) { // 긴 단어
		DB.kkutu[my.rule.lang].find([ '_id', new RegExp(`^.{${LONGWORD_MIN_LENGTH},${LONGWORD_MAX_LENGTH}}$`) ], [ 'hit', { $gte: 1 } ]).limit(416).on(function($res){
			pick($res.map(function(item){ return item._id; }));
		});
	}

	else DB.kkutu[my.rule.lang].find([ '_id', new RegExp(`^.{${WORD_MIN_LENGTH},${WORD_MAX_LENGTH}}$`) ], [ 'hit', { $gte: 1 } ]).limit(416).on(function($res){ // 일반 단어
		pick($res.map(function(item){ return item._id; }));
	});
	function pick(list){
		var data = [];
		var len = list.length;
		var arr;
		
		for(i=0; i<my.round; i++){
			arr = [];
			for(j=0; j<LIST_LENGTH; j++){
				arr.push(list[Math.floor(Math.random() * len)]);
			}
			data.push(arr);
		}
		my.game.lists = data;
		R.go("①②③④⑤⑥⑦⑧⑨⑩");
	}
	traverse.call(my, function(o){
		o.game.spl = 0;
	});
	return R;
};
exports.roundReady = function(){
	var my = this;
	var scores = {};
	
	if(!my.game.lists) return;
	
	my.game.round++;
	my.game.roundTime = my.time * 1000;
	if(my.game.round <= my.round){
		my.game.clist = my.game.lists.shift();
		my.byMaster('roundReady', {
			round: my.game.round,
			list: my.game.clist
		}, true);
		setTimeout(my.turnStart, 2400);
	}else{
		traverse.call(my, function(o){
			scores[o.id] = Math.round(o.game.spl / my.round);
		});
		my.roundEnd({ scores: scores });
	}
};
exports.turnStart = function(){
	var my = this;
	
	my.game.late = false;
	traverse.call(my, function(o){
		o.game.miss = 0;
		o.game.index = 0;
		o.game.semi = 0;
	});
	my.game.qTimer = setTimeout(my.turnEnd, my.game.roundTime);
	my.byMaster('turnStart', { roundTime: my.game.roundTime }, true);
};
exports.turnEnd = function(){
	var my = this;
	var spl = {};
	var sv;
	
	my.game.late = true;
	traverse.call(my, function(o){
		sv = (o.game.semi + o.game.index - o.game.miss) / my.time * 60;
		spl[o.id] = Math.round(sv);
		o.game.spl += sv;
	});
	my.byMaster('turnEnd', {
		ok: false,
		speed: spl
	});
	my.game._rrt = setTimeout(my.roundReady, (my.game.round == my.round) ? 3000 : 10000);
};
exports.submit = function(client, text){
	var my = this;
	var score;
	
	if(!client.game) return;
	
	if(my.game.clist[client.game.index] == text){
		score = my.getScore(text);
		
		client.game.semi += score;
		client.game.score += score;
		client.publish('turnEnd', {
			target: client.id,
			ok: true,
			value: text,
			score: score
		}, true);
		client.invokeWordPiece(text, 0.5);
	}else{
		client.game.miss++;
		client.send('turnEnd', { error: true });
	}
	if(!my.game.clist[++client.game.index]) client.game.index = 0;
};
exports.getScore = function(text){
	var my = this;
	var i, len = text.length;
	var r = 0, s, t;
	
	switch(my.rule.lang){
		case 'ko':
			for(i=0; i<len; i++){
				s = text.charCodeAt(i);
				if(s < 44032){
					r++;
				}else{
					t = (s - 44032) % 28;
					r += t ? 3 : 2;
					if(DOUBLE_VOWELS.includes(Math.floor(((text.charCodeAt(i) - 44032) % 588) / 28))) r++;
					if(DOUBLE_TAILS.includes(t)) r++;
				}
			}
			return r;
		case 'en': return len;
		default: return r;
	}
};