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
var Lizard = require('../../sub/lizard');
var DB;
var DIC;
const KO_MORSE = {".-..":"ㄱ", "..-.":"ㄴ", "-...":"ㄷ", "...-":"ㄹ", "--":"ㅁ", ".--":"ㅂ", "--.":"ㅅ", "-.-":"ㅇ", ".--.":"ㅈ", "-.-.":"ㅊ", "-..-":"ㅋ", "--..":"ㅌ", "---":"ㅍ", ".---":"ㅎ", ".":"ㅏ", "..":"ㅑ", "-":"ㅓ", "...":"ㅕ", ".-":"ㅗ", "-.":"ㅛ", "....":"ㅜ", ".-.":"ㅠ", "-..":"ㅡ", "..-":"ㅣ", "--.-":"ㅐ", "-.--":"ㅔ" };
const EN_MORSE = { ".-": "a", "-...": "b", "-.-.": "c", "-..": "d", ".": "e", "..-.": "f", "--.": "g", "....": "h", "..": "i", ".---": "j", "-.-": "k", ".-..": "l", "--": "m", "-.": "n", "---": "o", ".--.": "p", "--.-": "q", ".-.": "r", "...": "s", "-": "t", "..-": "u", "...-": "v", ".--": "w", "-..-": "x", "-.--": "y", "--..": "z" };
const HANGUL_INITIAL_INDEX = { "ㄱ":0, "ㄲ":1, "ㄴ":2, "ㄷ":3, "ㄸ":4, "ㄹ":5, "ㅁ":6, "ㅂ":7, "ㅃ":8, "ㅅ":9, "ㅆ":10, "ㅇ":11, "ㅈ":12, "ㅉ":13, "ㅊ":14, "ㅋ":15, "ㅌ":16, "ㅍ":17, "ㅎ":18 };
const HANGUL_MEDIAL_INDEX = { "ㅏ":0, "ㅐ":1, "ㅑ":2, "ㅒ":3, "ㅓ":4, "ㅔ":5, "ㅕ":6, "ㅖ":7, "ㅗ":8, "ㅘ":9, "ㅙ":10, "ㅚ":11, "ㅛ":12, "ㅜ":13, "ㅝ":14, "ㅞ":15, "ㅟ":16, "ㅠ":17, "ㅡ":18, "ㅢ":19, "ㅣ":20 };
const HANGUL_MEDIAL_COMBINE = { "ㅗㅏ":"ㅘ", "ㅗㅐ":"ㅙ", "ㅗㅣ":"ㅚ", "ㅜㅓ":"ㅝ", "ㅜㅔ":"ㅞ", "ㅜㅣ":"ㅟ", "ㅡㅣ":"ㅢ" };
const HANGUL_FINAL_INDEX = { "":0, "ㄱ":1, "ㄲ":2, "ㄳ":3, "ㄴ":4, "ㄵ":5, "ㄶ":6, "ㄷ":7, "ㄹ":8, "ㄺ":9, "ㄻ":10, "ㄼ":11, "ㄽ":12, "ㄾ":13, "ㄿ":14, "ㅀ":15, "ㅁ":16, "ㅂ":17, "ㅄ":18, "ㅅ":19, "ㅆ":20, "ㅇ":21, "ㅈ":22, "ㅊ":23, "ㅋ":24, "ㅌ":25, "ㅍ":26, "ㅎ":27 };
const HANGUL_FINAL_COMBINE = { "ㄱㅅ":"ㄳ", "ㄴㅈ":"ㄵ", "ㄴㅎ":"ㄶ", "ㄹㄱ":"ㄺ", "ㄹㅁ":"ㄻ", "ㄹㅂ":"ㄼ", "ㄹㅅ":"ㄽ", "ㄹㅌ":"ㄾ", "ㄹㅍ":"ㄿ", "ㄹㅎ":"ㅀ", "ㅂㅅ":"ㅄ" };

const LANG_STATS = { 'ko': {
	reg: /^[가-힣]{2,5}$/,
	add: [ 'type', Const.KOR_GROUP ],
	len: 64,
	min: 5
}, 'en': {
	reg: /^[a-z]{4,10}$/,
	len: 100,
	min: 10
}};

exports.init = function(_DB, _DIC){
	DB = _DB;
	DIC = _DIC;
};
exports.getTitle = function(){
	var R = new Lizard.Tail();
	var my = this;
	
	setTimeout(function(){
		R.go("①②③④⑤⑥⑦⑧⑨⑩");
	}, 500);
	return R;
};
exports.roundReady = function(){
	var my = this;
	var words = [];
	var conf = LANG_STATS[my.rule.lang];
	var len = conf.len;
	var i, w;
	
	clearTimeout(my.game.turnTimer);
	my.game.round++;
	my.game.roundTime = my.time * 1000;
	if(my.game.round <= my.round){
		DB.kkutu[my.rule.lang].find([ '_id', conf.reg ], [ 'hit', { $gte: 1 } ], conf.add).limit(1234).on(function($docs){
			$docs.sort(function(a, b){ return Math.random() < 0.5; });
			while(w = $docs.shift()){
				words.push(w._id);
				i = w._id.length;
				if((len -= i) <= conf.min) break;
			}
			words.sort(function(a, b){ return b.length - a.length; });
			my.game.words = [];
			my.game.board = getBoard(words, conf.len);
			my.byMaster('roundReady', {
				round: my.game.round,
				board: my.game.board
			}, true);
			my.game.turnTimer = setTimeout(my.turnStart, 2400);
		});
	}else{
		my.roundEnd();
	}
};
exports.turnStart = function(){
	var my = this;
	
	my.game.late = false;
	my.game.roundAt = (new Date()).getTime();
	my.game.qTimer = setTimeout(my.turnEnd, my.game.roundTime);
	my.byMaster('turnStart', {
		roundTime: my.game.roundTime
	}, true);
};
exports.turnEnd = function(){
	var my = this;
	
	my.game.late = true;
	
	my.byMaster('turnEnd', {});
	my.game._rrt = setTimeout(my.roundReady, 3000);
};
exports.submit = function(client, text, data){
	var my = this;
	var play = (my.game.seq ? my.game.seq.includes(client.id) : false) || client.robot;
	var score, i;
	var originalText = text;
	var morseDecoded;
	var morseMap;
	var composedText;

	if(my.opts.morse && (my.rule.lang == "ko" || my.rule.lang == "en")){ // LZB - Added Morse
		morseMap = my.rule.lang == "ko" ? KO_MORSE : EN_MORSE;
		morseDecoded = decodeMorseInput(text, morseMap);
		if(morseDecoded){
			if(my.rule.lang == "ko"){
				composedText = composeHangulInput(morseDecoded);
				text = composedText || morseDecoded;
			}else{
				text = morseDecoded;
			}
		}
		// else if(!client.robot) return client.publish('turnError', { code: 488, value: originalText }, true);
		else if (!client.robot) return client.chat(text);
	}else if(my.rule.lang == "ko"){
		composedText = composeHangulInput(text);
		if(composedText) text = composedText;
	}

	if(!my.game.words) return;
	if(!text) return;
	if(!play) return client.chat(text);
	if(text.length < (my.opts.no2 ? 3 : 2)){
		return client.chat(text);
	}
	if(my.game.words.indexOf(text) != -1){
		return client.chat(text);
	}
	DB.kkutu[my.rule.lang].findOne([ '_id', text ]).limit([ '_id', true ]).on(function($doc){
		if(!my.game.board) return;
		
		var newBoard = my.game.board;
		var _newBoard = newBoard;
		var wl;
		
		if($doc){
			wl = $doc._id.split('');
			for(i in wl){
				newBoard = newBoard.replace(wl[i], "");
				if(newBoard == _newBoard){ // 그런 글자가 없다.
					client.chat(text);
					return;
				}
				_newBoard = newBoard;
			}
			// 성공
			score = my.getScore(text);
			my.game.words.push(text);
			my.game.board = newBoard;
			client.game.score += score;
			client.publish('turnEnd', {
				target: client.id,
				value: text,
				score: score
			}, true);
			client.invokeWordPiece(text, 1.1);
		}else{
			client.chat(text);
		}
	});
	/*if((i = my.game.words.indexOf(text)) != -1){
		score = my.getScore(text);
		my.game.words.splice(i, 1);
		client.game.score += score;
		client.publish('turnEnd', {
			target: client.id,
			value: text,
			score: score
		}, true);
		if(!my.game.words.length){
			clearTimeout(my.game.qTimer);
			my.turnEnd();
		}
		client.invokeWordPiece(text, 1.4);
	}else{
		client.chat(text);
	}*/
};
exports.getScore = function(text, delay){
	var my = this;

	return Math.round(Math.pow(text.length - 1, 1.6) * 8);
};
function getBoard(words, len){
	var str = words.join("").split("");
	var sl = str.length;
	
	while(sl++ < len) str.push("　");
	
	return str.sort(function(){ return Math.random() < 0.5; }).join("");
}
function decodeMorseInput(input, morseMap){ // LZB - Added Morse
	var normalized;
	var tokens;
	var output = "";
	var i, token, parts, j, part, ch;
	var map = morseMap || EN_MORSE;

	if(typeof input !== "string") return null;
	normalized = input.trim();
	if(!normalized) return null;
	if(!/^[\.\-\s\/|]+$/.test(normalized)) return null;

	normalized = normalized.replace(/\|/g, "/");
	tokens = normalized.split(/\s+/);
	for(i=0; i<tokens.length; i++){
		token = tokens[i];
		if(!token) continue;
		parts = token.split("/");
		for(j=0; j<parts.length; j++){
			part = parts[j];
			if(!part) continue;
			ch = map[part];
			if(!ch) return null;
			output += ch;
		}
	}

	return output || null;
}
function composeHangulInput(input){
	var chars;
	var out = "";
	var i = 0;
	var initial, medialRes, finalRes;
	var lead, vowel, tail;

	if(typeof input !== "string") return input;
	chars = Array.from(input);

	while(i < chars.length){
		lead = chars[i];
		initial = HANGUL_INITIAL_INDEX[lead];
		if(initial === undefined){
			out += lead;
			i++;
			continue;
		}

		medialRes = readMedial(chars, i + 1);
		if(!medialRes){
			out += lead;
			i++;
			continue;
		}

		vowel = medialRes.medial;
		finalRes = readFinal(chars, medialRes.next);
		tail = finalRes ? finalRes.final : "";
		out += String.fromCharCode(0xAC00 + (initial * 21 + HANGUL_MEDIAL_INDEX[vowel]) * 28 + HANGUL_FINAL_INDEX[tail]);
		i = finalRes ? finalRes.next : medialRes.next;
	}

	return out;
}
function readMedial(chars, index){
	var first = chars[index];
	var second = chars[index + 1];
	var combined;

	if(first == null) return null;
	if(HANGUL_MEDIAL_INDEX[first] === undefined) return null;

	if(second != null){
		combined = HANGUL_MEDIAL_COMBINE[first + second];
		if(combined) return { medial: combined, next: index + 2 };
	}
	return { medial: first, next: index + 1 };
}
function readFinal(chars, index){
	var first = chars[index];
	var second = chars[index + 1];
	var cluster;

	if(first == null) return null;
	if(HANGUL_FINAL_INDEX[first] === undefined || HANGUL_FINAL_INDEX[first] === 0) return null;

	if(second != null){
		cluster = HANGUL_FINAL_COMBINE[first + second];
		if(cluster && HANGUL_MEDIAL_INDEX[chars[index + 2]] === undefined){
			return { final: cluster, next: index + 2 };
		}
	}

	if(HANGUL_MEDIAL_INDEX[second] !== undefined) return null;
	return { final: first, next: index + 1 };
}